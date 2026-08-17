export function toNonNegativeNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function normalizeRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n > 1) return n / 100;
  return Math.min(1, Math.max(0, n));
}

/**
 * Estimate cached input and output when only total input tokens are known.
 * @param {number|string} inputTokens Total daily input tokens.
 * @param {object} options
 * @param {number} options.cacheHitRate Fraction between 0 and 1 (or percentage number).
 * @param {number} options.outputRatio Fraction between 0 and 1 (or percentage number).
 */
export function estimateDailyUsage(inputTokens, { cacheHitRate = 0.3, outputRatio = 0.2 } = {}) {
  const input = toNonNegativeNumber(inputTokens);
  const cacheRate = normalizeRate(cacheHitRate);
  const outRate = normalizeRate(outputRatio);
  return {
    input,
    cachedInput: Math.round(input * cacheRate),
    output: Math.round(input * outRate)
  };
}

/**
 * Calculate daily/monthly cost from daily token usage.
 * `usage.input` is treated as total daily input tokens; `usage.cachedInput`
 * is the portion of those input tokens that hit cache.
 *
 * @param {object} usage
 * @param {number|string} usage.input Total daily input tokens.
 * @param {number|string} [usage.cachedInput] Cached input tokens.
 * @param {number|string} [usage.output] Output tokens.
 * @param {object} model Model price object with input/cachedInput/output.
 * @param {object} [options]
 * @param {number} [options.days] Days per month, default 30.
 */
export function calculateMonthlyCost(usage, model, { days = 30 } = {}) {
  const totalInput = toNonNegativeNumber(usage.input);
  const cachedInput = Math.min(toNonNegativeNumber(usage.cachedInput), totalInput);
  const output = toNonNegativeNumber(usage.output);
  const normalInput = totalInput - cachedInput;

  const inputPrice = toNonNegativeNumber(model.input);
  const cachedPrice = model.cachedInput == null ? inputPrice : toNonNegativeNumber(model.cachedInput);
  const outputPrice = toNonNegativeNumber(model.output);

  const inputCost = (normalInput / 1_000_000) * inputPrice;
  const cachedCost = (cachedInput / 1_000_000) * cachedPrice;
  const outputCost = (output / 1_000_000) * outputPrice;
  const dailyCost = inputCost + cachedCost + outputCost;
  const monthlyCost = dailyCost * toNonNegativeNumber(days);

  return {
    totalInput,
    normalInput,
    cachedInput,
    output,
    inputCost,
    cachedCost,
    outputCost,
    dailyCost,
    monthlyCost
  };
}

/**
 * Convert an amount between CNY and USD using the given USD->CNY rate.
 */
export function convertCurrency(amount, fromCurrency, toCurrency, usdCnyRate = 7.2) {
  const value = toNonNegativeNumber(amount);
  const rate = toNonNegativeNumber(usdCnyRate) || 7.2;
  if (fromCurrency === toCurrency) return value;
  if (fromCurrency === 'USD' && toCurrency === 'CNY') return value * rate;
  if (fromCurrency === 'CNY' && toCurrency === 'USD') return value / rate;
  return value;
}

export function formatMoney(amount, currency, locale = 'zh-CN') {
  const symbol = currency === 'CNY' ? '¥' : '$';
  const value = toNonNegativeNumber(amount);
  return `${symbol}${value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatTokens(value, locale = 'zh-CN') {
  return toNonNegativeNumber(value).toLocaleString(locale);
}
