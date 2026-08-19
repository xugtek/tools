import {
  calculateMonthlyCost,
  convertCurrency,
  createComparisonSnapshot,
  estimateDailyUsage,
  formatMoney,
  formatTokens,
  sortByMonthlyCost,
  toNonNegativeNumber
} from './token-calc-core.js';
import { getLang, t } from './i18n.js';
import { initSite } from './site.js';

const DAYS_PER_MONTH = 30;
const CUSTOM_MODEL_ID = '__custom__';
const COMPARISONS_STORAGE_KEY = 'xugtek-token-comparisons';

const elements = {
  modelSelect: document.getElementById('model-select'),
  modelName: document.getElementById('model-name'),
  priceInput: document.getElementById('price-input'),
  priceCached: document.getElementById('price-cached'),
  priceOutput: document.getElementById('price-output'),
  currencySelect: document.getElementById('currency-select'),
  dailyInput: document.getElementById('daily-input'),
  dailyCached: document.getElementById('daily-cached'),
  dailyOutput: document.getElementById('daily-output'),
  cacheRate: document.getElementById('cache-rate'),
  cacheRateRange: document.getElementById('cache-rate-range'),
  outputRatio: document.getElementById('output-ratio'),
  outputRatioRange: document.getElementById('output-ratio-range'),
  exchangeRate: document.getElementById('exchange-rate'),
  estimateSection: document.getElementById('estimate-section'),
  cacheEstimateControl: document.getElementById('cache-estimate-control'),
  outputEstimateControl: document.getElementById('output-estimate-control'),
  usageNormal: document.getElementById('usage-normal'),
  usageCached: document.getElementById('usage-cached'),
  usageOutput: document.getElementById('usage-output'),
  resultDailyCny: document.getElementById('result-daily-cny'),
  resultDailyUsd: document.getElementById('result-daily-usd'),
  resultMonthlyCny: document.getElementById('result-monthly-cny'),
  resultMonthlyUsd: document.getElementById('result-monthly-usd'),
  breakdownNormalCny: document.getElementById('breakdown-normal-cny'),
  breakdownNormalUsd: document.getElementById('breakdown-normal-usd'),
  breakdownCachedCny: document.getElementById('breakdown-cached-cny'),
  breakdownCachedUsd: document.getElementById('breakdown-cached-usd'),
  breakdownOutputCny: document.getElementById('breakdown-output-cny'),
  breakdownOutputUsd: document.getElementById('breakdown-output-usd'),
  btnPinCompare: document.getElementById('btn-pin-compare'),
  btnClearCompare: document.getElementById('btn-clear-compare'),
  compareSection: document.getElementById('compare-section'),
  compareGrid: document.getElementById('compare-grid')
};

let models = [];
let activePriceCurrency = elements.currencySelect.value;
let comparisons = loadComparisons();
let lastResult = null;

function locale() {
  return getLang() === 'en' ? 'en-US' : 'zh-CN';
}

function isBlankOrZero(value) {
  const trimmed = String(value ?? '').trim();
  if (trimmed === '') return true;
  const n = Number(trimmed);
  return Number.isFinite(n) && n === 0;
}

/**
 * Round a converted unit price to a sensible precision based on its magnitude.
 * Larger values need fewer decimals; tiny values keep more so they stay useful.
 */
