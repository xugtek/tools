import { getLang, t } from './i18n.js';
import { initSite } from './site.js';
import {
  WEIGHT_PRESETS,
  formatMinutes,
  formatScore,
  formatTokensCompact,
  normalizeWeights,
  scoreRows,
  sortRows
} from './llm-rank-core.js';

const DEFAULT_DIRECTIONS = {
  intelligence: 'desc',
  speed: 'desc',
  time: 'asc',
  tokens: 'asc',
  cost: 'asc',
  score: 'desc'
};

const elements = {
  table: document.getElementById('rank-table'),
  presetGroup: document.getElementById('preset-toggle'),
  sliders: document.getElementById('weight-sliders')
};

let rowState = [];
let weights = { ...WEIGHT_PRESETS.balanced };
let preset = 'balanced';
let sortKey = 'score';
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
    timePerTaskSec: Number(tr.dataset.t),
    costPerTaskUsd: Number(tr.dataset.cost)
  }));
}

const COLUMN_KEYS = {
  intelligence: 'intelligence',
  speed: 'speed',
  time: 'timePerTaskSec',
  tokens: 'tokens',
  cost: 'costPerTaskUsd',
  score: 'score'
};

function applySort(key, direction) {
  const sorted = sortRows(rowState, COLUMN_KEYS[key] || key, direction);
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

function rescore() {
  const scored = scoreRows(rowState, weights);
  rowState.forEach((row) => {
    const match = scored.find((s) => s.tr === row.tr);
    row.score = match ? match.score : 0;
    row.tr.querySelector('.score').textContent = formatScore(row.score, locale());
  });
}

function updateSliderLabels() {
  if (!elements.sliders) return;
  const pct = (v) => `${Math.round(v * 100)}%`;
  elements.sliders.querySelector('[data-weight-label="performance"]').textContent = pct(weights.performance);
  elements.sliders.querySelector('[data-weight-label="cost"]').textContent = pct(weights.cost);
  elements.sliders.querySelector('[data-weight-label="speed"]').textContent = pct(weights.speed);
  elements.sliders.querySelector('#weight-performance').value = String(Math.round(weights.performance * 100));
  elements.sliders.querySelector('#weight-cost').value = String(Math.round(weights.cost * 100));
  elements.sliders.querySelector('#weight-speed').value = String(Math.round(weights.speed * 100));
}

function setActivePreset(name) {
  preset = name;
  elements.presetGroup.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.preset === name);
    if (btn.dataset.preset === 'custom') {
      btn.setAttribute('aria-expanded', String(name === 'custom'));
    }
  });
  if (elements.sliders) {
    elements.sliders.hidden = name !== 'custom';
  }
}

function applyPreset(name) {
  if (name === 'custom') {
    setActivePreset('custom');
    updateSliderLabels();
    return;
  }
  weights = { ...WEIGHT_PRESETS[name] };
  setActivePreset(name);
  updateSliderLabels();
  rescore();
  sortKey = 'score';
  sortDirection = 'desc';
  applySort(sortKey, sortDirection);
  updateHeaderIndicators();
}

function bindEvents() {
  elements.presetGroup.querySelectorAll('button[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.preset !== preset) applyPreset(btn.dataset.preset);
    });
  });

  if (elements.sliders) {
    ['performance', 'cost', 'speed'].forEach((axis) => {
      const slider = elements.sliders.querySelector(`#weight-${axis}`);
      slider.addEventListener('input', () => {
        const raw = {
          performance: Number(elements.sliders.querySelector('#weight-performance').value),
          cost: Number(elements.sliders.querySelector('#weight-cost').value),
          speed: Number(elements.sliders.querySelector('#weight-speed').value)
        };
        raw[axis] = Number(slider.value);
        weights = normalizeWeights(raw);
        setActivePreset('custom');
        updateSliderLabels();
        rescore();
        sortKey = 'score';
        sortDirection = 'desc';
        applySort(sortKey, sortDirection);
        updateHeaderIndicators();
      });
    });
  }

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

  document.addEventListener('xugtek:langchange', renderLocalizedCells);
}

function renderLocalizedCells() {
  const loc = locale();
  rowState.forEach((row) => {
    row.tr.querySelector('.tokens').textContent = formatTokensCompact(row.tokens, loc);
    row.tr.querySelector('.time').textContent = formatMinutes(row.timePerTaskSec, loc);
    row.tr.querySelector('.score').textContent = formatScore(row.score, loc);
  });
}

function setDocumentLanguage() {
  const en = getLang() === 'en';
  document.title = en
    ? 'LLM Value Ranking – Intelligence, Cost & Speed, Weighted Your Way'
    : '大模型性价比排行榜 - 智能、成本、耗时三维加权，权重由你定';
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', en
      ? 'LLM value ranking from independently measured intelligence, cost per task and time per task: adjust the weighting among performance, cost and speed to rank 25 models including DeepSeek, GPT-6, Opus 5.5, Mimo, GLM and Kimi.'
      : '大模型性价比排行榜：基于独立实测的智能指数、每任务成本与耗时，综合计算 25 款大模型的性价比得分。自由调整性能、成本、速度权重，或一键使用均衡、高性能、低成本、快响应预设，实时查看 DeepSeek、GPT-6、Opus 5.5、Mimo、GLM、Kimi 等模型的综合排名、分项指标与性价比变化趋势。');
  }
}

function init() {
  initSite();
  setDocumentLanguage();
  if (!elements.table) return;

  readRows();

  weights = { ...WEIGHT_PRESETS.balanced };
  rescore();
  sortKey = 'score';
  sortDirection = 'desc';
  applySort(sortKey, sortDirection);
  updateHeaderIndicators();
  setActivePreset('balanced');
  updateSliderLabels();
  renderLocalizedCells();

  document.addEventListener('xugtek:langchange', setDocumentLanguage);

  bindEvents();
}

init();
