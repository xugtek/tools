import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeDensity,
  computeIntelligence,
  computeTaskCost,
  computeValue,
  formatTokensCompact,
  formatValue,
  sortRows
} from '../assets/js/llm-rank-core.js';

test('computeIntelligence averages the three benchmark scores', () => {
  const i = computeIntelligence({ terminalBench: 63.6, hle: 55.0, automationBench: 71.3 });
  assert.ok(Math.abs(i - 63.3) < 0.05);
});

test('computeIntelligence ignores missing scores', () => {
  const i = computeIntelligence({ terminalBench: 40, hle: null });
  assert.ok(Math.abs(i - 20) < 1e-9);
});

test('computeIntelligence returns zero without usable scores', () => {
  assert.equal(computeIntelligence(null), 0);
  assert.equal(computeIntelligence({}), 0);
  assert.equal(computeIntelligence({ hle: 'abc' }), 0);
});

test('computeDensity is quality-weighted tokens per second', () => {
  // Sonnet 5.5: I=63.3, S=139.1 → 88.1
  const d = computeDensity(63.3, 139.1);
  assert.ok(Math.abs(d - 88.1) < 0.1);
  assert.equal(computeDensity(0, 999), 0);
  assert.equal(computeDensity(-5, 999), 0);
});

test('computeTaskCost scales tokens by output price', () => {
  // 101,257 tokens at $0.28/M → $0.0284
  const cost = computeTaskCost(101257, 0.28);
  assert.ok(Math.abs(cost - 0.02835196) < 1e-6);
  assert.equal(computeTaskCost(0, 10), 0);
  assert.equal(computeTaskCost(1000, 0), 0);
});

test('computeValue divides intelligence by task cost', () => {
  // MiMo-V2.6-Flash: I=40.6, N=101,257, $0.28/M → ~1,433 points per dollar
  const v = computeValue(40.6, 101257, 0.28);
  assert.ok(Math.abs(v - 1432.5) < 1);
  // zero cost never divides
  assert.equal(computeValue(40, 1000, 0), 0);
  assert.equal(computeValue(0, 1000, 5), 0);
});

test('computeValue is currency-consistent via price input', () => {
  const vUsd = computeValue(44.4, 81495, 0.5);
  const vCny = computeValue(44.4, 81495, 3.6); // 3.6 = 0.5 × 7.2
  assert.ok(Math.abs(vCny - vUsd / 7.2) < 0.01);
});

test('sortRows sorts descending by default and stays stable on ties', () => {
  const rows = [
    { id: 'a', valueUsd: 10 },
    { id: 'b', valueUsd: 30 },
    { id: 'c', valueUsd: 20 },
    { id: 'd', valueUsd: 20 }
  ];
  const sorted = sortRows(rows, 'valueUsd');
  assert.deepEqual(sorted.map((r) => r.id), ['b', 'c', 'd', 'a']);
  const asc = sortRows(rows, 'valueUsd', 'asc');
  assert.deepEqual(asc.map((r) => r.id), ['a', 'c', 'd', 'b']);
  assert.notEqual(sorted, rows, 'input array must not be mutated');
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

test('sortRows sinks rows with missing keys to the bottom', () => {
  const rows = [
    { id: 'a', valueUsd: null },
    { id: 'b', valueUsd: 1 },
    { id: 'c' }
  ];
  const sorted = sortRows(rows, 'valueUsd', 'desc');
  assert.equal(sorted[0].id, 'b');
  assert.deepEqual(new Set([sorted[1].id, sorted[2].id]), new Set(['a', 'c']));
});

test('formatValue adapts precision to magnitude', () => {
  assert.equal(formatValue(1432.5), '1,433');
  assert.equal(formatValue(38.25), '38.3');
  assert.equal(formatValue(5.3), '5.3');
  assert.equal(formatValue(0), '—');
  assert.equal(formatValue(-3), '—');
});

test('formatTokensCompact abbreviates thousands', () => {
  assert.equal(formatTokensCompact(101329), '101k');
  assert.equal(formatTokensCompact(999), '999');
  assert.equal(formatTokensCompact(0), '—');
});
