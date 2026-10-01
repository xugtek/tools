const NAV_FLAG_KEY = 'xugtek-lang-nav';

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
    discountLabel: '优惠倍率',
    discountAppliedNote: '已按 {multiplier}× 优惠倍率计算',
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
    compareOutput: '输出',
    priceTableTitle: '模型价格总表',
    priceTableIntro: '下表汇总当前内置的 26 款大模型官方定价：DeepSeek V4、GPT-6.1 Sol、GPT-6 Astra/Sol/Luna、GPT-5.6、Claude Opus 5.5/5、Sonnet 5.5/5、Fable 5.1、Grok 4.6/4.7、Kimi K3、Qwen3.8 Max、GLM-5.3（含 Flash/FlashX）、Mimo-V2.6、Gemini 3.8 Flash，按每 100 万 Token 计价（输入 / 缓存输入 / 输出）。',
    priceTableNote: '价格更新于 2026-10-01，仅供参考，实际以模型官方计费为准。',
    priceColModel: '模型',
    priceColProvider: '提供商',
    priceColPrice: '价格 · 输入/缓存/输出（每 1M Tokens）',
    faqTitle: '常见问题',
    faq1q: '缓存命中价是什么意思？',
    faq1a: '缓存命中价（cached input）指复用此前已处理过的前缀内容时，命中缓存的输入 Token 单价，通常远低于普通输入价。本工具按“缓存命中率”把每日输入拆分为普通输入与缓存输入分别计费。',
    faq2q: '为什么人民币和美元费用换算不等价？',
    faq2a: '部分模型在国内与国际市场的官方定价是独立发布的（例如 Kimi K3 的 ¥20 与 $3 并非 7.2 汇率关系）。对有官方双币定价的模型，本工具按各自官方价独立计算，仅在缺少某一币种时才按汇率换算，因此人民币与美元结果可能无法按汇率严格互换。',
    faq3q: '计算结果是准确的账单吗？',
    faq3a: '不是。本工具仅根据你填写的用量与所选模型价格做预估计算，实际费用以模型官方计费为准：促销价、长上下文加价、税费与区域差价等因素不在估算范围内，请以官方最新定价与实际账单为准。',
    faq4q: '价格多久更新一次？',
    faq4a: '价格随模型定价变动更新，页面标注最近更新日期（当前为 2026-10-01）。价格仅供参考，请以各模型官方定价页为准。'
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
    exchangeRateLabel: 'Exchange rate (USD → CNY)',
    discountLabel: 'Discount multiplier',
    discountAppliedNote: 'Calculated with a {multiplier}× discount multiplier',
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
    compareOutput: 'Output',
    priceTableTitle: 'Model price list',
    priceTableIntro: 'Official per-million-token prices (input / cached input / output) for the 26 models built into this calculator: DeepSeek V4, GPT-6.1 Sol, GPT-6 Astra/Sol/Luna, GPT-5.6, Claude Opus 5.5/5, Sonnet 5.5/5, Fable 5.1, Grok 4.6/4.7, Kimi K3, Qwen3.8 Max, GLM-5.3 (incl. Flash/FlashX), Mimo-V2.6 and Gemini 3.8 Flash.',
    priceTableNote: 'Prices updated 2026-10-01. For reference only; official provider billing always applies.',
    priceColModel: 'Model',
    priceColProvider: 'Provider',
    priceColPrice: 'Price · input/cached/output (per 1M tokens)',
    faqTitle: 'FAQ',
    faq1q: 'What does the cached input price mean?',
    faq1a: 'The cached input price applies to input tokens that reuse an already-processed prefix from an earlier request. It is usually much lower than the standard input price. This tool splits daily input into normal and cached portions using your cache hit rate.',
    faq2q: 'Why do CNY and USD results not convert exactly?',
    faq2a: 'Some models publish independent domestic and international list prices (for example Kimi K3 at CNY 20 and USD 3 is not a 7.2 exchange-rate pair). This tool bills each currency from its official price and only converts when a currency is missing, so the two currency results may not match by exchange rate.',
    faq3q: 'Are these results exact bills?',
    faq3a: 'No. Results are estimates based on the usage and model prices you enter. Actual charges follow official provider billing: promotional rates, long-context surcharges, taxes and regional differences are not modeled. Always verify against official pricing and your invoice.',
    faq4q: 'How often are prices updated?',
    faq4a: 'Prices are updated whenever model pricing changes; the page shows the latest update date (currently 2026-10-01). Prices are for reference only - check each model’s official pricing page for the latest rates.'
  }
};

let currentLang = 'zh-CN';

function detectLanguage() {
  let followed = false;
  try {
    followed = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem(NAV_FLAG_KEY);
  } catch (e) {}
  if (followed && typeof document !== 'undefined') {
    const staticLang = document.documentElement.getAttribute('data-static-lang');
    if (staticLang && translations[staticLang]) return staticLang;
  }
  if (typeof navigator !== 'undefined') {
    const navLang = navigator.language || navigator.userLanguage || '';
    if (navLang.toLowerCase().startsWith('zh')) return 'zh-CN';
  }
  if (typeof document !== 'undefined') {
    const staticLang = document.documentElement.getAttribute('data-static-lang');
    if (staticLang && translations[staticLang]) return staticLang;
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
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang === 'zh-CN' ? 'zh-CN' : 'en';
    applyI18n();
    updateLangButton();
    updateLangMenu();
    document.documentElement.classList.remove('i18n-wait');
    document.dispatchEvent(new CustomEvent('xugtek:langchange', { detail: { lang } }));
  }
}

export function initI18n() {
  setLang(detectLanguage());

  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const wrapper = btn.closest('.lang-switch');
      if (wrapper) wrapper.classList.toggle('open');
    });
  });

  document.querySelectorAll('.lang-switch-list a[data-lang]').forEach((link) => {
    link.addEventListener('click', () => {
      try {
        sessionStorage.setItem(NAV_FLAG_KEY, link.getAttribute('data-lang') || '1');
      } catch (e) {}
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.lang-switch')) closeLangMenu();
  });
}
