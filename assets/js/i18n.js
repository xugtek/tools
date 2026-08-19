const STORAGE_KEY = 'xugtek-lang';

const translations = {
  'zh-CN': {
    siteName: 'xugtek',
    toolTitle: 'Token费用计算器',
    navTools: '工具',
    themeToggle: '切换主题',
    langSwitch: 'EN',
    heroTitle: '实用在线工具',
    heroSubtitle: '轻量、快速、实用的在线工具集合',
    tokenToolName: 'Token费用计算器',
    tokenToolDesc: '估算每日/每月 Token 费用，比较人民币与美元价格',
    comingSoon: '更多工具即将上线',
    openTool: '打开工具',
    pageTitle: 'Token费用计算器',
    backHome: '返回首页',
    modelLabel: '模型',
    providerLabel: '提供商',
    modelNameLabel: '模型',
    modelNamePlaceholder: '输入模型名称',
    modelCustom: '自定义',
    priceSection: '价格设置（每 M Tokens）',
    inputPriceLabel: '普通输入价',
    cachedInputPriceLabel: '缓存输入价',
    outputPriceLabel: '输出价',
    currencyLabel: '计价币种',
    usageSection: '每日用量（M Tokens）',
    dailyInputLabel: '输入',
    dailyCachedLabel: '缓存命中',
    dailyOutputLabel: '输出',
    estimateSection: '估算设置',
    daysPerMonthLabel: '每月天数',
    cacheHitRateLabel: '缓存命中率',
    outputRatioLabel: '输出 / 输入比例',
    monthDaysHint: '按 30 天/月计算',
    exchangeRateLabel: '汇率（1 USD = ? CNY）',
    resultSection: '费用结果',
    dailyCostLabel: '每日费用',
    monthlyCostLabel: '每月费用',
    breakdownLabel: '费用明细',
    normalInputLabel: '普通输入',
    cachedInputLabel: '缓存命中',
    outputLabel: '输出',
    estimatedHint: '留空或 0 时按比例自动估算',
    cacheEstimateHint: '缓存为空，按 {rate}% 命中率估算',
    outputEstimateHint: '输出为空，按 {ratio}% 输出比例估算',
    invalidInput: '请输入有效的 Token 数量',
    customModelName: '自定义模型',
    modelSourceNote: '价格仅供参考，请以官方最新价格为准。',
    pinToCompare: '加入对比',
    compareSection: '对比',
    clearAll: '全部清除',
    compareDaily: '每日',
    compareMonthly: '每月',
    compareInput: '输入',
    compareCached: '缓存',
    compareOutput: '输出'
  },
  en: {
    siteName: 'xugtek',
    toolTitle: 'Token Cost Calculator',
    navTools: 'Tools',
    themeToggle: 'Toggle theme',
    langSwitch: '中文',
    heroTitle: 'Useful Online Tools',
    heroSubtitle: 'Lightweight, fast and practical online tools',
    tokenToolName: 'Token Cost Calculator',
    tokenToolDesc: 'Estimate daily and monthly token costs, compare CNY and USD pricing',
    comingSoon: 'More tools coming soon',
    openTool: 'Open tool',
    pageTitle: 'Token Cost Calculator',
    backHome: 'Back to home',
    modelLabel: 'Model',
    providerLabel: 'Provider',
    modelNameLabel: 'Model',
    modelNamePlaceholder: 'Enter model name',
    modelCustom: 'Custom',
    priceSection: 'Pricing (per M tokens)',
    inputPriceLabel: 'Input price',
    cachedInputPriceLabel: 'Cached input price',
    outputPriceLabel: 'Output price',
    currencyLabel: 'Pricing currency',
    usageSection: 'Daily usage (M tokens)',
    dailyInputLabel: 'Input',
    dailyCachedLabel: 'Cached input',
    dailyOutputLabel: 'Output',
    estimateSection: 'Estimate settings',
    daysPerMonthLabel: 'Days per month',
    cacheHitRateLabel: 'Cache hit rate',
    outputRatioLabel: 'Output / input ratio',
    monthDaysHint: 'Based on 30 days per month',
    exchangeRateLabel: 'Exchange rate (1 USD = ? CNY)',
    resultSection: 'Cost result',
    dailyCostLabel: 'Daily cost',
    monthlyCostLabel: 'Monthly cost',
    breakdownLabel: 'Cost detail',
    normalInputLabel: 'Normal input',
    cachedInputLabel: 'Cached input',
    outputLabel: 'Output',
    estimatedHint: 'Leave empty or 0 to estimate automatically',
    cacheEstimateHint: 'Cache empty: estimated at {rate}% hit rate',
    outputEstimateHint: 'Output empty: estimated at {ratio}% output ratio',
    invalidInput: 'Please enter valid token counts',
    customModelName: 'Custom model',
    modelSourceNote: 'Prices are for reference only; always check the latest official pricing.',
    pinToCompare: 'Add to compare',
    compareSection: 'Comparison',
    clearAll: 'Clear all',
    compareDaily: 'Daily',
    compareMonthly: 'Monthly',
    compareInput: 'Input',
    compareCached: 'Cached',
    compareOutput: 'Output'
  }
};

let currentLang = 'zh-CN';

function detectLanguage() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  }
  if (typeof navigator !== 'undefined') {
    const navLang = navigator.language || navigator.userLanguage || '';
    if (navLang.toLowerCase().startsWith('zh')) return 'zh-CN';
  }
  return 'en';
}

export function getLang() {
  return currentLang;
}

export function t(key, vars) {
  const table = translations[currentLang] || translations['zh-CN'];
  let text = table[key] || translations['zh-CN'][key] || key;
  if (vars) {
    Object.entries(vars).forEach(([name, value]) => {
      text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
    });
  }
  return text;
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    el.setAttribute('aria-label', t(key));
  });
}

function updateLangButton() {
  document.querySelectorAll('[data-i18n-switch]').forEach((el) => {
    el.textContent = t('langSwitch');
  });
}

function updateLangMenu() {
  document.querySelectorAll('.lang-switch-list a[data-lang]').forEach((el) => {
    const isCurrent = el.getAttribute('data-lang') === currentLang;
    el.classList.toggle('current', isCurrent);
    if (isCurrent) {
      el.setAttribute('aria-current', 'true');
    } else {
      el.removeAttribute('aria-current');
    }
  });
}

function closeLangMenu() {
  document.querySelectorAll('.lang-switch.open').forEach((el) => {
    el.classList.remove('open');
  });
  const active = document.activeElement;
  if (active && active.closest && active.closest('.lang-switch')) active.blur();
}

export function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang === 'zh-CN' ? 'zh-CN' : 'en';
    applyI18n();
    updateLangButton();
    updateLangMenu();
    document.dispatchEvent(new CustomEvent('xugtek:langchange', { detail: { lang } }));
  }
}

export function initI18n() {
  setLang(detectLanguage());

  document.querySelectorAll('[data-i18n-switch]').forEach((el) => {
    el.addEventListener('click', () => {
      setLang(currentLang === 'zh-CN' ? 'en' : 'zh-CN');
    });
  });

  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const wrapper = btn.closest('.lang-switch');
      if (wrapper) wrapper.classList.toggle('open');
    });
  });

  document.querySelectorAll('.lang-switch-list a[data-lang]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setLang(link.getAttribute('data-lang'));
      closeLangMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.lang-switch')) closeLangMenu();
  });
}
