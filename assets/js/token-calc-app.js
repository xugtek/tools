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
  outputRatio: document.getElementById('output-ratio'),
  exchangeRate: document.getElementById('exchange-rate'),
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
    cachedInput: cachedRaw === '' ? estimate.cachedInput : toNonNegativeNumber(cachedRaw),
    output: outputRaw === '' ? estimate.output : toNonNegativeNumber(outputRaw)
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
    return;
  }

  const cost = calculateMonthlyCost(usage, model, { days: DAYS_PER_MONTH });

  const dailyCny = convertCurrency(cost.dailyCost, model.currency, 'CNY', rate);
  const dailyUsd = convertCurrency(cost.dailyCost, model.currency, 'USD', rate);
  const monthlyCny = convertCurrency(cost.monthlyCost, model.currency, 'CNY', rate);
  const monthlyUsd = convertCurrency(cost.monthlyCost, model.currency, 'USD', rate);

  const normalCny = convertCurrency(cost.inputCost, model.currency, 'CNY', rate);
  const normalUsd = convertCurrency(cost.inputCost, model.currency, 'USD', rate);
  const cachedCny = convertCurrency(cost.cachedCost, model.currency, 'CNY', rate);
  const cachedUsd = convertCurrency(cost.cachedCost, model.currency, 'USD', rate);
  const outputCny = convertCurrency(cost.outputCost, model.currency, 'CNY', rate);
  const outputUsd = convertCurrency(cost.outputCost, model.currency, 'USD', rate);

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
    el.addEventListener('input', renderCosts);
    el.addEventListener('change', renderCosts);
  });
}

async function loadModels() {
  try {
    const response = await fetch('token_models.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    models = Array.isArray(data.models) ? data.models : [];
  } catch (error) {
    console.error('Failed to load token_models.json', error);
    models = [];
  }

  fillModelSelect();
  if (models.length > 0) {
    elements.modelSelect.value = models[0].id;
    applyModelToForm(models[0]);
  }
  renderCosts();
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
  });

  loadModels();
}

init();
