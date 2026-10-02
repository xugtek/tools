import { getLang, t } from './i18n.js';
import { initSite } from './site.js';
import {
  formatTokensCompact,
  formatValue,
  sortRows
} from './llm-rank-core.js';

const DEFAULT_DIRECTIONS = {
  intelligence: 'desc',
  speed: 'desc',
  tokens: 'asc',
  density: 'desc',
  price: 'asc',
  valueCny: 'desc',
  valueUsd: 'desc'
};

const elements = {
  table: document.getElementById('rank-table'),
  toggleGroup: document.getElementById('currency-toggle')
};

let rowState = [];
let activeCurrency = 'CNY';
let sortKey = null;
let sortDirection = 'desc';

function locale() {
  return getLang() === 'en' ? 'en-US' : 'zh-CN';
}

function readRows() {
  rowState = [...elements.table.querySelectorAll('tbody tr')].map((tr) => ({
    tr,
    name: tr.querySelector('.model-name').textContent.trim(),
    intelligence: Number(tr.dataset.i),
    speed: Number(tr.dataset.s),
    tokens: Number(tr.dataset.n),
    density: Number(tr.dataset.d),
    priceCny: Number(tr.dataset.pc),
    priceUsd: Number(tr.dataset.pu),
    valueCny: Number(tr.dataset.vc),
    valueUsd: Number(tr.dataset.vu)
  }));
}

function sortKeyForColumn(key) {
  if (key === 'price') return activeCurrency === 'CNY' ? 'priceCny' : 'priceUsd';
  return key;
}

function applySort(key, direction) {
  const sorted = sortRows(rowState, sortKeyForColumn(key), direction);
  const tbody = elements.table.querySelector('tbody');
  sorted.forEach((row) => tbody.appendChild(row.tr));
  sorted.forEach((row, index) => {
    row.tr.querySelector('.rank-no').textContent = index + 1;
  });
}

function updateHeaderIndicators() {
  elements.table.querySelectorAll('th[data-sort]').forEach((th) => {
    th.classList.toggle('sorted-asc', th.dataset.sort === sortKey && sortDirection === 'asc');
    th.classList.toggle('sorted-desc', th.dataset.sort === sortKey && sortDirection === 'desc');
  });
}

function setActiveCurrency(currency) {
  activeCurrency = currency;
  elements.table.dataset.cur = currency;
  elements.toggleGroup.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.currency === currency);
  });
  const valueKey = currency === 'CNY' ? 'valueCny' : 'valueUsd';
  sortKey = valueKey;
  sortDirection = 'desc';
  applySort(sortKey, sortDirection);
  updateHeaderIndicators();
}

function bindEvents() {
  elements.table.querySelectorAll('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
      } else {
        sortKey = key;
        sortDirection = DEFAULT_DIRECTIONS[key] || 'desc';
      }
      applySort(sortKey, sortDirection);
      updateHeaderIndicators();
    });
  });

  elements.toggleGroup.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.currency !== activeCurrency) {
        setActiveCurrency(btn.dataset.currency);
      }
    });
  });

  document.addEventListener('xugtek:langchange', () => {
    renderNumericCells();
  });
}

function renderNumericCells() {
  const loc = locale();
  rowState.forEach((row) => {
    row.tr.querySelector('.tokens').textContent = formatTokensCompact(row.tokens, loc);
    row.tr.querySelector('.v-cny').textContent = formatValue(row.valueCny, loc);
    row.tr.querySelector('.v-usd').textContent = formatValue(row.valueUsd, loc);
  });
}

function setDocumentLanguage() {
  const en = getLang() === 'en';
  document.title = en
    ? 'LLM Value Ranking – Intelligence Density & Value per Dollar'
    : '大模型性价比排行榜 - GPT/DeepSeek/Opus/Mimo/GLM/Kimi智能密度与每元智能';
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', en
      ? 'LLM value ranking based on independently measured benchmarks (Terminal-Bench 4.0, HLE, AutomationBench): intelligence density and intelligence per dollar for 26 models including DeepSeek, GPT-6, Opus 5.5, Mimo, GLM and Kimi, in CNY/USD.'
      : '大模型性价比排行榜：基于 Terminal-Bench 4.0、HLE、AutomationBench 独立实测，计算 26 款大模型（DeepSeek、GPT-6、Opus 5.5、Mimo、GLM、Kimi）的智能密度与每元智能，支持人民币/美元双币种。');
  }
}

function init() {
  initSite();
  setDocumentLanguage();
  if (!elements.table) return;

  activeCurrency = elements.table.dataset.defaultCurrency || 'CNY';
  readRows();

  const valueKey = activeCurrency === 'CNY' ? 'valueCny' : 'valueUsd';
  sortKey = valueKey;
  sortDirection = 'desc';
  setActiveCurrency(activeCurrency);
  renderNumericCells();

  document.addEventListener('xugtek:langchange', () => {
    setDocumentLanguage();
  });

  bindEvents();
}

init();
