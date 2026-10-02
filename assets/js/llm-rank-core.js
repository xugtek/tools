/**
 * LLM value ranking core calculations (pure functions).
 *
 * All monetary values are per 1M output tokens. Benchmark scores are
 * percentages (0-100) independently measured by Artificial Analysis.
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
 * Intelligence density: quality-weighted tokens per second.
 * D = I/100 × S  → "smart tokens per second".
 */
export function computeDensity(intelligence, speedTokensPerSec) {
  const i = toNonNegativeNumber(intelligence);
  const s = toNonNegativeNumber(speedTokensPerSec);
  return (i / 100) * s;
}

/**
 * Output-token cost of one typical benchmark task, in the given currency.
 * cost = tokensPerTask / 1M × outputPricePerM
 */
export function computeTaskCost(tokensPerTask, outputPricePerM) {
  const tokens = toNonNegativeNumber(tokensPerTask);
  const price = toNonNegativeNumber(outputPricePerM);
  return (tokens / 1000000) * price;
}

/**
 * Intelligence per unit of money: benchmark points bought per currency unit.
 * V = I ÷ taskCost. Returns 0 when the cost is not positive.
 */
export function computeValue(intelligence, tokensPerTask, outputPricePerM) {
  const i = toNonNegativeNumber(intelligence);
  const cost = computeTaskCost(tokensPerTask, outputPricePerM);
  if (cost <= 0) return 0;
  return i / cost;
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
 * Format a value score adaptively: large values lose decimals,
 * small values keep one so the low end stays readable.
 */
export function formatValue(value, locale = 'zh-CN') {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return '—';
  if (v >= 100) return Math.round(v).toLocaleString(locale);
  return v.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
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