function roundAdaptive(value) {
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

function setDocumentLanguage() {
  document.title = `${t('pageTitle')} - ${t('siteName')}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', getLang() === 'en'
      ? 'Estimate daily and monthly token API costs. Compare CNY/USD, cache hits, and usage estimates.'
      : '估算每日和每月 Token API 费用，支持人民币/美元双货币、缓存命中与用量估算。');
  }
}

function fillModelSelect() {
  const fragment = document.createDocumentFragment();

  const customOption = document.createElement('option');
  customOption.value = CUSTOM_MODEL_ID;
  customOption.textContent = t('modelCustom');
  fragment.appendChild(customOption);

  models.forEach((model) => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = `${model.name} · ${model.provider}`;
    fragment.appendChild(option);
  });

  elements.modelSelect.replaceChildren(fragment);
}

function getNativeCurrency() {
  return getLang() === 'en' ? 'USD' : 'CNY';
}

function getModelPriceInCurrency(model, currency, rate) {
  const prices = model.prices || {};

  // Prefer the official price in the requested currency when available.
  if (prices[currency]) {
    return {
      input: prices[currency].input,
      cachedInput: prices[currency].cachedInput ?? prices[currency].input,
      output: prices[currency].output
    };
  }

  // Otherwise convert from the language-native currency if present, else any listed currency.
  const native = getNativeCurrency();
  const baseCurrency = prices[native] ? native : Object.keys(prices)[0];
  const base = prices[baseCurrency] || { input: 0, cachedInput: 0, output: 0 };

  return {
    input: roundAdaptive(convertCurrency(base.input, baseCurrency, currency, rate)),
    cachedInput: roundAdaptive(convertCurrency(base.cachedInput ?? base.input, baseCurrency, currency, rate)),
    output: roundAdaptive(convertCurrency(base.output, baseCurrency, currency, rate))
  };
}

function applyModelToForm(model) {
  const currency = elements.currencySelect.value;
  const rate = toNonNegativeNumber(elements.exchangeRate.value) || 7.2;
  const prices = getModelPriceInCurrency(model, currency, rate);

  elements.priceInput.value = prices.input;
  elements.priceCached.value = prices.cachedInput;
  elements.priceOutput.value = prices.output;
  elements.currencySelect.value = currency;
  activePriceCurrency = currency;
}

function getCurrentModel() {
  const selectedId = elements.modelSelect.value;
  const model = models.find((item) => item.id === selectedId);
  const name = elements.modelName.value.trim() || t('modelCustom');

  if (model) {
    return {
      ...model,
      name,
      input: toNonNegativeNumber(elements.priceInput.value),
      cachedInput: toNonNegativeNumber(elements.priceCached.value),
      output: toNonNegativeNumber(elements.priceOutput.value),
      currency: elements.currencySelect.value
    };
  }

  return {
    id: CUSTOM_MODEL_ID,
    name,
    provider: '',
    currency: elements.currencySelect.value,
    input: toNonNegativeNumber(elements.priceInput.value),
    cachedInput: toNonNegativeNumber(elements.priceCached.value),
    output: toNonNegativeNumber(elements.priceOutput.value)
  };
}

function getEstimatedUsage() {
  const input = elements.dailyInput.value;
  const cachedRaw = elements.dailyCached.value.trim();
  const outputRaw = elements.dailyOutput.value.trim();

  const estimate = estimateDailyUsage(input, {
    cacheHitRate: elements.cacheRate.value,
    outputRatio: elements.outputRatio.value
  });

  return {
    input: estimate.input,
    cachedInput: isBlankOrZero(cachedRaw) ? estimate.cachedInput : toNonNegativeNumber(cachedRaw),
    output: isBlankOrZero(outputRaw) ? estimate.output : toNonNegativeNumber(outputRaw)
  };
}

function updateEstimateVisibility() {
  const cacheNeedsEstimate = isBlankOrZero(elements.dailyCached.value);
  const outputNeedsEstimate = isBlankOrZero(elements.dailyOutput.value);

  elements.cacheEstimateControl.hidden = !cacheNeedsEstimate;
  elements.outputEstimateControl.hidden = !outputNeedsEstimate;
  elements.estimateSection.hidden = !cacheNeedsEstimate && !outputNeedsEstimate;
}

function updateEstimateHints() {
  const cacheEmpty = isBlankOrZero(elements.dailyCached.value);
  const outputEmpty = isBlankOrZero(elements.dailyOutput.value);
  const estimate = estimateDailyUsage(elements.dailyInput.value, {
    cacheHitRate: elements.cacheRate.value,
    outputRatio: elements.outputRatio.value
  });

  elements.dailyCached.placeholder = cacheEmpty
    ? `≈ ${formatTokens(estimate.cachedInput, locale())} M`
    : '';
  elements.dailyOutput.placeholder = outputEmpty
    ? `≈ ${formatTokens(estimate.output, locale())} M`
    : '';
}

function bindSliderPair(numberEl, rangeEl) {
  rangeEl.addEventListener('input', () => {
    numberEl.value = rangeEl.value;
    renderCosts();
    updateEstimateVisibility();
    updateEstimateHints();
  });

  numberEl.addEventListener('input', () => {
    let value = Number(numberEl.value);
    if (!Number.isFinite(value) || value < 0) value = 0;
    const max = Number(rangeEl.max);
    if (value > max) value = max;
    rangeEl.value = value;
    renderCosts();
    updateEstimateVisibility();
    updateEstimateHints();
  });
}

function getUsdCosts(cost, usage, model, rate) {
  const usdPrices = (model.prices || {}).USD;
  if (usdPrices) {
    const usdCost = calculateMonthlyCost(usage, {
      input: usdPrices.input,
      cachedInput: usdPrices.cachedInput ?? usdPrices.input,
      output: usdPrices.output
    }, { days: DAYS_PER_MONTH });

    return {
      daily: usdCost.dailyCost,
      monthly: usdCost.monthlyCost,
      normal: usdCost.inputCost,
      cached: usdCost.cachedCost,
      output: usdCost.outputCost
    };
  }

  return {
    daily: convertCurrency(cost.dailyCost, model.currency, 'USD', rate),
    monthly: convertCurrency(cost.monthlyCost, model.currency, 'USD', rate),
    normal: convertCurrency(cost.inputCost, model.currency, 'USD', rate),
    cached: convertCurrency(cost.cachedCost, model.currency, 'USD', rate),
    output: convertCurrency(cost.outputCost, model.currency, 'USD', rate)
  };
}

function renderCosts() {
  const model = getCurrentModel();
  const usage = getEstimatedUsage();
  const rate = toNonNegativeNumber(elements.exchangeRate.value) || 7.2;

  if (usage.input <= 0) {
    const zero = '¥0.00';
    const zeroUsd = '$0.00';
    lastResult = {
      modelName: model.name,
      inputM: 0,
      cachedInputM: 0,
      outputM: 0,
      dailyCny: 0,
      dailyUsd: 0,
      monthlyCny: 0,
      monthlyUsd: 0
    };
    elements.btnPinCompare.disabled = true;
    elements.resultDailyCny.textContent = zero;
    elements.resultDailyUsd.textContent = zeroUsd;
    elements.resultMonthlyCny.textContent = zero;
    elements.resultMonthlyUsd.textContent = zeroUsd;
    elements.breakdownNormalCny.textContent = zero;
    elements.breakdownNormalUsd.textContent = zeroUsd;
    elements.breakdownCachedCny.textContent = zero;
    elements.breakdownCachedUsd.textContent = zeroUsd;
    elements.breakdownOutputCny.textContent = zero;
    elements.breakdownOutputUsd.textContent = zeroUsd;
    elements.usageNormal.textContent = '0 M';
    elements.usageCached.textContent = '0 M';
    elements.usageOutput.textContent = '0 M';
    return;
  }

  const cost = calculateMonthlyCost(usage, model, { days: DAYS_PER_MONTH });
  const usdCosts = getUsdCosts(cost, usage, model, rate);

  const dailyCny = convertCurrency(cost.dailyCost, model.currency, 'CNY', rate);
  const dailyUsd = usdCosts.daily;
  const monthlyCny = convertCurrency(cost.monthlyCost, model.currency, 'CNY', rate);
  const monthlyUsd = usdCosts.monthly;

  const normalCny = convertCurrency(cost.inputCost, model.currency, 'CNY', rate);
  const normalUsd = usdCosts.normal;
  const cachedCny = convertCurrency(cost.cachedCost, model.currency, 'CNY', rate);
  const cachedUsd = usdCosts.cached;
  const outputCny = convertCurrency(cost.outputCost, model.currency, 'CNY', rate);
  const outputUsd = usdCosts.output;

  elements.resultDailyCny.textContent = formatMoney(dailyCny, 'CNY', locale());
  elements.resultDailyUsd.textContent = formatMoney(dailyUsd, 'USD', locale());
  elements.resultMonthlyCny.textContent = formatMoney(monthlyCny, 'CNY', locale());
  elements.resultMonthlyUsd.textContent = formatMoney(monthlyUsd, 'USD', locale());
  elements.breakdownNormalCny.textContent = formatMoney(normalCny, 'CNY', locale());
  elements.breakdownNormalUsd.textContent = formatMoney(normalUsd, 'USD', locale());
  elements.breakdownCachedCny.textContent = formatMoney(cachedCny, 'CNY', locale());
  elements.breakdownCachedUsd.textContent = formatMoney(cachedUsd, 'USD', locale());
  elements.breakdownOutputCny.textContent = formatMoney(outputCny, 'CNY', locale());
  elements.breakdownOutputUsd.textContent = formatMoney(outputUsd, 'USD', locale());
  elements.usageNormal.textContent = `${formatTokens(cost.normalInput, locale())} M`;
  elements.usageCached.textContent = `${formatTokens(cost.cachedInput, locale())} M`;
  elements.usageOutput.textContent = `${formatTokens(cost.output, locale())} M`;

  lastResult = {
    modelName: model.name,
    inputM: cost.totalInput,
    cachedInputM: cost.cachedInput,
    outputM: cost.output,
    dailyCny,
    dailyUsd,
    monthlyCny,
    monthlyUsd
  };
  elements.btnPinCompare.disabled = false;
}

function loadComparisons() {
  try {
    const raw = localStorage.getItem(COMPARISONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load comparisons', error);
    return [];
  }
}

function saveComparisons() {
  try {
    localStorage.setItem(COMPARISONS_STORAGE_KEY, JSON.stringify(comparisons));
  } catch (error) {
    console.error('Failed to save comparisons', error);
  }
}

function pinCurrentResult() {
  if (!lastResult) return;
  const snapshot = createComparisonSnapshot(lastResult);
  comparisons = sortByMonthlyCost([...comparisons, snapshot]);
  saveComparisons();
  renderComparisons();
}

function removeComparison(id) {
  comparisons = comparisons.filter((item) => item.id !== id);
  saveComparisons();
  renderComparisons();
}

function clearAllComparisons() {
  if (comparisons.length === 0) return;
  comparisons = [];
  saveComparisons();
  renderComparisons();
}

function renderComparisons() {
  if (comparisons.length === 0) {
    elements.compareSection.hidden = true;
    elements.compareGrid.replaceChildren();
    return;
  }

  const fragment = document.createDocumentFragment();
  comparisons.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'compare-card';
    card.dataset.id = entry.id;

    const name = document.createElement('div');
    name.className = 'compare-name';
    name.textContent = entry.modelName || t('modelCustom');

    const usage = document.createElement('div');
    usage.className = 'compare-usage';
    usage.textContent = `${t('compareInput')} ${formatTokens(entry.inputM, locale())} M ${t('compareCached')} ${formatTokens(entry.cachedInputM, locale())} M ${t('compareOutput')} ${formatTokens(entry.outputM, locale())} M`;

    const daily = document.createElement('div');
    daily.className = 'compare-value';
    daily.append(createValueLine(t('compareDaily'), entry.dailyCny, entry.dailyUsd));

    const monthly = document.createElement('div');
    monthly.className = 'compare-value';
    monthly.append(createValueLine(t('compareMonthly'), entry.monthlyCny, entry.monthlyUsd));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'compare-remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Remove');
    remove.title = t('clearAll');

    card.append(name, usage, daily, monthly, remove);
    fragment.appendChild(card);
  });

  elements.compareGrid.replaceChildren(fragment);
  elements.compareSection.hidden = false;
}

function createValueLine(label, cny, usd) {
  const line = document.createElement('div');
  const labelSpan = document.createElement('span');
  labelSpan.textContent = `${label} `;
  const value = document.createElement('strong');
  value.textContent = formatMoney(cny, 'CNY', locale());
  const sep = document.createElement('span');
  sep.className = 'value-sep';
  sep.textContent = ' / ';
  const usdValue = document.createElement('strong');
  usdValue.textContent = formatMoney(usd, 'USD', locale());
  line.append(labelSpan, value, sep, usdValue);
  return line;
}

function bindEvents() {
  elements.modelSelect.addEventListener('change', () => {
    const model = models.find((item) => item.id === elements.modelSelect.value);
    if (model) {
      applyModelToForm(model);
      elements.modelName.value = model.name;
    } else {
      elements.modelName.value = '';
    }
    renderCosts();
  });

  elements.currencySelect.addEventListener('change', () => {
    const newCurrency = elements.currencySelect.value;
    const oldCurrency = activePriceCurrency;
    const rate = toNonNegativeNumber(elements.exchangeRate.value) || 7.2;
    const model = models.find((item) => item.id === elements.modelSelect.value);

    if (model) {
      applyModelToForm(model);
    } else if (oldCurrency !== newCurrency) {
      elements.priceInput.value = roundAdaptive(convertCurrency(elements.priceInput.value, oldCurrency, newCurrency, rate));
      elements.priceCached.value = roundAdaptive(convertCurrency(elements.priceCached.value, oldCurrency, newCurrency, rate));
      elements.priceOutput.value = roundAdaptive(convertCurrency(elements.priceOutput.value, oldCurrency, newCurrency, rate));
      activePriceCurrency = newCurrency;
    }

    renderCosts();
  });

  [
    elements.modelName,
    elements.priceInput,
    elements.priceCached,
    elements.priceOutput,
    elements.currencySelect,
    elements.dailyInput,
    elements.dailyCached,
    elements.dailyOutput,
    elements.cacheRate,
    elements.outputRatio,
    elements.exchangeRate
  ].forEach((el) => {
    el.addEventListener('input', () => {
      renderCosts();
      updateEstimateVisibility();
      updateEstimateHints();
    });
    el.addEventListener('change', () => {
      renderCosts();
      updateEstimateVisibility();
      updateEstimateHints();
    });
  });

  elements.btnPinCompare.addEventListener('click', pinCurrentResult);
  elements.btnClearCompare.addEventListener('click', clearAllComparisons);
  elements.compareGrid.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('.compare-remove');
    if (removeBtn) {
      const card = removeBtn.closest('.compare-card');
      if (card) removeComparison(card.dataset.id);
    }
  });

  bindSliderPair(elements.cacheRate, elements.cacheRateRange);
  bindSliderPair(elements.outputRatio, elements.outputRatioRange);

document.querySelectorAll('input[type="text"][inputmode]').forEach((input) => {
    input.addEventListener('input', () => {
      let normalized = input.value.replace(/[^\d.]/g, '');
      const firstDot = normalized.indexOf('.');
      if (firstDot !== -1) {
        normalized = normalized.slice(0, firstDot + 1) + normalized.slice(firstDot + 1).replace(/\./g, '');
      }
      if (normalized.startsWith('.')) normalized = `0${normalized}`;
      if (input.value !== normalized) {
        input.value = normalized;
        renderCosts();
        updateEstimateVisibility();
        updateEstimateHints();
      }
    });
  });
}

async function loadModels() {
  try {
    const response = await fetch('token_models.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    models = Array.isArray(data.models) ? data.models : [];
  } catch (error) {
    console.error('Failed to load model prices', error);
    models = [];
  }

  fillModelSelect();
  if (models.length > 0) {
    elements.modelSelect.value = models[0].id;
    applyModelToForm(models[0]);
    elements.modelName.value = models[0].name;
  }
  renderCosts();
  updateEstimateVisibility();
  updateEstimateHints();
}

function init() {
  initSite();
  setDocumentLanguage();
  bindEvents();
  elements.btnPinCompare.disabled = true;
  renderComparisons();

  document.addEventListener('xugtek:langchange', () => {
    const previousSelection = elements.modelSelect.value;
    const modelName = elements.modelName.value;
    setDocumentLanguage();
    fillModelSelect();
    elements.modelSelect.value = previousSelection;
    const model = models.find((item) => item.id === previousSelection);
    if (model) applyModelToForm(model);
    elements.modelName.value = modelName;
    renderCosts();
    renderComparisons();
    updateEstimateVisibility();
    updateEstimateHints();
  });

  loadModels();
}

init();
