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
    tokenHeroSubtitle: '选择或填写模型，输入每日用量，即刻估算人民币 / 美元 API 费用',
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
    faq4a: '价格随模型定价变动更新，页面标注最近更新日期（当前为 2026-10-01）。价格仅供参考，请以各模型官方定价页为准。',
    llmPageTitle: '大模型性价比排行榜',
    llmHeroSubtitle: '基于 Terminal-Bench、HLE 等独立实测基准，计算每元能买到多少智能',
    llmRankSection: '性价比榜单',
    rankSortHint: '点击表头排序',
    rankColModel: '模型',
    rankColIntelligence: '智能指数',
    rankColSpeed: '速度 tok/s',
    rankColTokens: 'Token/任务',
    rankColDensity: '智能密度',
    rankColPrice: '输出价/1M',
    rankColValueCny: '每元智能 ¥',
    rankColValueUsd: '每元智能 $',
    estMarkTitle: '无独立实测，按 GLM-5.3-Flash 数据估算',
    methodTitle: '方法论',
    method1: '智能指数 I：Terminal-Bench 4.0（终端代理编程）、Humanity\'s Last Exam（综合推理）与 AutomationBench（SaaS 工作流自动化）三项得分的算术平均，全部由 Artificial Analysis 以统一口径独立实测，非厂商自报。',
    method2: '速度 S 与 Token 消耗 N：均为 AA 实测。S 为输出速度（tokens/s）；N 为三项基准每任务输出 Token（含推理）的平均值，话痨模型的真实成本会被如实计入。',
    method3: '智能密度 D = I/100 × S：每秒产出的“质量加权 Token”数，衡量智能产出速率。',
    method4: '每元智能 V = I ÷ (N/1M × 输出单价)：在典型基准任务上，一元钱（或一美元）能买到的智能分。速度不计入 V，由 D 单独体现。',
    method5: '双币种：有官方双币定价的模型（DeepSeek、Kimi、Qwen、GLM、Mimo）按各自官方价独立计算；仅美元定价的模型按 1 USD = 7.2 CNY 换算。',
    method6: '默认排序为本页语言对应币种的每元智能降序，点击表头可按其他指标重排。',
    llmNoteSource: '数据更新于 2026-10-02：基准得分、速度与 Token 消耗来自 Artificial Analysis 独立实测；价格来自各厂商官方 API 定价。',
    llmNoteEst: 'GLM-5.3-FlashX 无独立实测，采用 GLM-5.3-Flash 数据估算（标 ~）。',
    llmNoteDs: 'DeepSeek 高峰/空闲为同一模型：能力与速度相同，仅价格不同，空闲版性价比更高。',
    llmFaq1q: '智能指数和每元智能是怎么计算的？',
    llmFaq1a: '智能指数是 Terminal-Bench 4.0、Humanity\'s Last Exam、AutomationBench 三项独立实测得分的平均值。每元智能 = 智能指数 ÷ 每任务成本，其中每任务成本 = 实测的每任务输出 Token 数 × 模型输出单价——因此话痨模型即使单价低，也可能因 Token 消耗大而性价比变低。',
    llmFaq2q: '数据来源是什么，可靠吗？',
    llmFaq2a: '能力、速度与 Token 消耗均来自 Artificial Analysis 的独立实测（统一基准环境，非厂商自报）；价格取自各厂商官方 API 定价页。例如 Claude Sonnet 5.5 在 HLE 上的实测得分 55.0% 与 Anthropic 官方公布的 54.9% 基本一致。',
    llmFaq3q: '为什么速度快的模型性价比不一定高？',
    llmFaq3a: '每元智能只衡量“花一元钱买到多少智能”，速度由智能密度（D = 智能指数/100 × 速度）单独体现。例如 Gemini 3.8 Flash 智能密度第一，但 Token 消耗较高使其性价比位于中游。在意吞吐看智能密度列，在意成本看每元智能列。',
    llmToolName: '大模型性价比排行榜',
    llmToolDesc: '独立实测基准下的智能密度与每元智能对比'
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
    tokenHeroSubtitle: 'Pick or enter a model, enter your daily usage, and instantly estimate API costs in CNY / USD',
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
    faq4a: 'Prices are updated whenever model pricing changes; the page shows the latest update date (currently 2026-10-01). Prices are for reference only - check each model’s official pricing page for the latest rates.',
    llmPageTitle: 'LLM Value Ranking',
    llmHeroSubtitle: 'Independently measured benchmarks: how much intelligence each yuan or dollar buys',
    llmRankSection: 'Value ranking',
    rankSortHint: 'Click a column header to sort',
    rankColModel: 'Model',
    rankColIntelligence: 'Intelligence',
    rankColSpeed: 'Speed tok/s',
    rankColTokens: 'Tokens/task',
    rankColDensity: 'Density',
    rankColPrice: 'Output price/1M',
    rankColValueCny: 'Value ¥',
    rankColValueUsd: 'Value $',
    estMarkTitle: 'No independent measurement; estimated from GLM-5.3-Flash data',
    methodTitle: 'Methodology',
    method1: 'Intelligence I: the arithmetic mean of Terminal-Bench 4.0 (agentic terminal coding), Humanity’s Last Exam (multidisciplinary reasoning) and AutomationBench (SaaS workflow automation), all independently measured by Artificial Analysis under a unified harness — not vendor-reported.',
    method2: 'Speed S and token use N: both AA-measured. S is output speed in tokens/s; N is the average output tokens (including reasoning) per benchmark task, so verbose models are charged for their real cost.',
    method3: 'Intelligence density D = I/100 × S: quality-weighted tokens per second.',
    method4: 'Intelligence per unit V = I ÷ (N/1M × output price): the benchmark points one yuan (or dollar) buys on a typical task. Speed is not part of V; it is captured by D.',
    method5: 'Dual currency: models with official dual pricing (DeepSeek, Kimi, Qwen, GLM, Mimo) are computed from each official price independently; USD-only models convert at 1 USD = 7.2 CNY.',
    method6: 'Default sort is intelligence per unit in this page’s currency (descending); click any column header to re-sort.',
    llmNoteSource: 'Data updated 2026-10-02: benchmark scores, speed and token use are independently measured by Artificial Analysis; prices come from official provider API pricing pages.',
    llmNoteEst: 'GLM-5.3-FlashX has no independent measurement; values are estimated from GLM-5.3-Flash (marked ~).',
    llmNoteDs: 'DeepSeek peak/off-peak share intelligence and speed; only prices differ, so off-peak ranks higher on value.',
    llmFaq1q: 'How are the intelligence index and intelligence per unit computed?',
    llmFaq1a: 'The intelligence index is the average of three independently measured benchmarks: Terminal-Bench 4.0, Humanity’s Last Exam and AutomationBench. Intelligence per unit = intelligence index ÷ cost per task, where cost per task = measured output tokens per task × the model’s output price — so a verbose model can offer poor value despite a low unit price.',
    llmFaq2q: 'Where does the data come from?',
    llmFaq2a: 'Capability, speed and token use are independently measured by Artificial Analysis (unified harness, not vendor-reported); prices come from official provider pricing pages. For example, Claude Sonnet 5.5 measures 55.0% on HLE, matching Anthropic’s published 54.9%.',
    llmFaq3q: 'Why isn’t the fastest model the best value?',
    llmFaq3a: 'Intelligence per unit measures how much intelligence one unit of money buys; speed is captured separately by intelligence density (D = I/100 × speed). Gemini 3.8 Flash tops density, but its higher token use puts it mid-table on value. Watch the density column for throughput and the value columns for cost.',
    llmToolName: 'LLM Value Ranking',
    llmToolDesc: 'Intelligence density and value per dollar from independently measured benchmarks'
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
