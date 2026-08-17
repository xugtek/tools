const STORAGE_KEY = 'xugtek-lang';

const translations = {
  'zh-CN': {
    siteName: 'XugTek 工具站',
    navTools: '工具',
    themeToggle: '切换主题',
    langSwitch: 'EN',
    heroTitle: '实用在线工具',
    heroSubtitle: '轻量、快速、关注 SEO 与隐私的在线工具集合',
    tokenToolName: 'Token 用量费用计算器',
    tokenToolDesc: '估算每日/每月 Token 费用，比较人民币与美元价格',
    comingSoon: '更多工具即将上线',
    openTool: '打开工具',
    pageTitle: 'Token 用量费用计算器',
    backHome: '返回首页',
    modelLabel: '模型',
    modelCustom: '自定义模型',
    priceSection: '价格设置（每 1M Tokens）',
    inputPriceLabel: '普通输入价',
    cachedInputPriceLabel: '缓存输入价',
    outputPriceLabel: '输出价',
    currencyLabel: '计价币种',
    usageSection: '每日用量',
    dailyInputLabel: '每日输入 Tokens（总）',
    dailyCachedLabel: '其中缓存命中 Tokens（可留空）',
    dailyOutputLabel: '每日输出 Tokens（可留空）',
    estimateSection: '自动估算设置',
    cacheHitRateLabel: '缓存命中率',
    outputRatioLabel: '输出 / 输入比例',
    monthDaysHint: '按 30 天/月计算',
    exchangeRateLabel: '汇率（1 USD = ? CNY）',
    resultSection: '费用结果',
    dailyCostLabel: '每日费用',
    monthlyCostLabel: '每月费用（30 天）',
    breakdownLabel: '费用构成',
    normalInputCostLabel: '普通输入',
    cachedInputCostLabel: '缓存输入',
    outputCostLabel: '输出',
    estimatedHint: '留空的缓存/输出将按估算比例自动计算',
    invalidInput: '请输入有效的 Token 数量',
    customModelName: '自定义模型',
    modelSourceNote: '价格来自 token_models.json，可编辑；显示结果仅供参考。'
  },
  en: {
    siteName: 'XugTek Tools',
    navTools: 'Tools',
    themeToggle: 'Toggle theme',
    langSwitch: '中文',
    heroTitle: 'Useful Online Tools',
    heroSubtitle: 'Lightweight, fast, SEO-friendly and privacy-conscious online tools',
    tokenToolName: 'Token Usage Cost Calculator',
    tokenToolDesc: 'Estimate daily and monthly token costs, compare CNY and USD pricing',
    comingSoon: 'More tools coming soon',
    openTool: 'Open tool',
    pageTitle: 'Token Usage Cost Calculator',
    backHome: 'Back to home',
    modelLabel: 'Model',
    modelCustom: 'Custom model',
    priceSection: 'Pricing (per 1M tokens)',
    inputPriceLabel: 'Input price',
    cachedInputPriceLabel: 'Cached input price',
    outputPriceLabel: 'Output price',
    currencyLabel: 'Pricing currency',
    usageSection: 'Daily usage',
    dailyInputLabel: 'Daily input tokens (total)',
    dailyCachedLabel: 'Cached input tokens (optional)',
    dailyOutputLabel: 'Daily output tokens (optional)',
    estimateSection: 'Estimate settings',
    cacheHitRateLabel: 'Cache hit rate',
    outputRatioLabel: 'Output / input ratio',
    monthDaysHint: 'Based on 30 days per month',
    exchangeRateLabel: 'Exchange rate (1 USD = ? CNY)',
    resultSection: 'Cost result',
    dailyCostLabel: 'Daily cost',
    monthlyCostLabel: 'Monthly cost (30 days)',
    breakdownLabel: 'Cost breakdown',
    normalInputCostLabel: 'Normal input',
    cachedInputCostLabel: 'Cached input',
    outputCostLabel: 'Output',
    estimatedHint: 'Empty cache/output fields are estimated automatically',
    invalidInput: 'Please enter valid token counts',
    customModelName: 'Custom model',
    modelSourceNote: 'Prices are loaded from token_models.json and can be edited; results are for reference only.'
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
}
