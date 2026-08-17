import {
  calculateMonthlyCost,
  convertCurrency,
  estimateDailyUsage,
  formatMoney,
  formatTokens,
  toNonNegativeNumber
} from './token-calc-core.js';
import { getLang, t } from './i18n.js';
import { initSite } from './site.js';

const DAYS_PER_MONTH = 30;
const CUSTOM_MODEL_ID = '__custom__';

const elements = {
  modelSelect: document.getElementById('model-select'),
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
  breakdownOutputUsd: document.getElementById('breakdown-output-usd')
};

let models = [];

function locale() {
  return getLang() === 'en' ? 'en-US' : 'zh-CN';
}

function isBlankOrZero(value) {
  const trimmed = String(value ?? '').trim();
  if (trimmed === '') return true;
  const n = Number(trimmed);
  return Number.isFinite(n) && n === 0;
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

function applyModelToForm(model) {
  elements.priceInput.value = model.input;
  elements.priceCached.value = model.cachedInput ?? model.input;
  elements.priceOutput.value = model.output;
  elements.currencySelect.value = model.currency;
}

function getCurrentModel() {
  const selectedId = elements.modelSelect.value;
  const model = models.find((item) => item.id === selectedId);

  if (model) {
    return {
      ...model,
      input: toNonNegativeNumber(elements.priceInput.value),
      cachedInput: toNonNegativeNumber(elements.priceCached.value),
      output: toNonNegativeNumber(elements.priceOutput.value),
      currency: elements.currencySelect.value
    };
  }

  return {
    id: CUSTOM_MODEL_ID,
    name: t('modelCustom'),
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
  if (model.pricesUsd) {
    const usdCost = calculateMonthlyCost(usage, {
      input: model.pricesUsd.input,
      cachedInput: model.pricesUsd.cachedInput,
      output: model.pricesUsd.output
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
}

function bindEvents() {
  elements.modelSelect.addEventListener('change', () => {
    const model = models.find((item) => item.id === elements.modelSelect.value);
    if (model) applyModelToForm(model);
    renderCosts();
  });

  [
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

  bindSliderPair(elements.cacheRate, elements.cacheRateRange);
  bindSliderPair(elements.outputRatio, elements.outputRatioRange);
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
  }
  renderCosts();
  updateEstimateVisibility();
  updateEstimateHints();
}

function init() {
  initSite();
  setDocumentLanguage();
  bindEvents();

  document.addEventListener('xugtek:langchange', () => {
    const previousSelection = elements.modelSelect.value;
    setDocumentLanguage();
    fillModelSelect();
    elements.modelSelect.value = previousSelection;
    renderCosts();
    updateEstimateVisibility();
    updateEstimateHints();
  });

  loadModels();
}

init();
