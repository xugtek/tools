export function toNonNegativeNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function normalizeRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n / 100);
}

/**
 * Estimate cached input and output when only total input tokens are known.
 * All amounts are in M tokens (1 M = 1,000,000 tokens).
 * @param {number|string} inputTokens Total daily input tokens in M tokens.
 * @param {object} options
 * @param {number} options.cacheHitRate Percentage number between 0 and 100.
 * @param {number} options.outputRatio Percentage number between 0 and 100 (or higher for large outputs).
 */
export function estimateDailyUsage(inputTokens, { cacheHitRate = 90, outputRatio = 5 } = {}) {
  const input = toNonNegativeNumber(inputTokens);
  const cacheRate = normalizeRate(cacheHitRate);
  const outRate = normalizeRate(outputRatio);
  return {
    input,
    cachedInput: input * cacheRate,
    output: input * outRate
  };
}

/**
 * Calculate daily/monthly cost from daily token usage.
 * All usage amounts are in M tokens (1 M = 1,000,000 tokens).
 * `usage.input` is treated as total daily input in M tokens; `usage.cachedInput`
 * is the portion of those input tokens that hit cache.
 *
 * @param {object} usage
 * @param {number|string} usage.input Total daily input in M tokens.
 * @param {number|string} [usage.cachedInput] Cached input in M tokens.
 * @param {number|string} [usage.output] Output in M tokens.
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

  const inputCost = normalInput * inputPrice;
  const cachedCost = cachedInput * cachedPrice;
  const outputCost = output * outputPrice;
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

export function roundAdaptivePrice(value) {
  const v = toNonNegativeNumber(value);
  if (v === 0) return 0;
  let digits;
  if (v >= 100) digits = 0;
  else if (v >= 10) digits = 1;
  else if (v >= 1) digits = 2;
  else if (v >= 0.1) digits = 3;
  else digits = 4;
  return Number(v.toFixed(digits));
}

function clonePriceTriple(prices) {
  return {
    input: prices.input,
    cachedInput: prices.cachedInput,
    output: prices.output
  };
}

export function convertPriceTriple(prices, fromCurrency, toCurrency, usdCnyRate = 7.2) {
  return {
    input: roundAdaptivePrice(convertCurrency(prices.input, fromCurrency, toCurrency, usdCnyRate)),
    cachedInput: roundAdaptivePrice(convertCurrency(prices.cachedInput, fromCurrency, toCurrency, usdCnyRate)),
    output: roundAdaptivePrice(convertCurrency(prices.output, fromCurrency, toCurrency, usdCnyRate))
  };
}

function officialPriceTriple(entry) {
  if (!entry) return null;
  return {
    input: entry.input,
    cachedInput: entry.cachedInput ?? entry.input,
    output: entry.output
  };
}

export function seedPriceDrafts(modelPrices, usdCnyRate = 7.2) {
  const drafts = { CNY: officialPriceTriple(modelPrices?.CNY), USD: officialPriceTriple(modelPrices?.USD) };
  const present = drafts.CNY ? 'CNY' : drafts.USD ? 'USD' : null;
  if (present) {
    for (const currency of ['CNY', 'USD']) {
      if (!drafts[currency]) {
        drafts[currency] = convertPriceTriple(drafts[present], present, currency, usdCnyRate);
      }
    }
  }
  return drafts;
}

export function switchPriceDraft(drafts, fromCurrency, toCurrency, currentPrices, usdCnyRate = 7.2) {
  const next = {
    CNY: drafts?.CNY ? clonePriceTriple(drafts.CNY) : null,
    USD: drafts?.USD ? clonePriceTriple(drafts.USD) : null
  };

  if (fromCurrency && fromCurrency !== toCurrency) {
    next[fromCurrency] = clonePriceTriple(currentPrices);
  }

  if (!next[toCurrency]) {
    next[toCurrency] = fromCurrency === toCurrency
      ? clonePriceTriple(currentPrices)
      : convertPriceTriple(currentPrices, fromCurrency, toCurrency, usdCnyRate);
  }

  return { drafts: next, prices: next[toCurrency] };
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

/**
 * Create a comparison snapshot capturing the current calculation result.
 * Stores raw numeric values (not pre-formatted strings) so sorting and
 * re-rendering under a different locale work correctly.
 */
export function createComparisonSnapshot({ modelName, inputM, cachedInputM, outputM, dailyCny, dailyUsd, monthlyCny, monthlyUsd }) {
  return {
    id: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    modelName: String(modelName || '').trim(),
    inputM: toNonNegativeNumber(inputM),
    cachedInputM: toNonNegativeNumber(cachedInputM),
    outputM: toNonNegativeNumber(outputM),
    dailyCny: toNonNegativeNumber(dailyCny),
    dailyUsd: toNonNegativeNumber(dailyUsd),
    monthlyCny: toNonNegativeNumber(monthlyCny),
    monthlyUsd: toNonNegativeNumber(monthlyUsd),
    createdAt: Date.now()
  };
}

/**
 * Return a new array sorted by monthly cost (CNY) ascending.
 * The input array is not mutated.
 */
export function sortByMonthlyCost(items) {
  return [...items].sort((a, b) => a.monthlyCny - b.monthlyCny);
}
