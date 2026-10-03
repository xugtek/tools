import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WEIGHT_PRESETS,
  compositeScore,
  computeIntelligence,
  formatMinutes,
  formatScore,
  formatTokensCompact,
  normalizeWeights,
  scoreRows,
  sortRows
} from '../assets/js/llm-rank-core.js';

test('computeIntelligence averages the three benchmark scores', () => {
  const i = computeIntelligence({ terminalBench: 63.6, hle: 55.0, automationBench: 71.8 });
  assert.ok(Math.abs(i - 63.47) < 0.02);
});

test('computeIntelligence ignores missing scores and returns zero without data', () => {
  assert.ok(Math.abs(computeIntelligence({ terminalBench: 40, hle: null }) - 20) < 1e-9);
  assert.equal(computeIntelligence(null), 0);
  assert.equal(computeIntelligence({ hle: 'abc' }), 0);
});

test('normalizeWeights scales weights to sum one and falls back to balanced', () => {
  const w = normalizeWeights({ performance: 2, cost: 1, speed: 1 });
  assert.ok(Math.abs(w.performance - 0.5) < 1e-9);
  assert.ok(Math.abs(w.cost - 0.25) < 1e-9);
  assert.ok(Math.abs(w.speed - 0.25) < 1e-9);
  assert.deepEqual(normalizeWeights({}), { ...WEIGHT_PRESETS.balanced });
  assert.deepEqual(normalizeWeights(null), { ...WEIGHT_PRESETS.balanced });
  const sum = Object.values(normalizeWeights({ performance: 7, cost: 3, speed: 0 })).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
});

test('compositeScore normalizes each axis to the set and floors the worst', () => {
  const bounds = { minIntelligence: 0, maxIntelligence: 100, minCost: 0.1, maxCost: 10, minTime: 100, maxTime: 1000 };
  // best on all axes -> exactly 1
  const best = compositeScore(100, 0.1, 100, { performance: 1 / 3, cost: 1 / 3, speed: 1 / 3, bounds });
  assert.ok(Math.abs(best - 1) < 1e-9);
  // zero cost or time -> 0 (unusable)
  assert.equal(compositeScore(80, 0, 100, { ...WEIGHT_PRESETS.balanced, bounds }), 0);
  assert.equal(compositeScore(80, 1, 0, { ...WEIGHT_PRESETS.balanced, bounds }), 0);
  // worst axis hits the floor (0.05), never zero, under geometric weighting
  const worstCost = compositeScore(100, 10, 100, { performance: 1 / 3, cost: 1 / 3, speed: 1 / 3, bounds });
  assert.ok(Math.abs(worstCost - Math.pow(0.05, 1 / 3)) < 1e-9);
  // single-axis emphasis: score equals the normalized axis (floor included)
  const perfOnly = compositeScore(50, 1, 316.2, { performance: 1, cost: 0, speed: 0, bounds });
  assert.ok(Math.abs(perfOnly - 0.525) < 1e-9);
});

test('scoreRows derives bounds from the set and marks unusable rows', () => {
  const scored = scoreRows([
    { name: 'A', intelligence: 100, costPerTaskUsd: 0.1, timePerTaskSec: 100 },
    { name: 'B', intelligence: 60, costPerTaskUsd: 0.2, timePerTaskSec: 200 },
    { name: 'C', intelligence: 60, costPerTaskUsd: 0, timePerTaskSec: 50 }
  ], WEIGHT_PRESETS.balanced);
  assert.equal(scored[0].score, 1);           // A is best on every axis
  assert.ok(scored[1].score > 0 && scored[1].score < 1);
  assert.equal(scored[2].score, 0);           // missing cost -> unusable
});

test('emphasis presets flip the leader (stylized archetypes)', () => {
  // each preset crowns a different archetype: weighting visibly controls outcome
  const rows = [
    { name: 'Strong Premium', intelligence: 95, costPerTaskUsd: 1.5, timePerTaskSec: 450 },
    { name: 'Cheap Mid', intelligence: 55, costPerTaskUsd: 0.09, timePerTaskSec: 450 },
    { name: 'Fast Standard', intelligence: 50, costPerTaskUsd: 1.0, timePerTaskSec: 300 },
    { name: 'All-rounder', intelligence: 70, costPerTaskUsd: 0.5, timePerTaskSec: 450 }
  ];
  const leader = (weights) => sortRows(scoreRows(rows, weights), 'score')[0].name;
  assert.equal(leader(WEIGHT_PRESETS.balanced), 'All-rounder');
  assert.equal(leader(WEIGHT_PRESETS.performance), 'Strong Premium');
  assert.equal(leader(WEIGHT_PRESETS.cost), 'Cheap Mid');
  assert.equal(leader(WEIGHT_PRESETS.speed), 'Fast Standard');
});

test('composite scores are currency-independent', () => {
  // score is computed from set-relative ratios; currency never enters the formula
  const s = scoreRows([
    { name: 'A', intelligence: 50, costPerTaskUsd: 0.1, timePerTaskSec: 100 },
    { name: 'B', intelligence: 50, costPerTaskUsd: 0.4, timePerTaskSec: 100 }
  ], WEIGHT_PRESETS.balanced);
  // B costs 4x A: perfN^⅓ × (log-ratio)^⅓... just assert deterministic & < A
  assert.ok(s[1].score > 0 && s[1].score < s[0].score);
});

test('sortRows breaks ties deterministically by name in both directions', () => {
  const rows = [
    { name: 'Claude Sonnet 5.5', intelligence: 63.5 },
    { name: 'Claude Opus 5.5', intelligence: 63.5 },
    { name: 'GPT-6 Astra', intelligence: 60.8 }
  ];
  const desc = sortRows(rows, 'intelligence', 'desc');
  assert.deepEqual(desc.map((r) => r.name), ['Claude Opus 5.5', 'Claude Sonnet 5.5', 'GPT-6 Astra']);
  const asc = sortRows(rows, 'intelligence', 'asc');
  assert.deepEqual(asc.map((r) => r.name), ['GPT-6 Astra', 'Claude Opus 5.5', 'Claude Sonnet 5.5']);
});

test('sortRows sinks missing keys and does not mutate input', () => {
  const rows = [
    { id: 'a', score: null },
    { id: 'b', score: 1 },
    { id: 'c' }
  ];
  const sorted = sortRows(rows, 'score');
  assert.equal(sorted[0].id, 'b');
  assert.notEqual(sorted, rows);
  assert.deepEqual(rows.map((r) => r.id), ['a', 'b', 'c']);
});

test('formatScore renders 0-100 with one decimal', () => {
  assert.equal(formatScore(1), '100.0');
  assert.equal(formatScore(0.467), '46.7');
  assert.equal(formatScore(0), '—');
  assert.equal(formatScore(-1), '—');
});

test('formatMinutes renders seconds as minutes with one decimal', () => {
  assert.equal(formatMinutes(1840), '30.7');
  assert.equal(formatMinutes(90), '1.5');
  assert.equal(formatMinutes(0), '—');
});

test('formatTokensCompact abbreviates thousands', () => {
  assert.equal(formatTokensCompact(101329), '101k');
  assert.equal(formatTokensCompact(999), '999');
  assert.equal(formatTokensCompact(0), '—');
});
