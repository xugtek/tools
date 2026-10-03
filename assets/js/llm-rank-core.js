/**
 * LLM value ranking core calculations (pure functions).
 *
 * All monetary values are in USD per benchmark task, independently measured
 * by Artificial Analysis (input + cache + reasoning + output tokens).
 * Benchmark scores are percentages (0-100). Time is seconds per task.
 */

export function toNonNegativeNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * Average of the selected benchmark scores (each 0-100).
 * Missing scores are ignored; returns 0 when none are available.
 */
export function computeIntelligence(evals) {
  if (!evals) return 0;
  const scores = ['terminalBench', 'hle', 'automationBench']
    .map((key) => Number(evals[key]))
    .filter((n) => Number.isFinite(n) && n >= 0);
  if (scores.length === 0) return 0;
  return scores.reduce((sum, n) => sum + n, 0) / scores.length;
}

/**
 * Built-in emphasis presets for the composite score.
 * Weights are normalized to sum 1.
 */
export const WEIGHT_PRESETS = {
  balanced: { performance: 1 / 3, cost: 1 / 3, speed: 1 / 3 },
  performance: { performance: 0.75, cost: 0.125, speed: 0.125 },
  cost: { performance: 0.2, cost: 0.6, speed: 0.2 },
  speed: { performance: 0.2, cost: 0.2, speed: 0.6 }
};

/**
 * Normalize raw weight inputs so performance + cost + speed = 1.
 * Falls back to the balanced preset when all inputs are unusable.
 */
export function normalizeWeights(raw) {
  const perf = toNonNegativeNumber(raw?.performance);
  const cost = toNonNegativeNumber(raw?.cost);
  const speed = toNonNegativeNumber(raw?.speed);
  const sum = perf + cost + speed;
  if (sum <= 0) return { ...WEIGHT_PRESETS.balanced };
  return { performance: perf / sum, cost: cost / sum, speed: speed / sum };
}

/**
 * Composite value score with per-axis min-max normalization.
 *
 * Each axis is normalized to [floor, 1] where 1 = best in the current set:
 * - performance: linear on intelligence (higher is better)
 * - cost: log scale (cost spans orders of magnitude across models)
 * - time: log scale
 *
 * score = perfN^a × costN^b × timeN^c, weights normalized to sum 1.
 * The geometric form means a model cannot compensate for a terrible axis
 * with a single strong axis. Rows missing cost or time sink to 0.
 */
export const AXIS_FLOOR = 0.05;

function normalizePositive(value, min, max, useLog) {
  const v = toNonNegativeNumber(value);
  const lo = toNonNegativeNumber(min);
  const hi = toNonNegativeNumber(max);
  if (v <= 0) return 0;
  if (hi <= lo) return 1; // degenerate axis: everyone equal -> neutral
  let ratio;
  if (useLog) {
    if (v >= hi) return AXIS_FLOOR;
    if (v <= lo) return 1;
    ratio = (Math.log(hi) - Math.log(v)) / (Math.log(hi) - Math.log(lo));
  } else {
    if (v >= hi) return 1;
    if (v <= lo) return AXIS_FLOOR;
    ratio = (v - lo) / (hi - lo);
  }
  return AXIS_FLOOR + (1 - AXIS_FLOOR) * ratio;
}

export function compositeScore(intelligence, costPerTaskUsd, timePerTaskSec, { performance, cost, speed, bounds }) {
  const c = toNonNegativeNumber(costPerTaskUsd);
  const t = toNonNegativeNumber(timePerTaskSec);
  if (c <= 0 || t <= 0) return 0;
  const w = normalizeWeights({ performance, cost, speed });
  const b = bounds || {};
  const perfN = normalizePositive(intelligence, b.minIntelligence, b.maxIntelligence, false);
  const costN = normalizePositive(c, b.minCost, b.maxCost, true);
  const timeN = normalizePositive(t, b.minTime, b.maxTime, true);
  return Math.pow(perfN, w.performance) * Math.pow(costN, w.cost) * Math.pow(timeN, w.speed);
}

/**
 * Compute composite scores for a full row set with per-axis bounds derived
 * from the set itself. Returns a new array of { ...row, score }.
 */
export function scoreRows(rows, weights) {
  const usable = rows.filter((r) => toNonNegativeNumber(r.costPerTaskUsd) > 0 && toNonNegativeNumber(r.timePerTaskSec) > 0);
  if (!usable.length) return rows.map((row) => ({ ...row, score: 0 }));
  const bounds = {
    minIntelligence: Math.min(...usable.map((r) => r.intelligence)),
    maxIntelligence: Math.max(...usable.map((r) => r.intelligence)),
    minCost: Math.min(...usable.map((r) => r.costPerTaskUsd)),
    maxCost: Math.max(...usable.map((r) => r.costPerTaskUsd)),
    minTime: Math.min(...usable.map((r) => r.timePerTaskSec)),
    maxTime: Math.max(...usable.map((r) => r.timePerTaskSec))
  };
  return rows.map((row) => ({
    ...row,
    score: compositeScore(row.intelligence, row.costPerTaskUsd, row.timePerTaskSec, { ...weights, bounds })
  }));
}

/**
 * Generic stable sort for ranking rows.
 * key: property name on the row objects; direction: 'asc' | 'desc'.
 * Ties break deterministically by row name (ascending).
 * Returns a new array; rows lacking the key sink to the bottom.
 */
export function sortRows(rows, key, direction = 'desc') {
  const sign = direction === 'asc' ? 1 : -1;
  const byName = (a, b) => String(a.name ?? a.id ?? '').localeCompare(String(b.name ?? b.id ?? ''));
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return byName(a, b);
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av === bv) return byName(a, b);
    return sign * (av - bv);
  });
}

/**
 * Format a composite score for display: 0-100 with one decimal.
 */
export function formatScore(value, locale = 'zh-CN') {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return '—';
  return (v * 100).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * Format token counts compactly: 101329 → "101k".
 */
export function formatTokensCompact(value, locale = 'zh-CN') {
  const v = toNonNegativeNumber(value);
  if (v <= 0) return '—';
  if (v < 1000) return String(Math.round(v));
  return `${Math.round(v / 1000).toLocaleString(locale)}k`;
}

/**
 * Format seconds per task as minutes with one decimal: 1840 → "30.7分".
 * The unit label is left to the caller for i18n.
 */
export function formatMinutes(timeSec, locale = 'zh-CN') {
  const v = toNonNegativeNumber(timeSec);
  if (v <= 0) return '—';
  return (v / 60).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
