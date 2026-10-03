import { getLang } from './i18n.js';
import { initSite } from './site.js';

function setDocumentLanguage() {
  const en = getLang() === 'en';
  document.title = en
    ? 'xugtek – Useful Online Tools | Free Token Cost Calculator'
    : 'xugtek - 实用在线工具 | 免费Token费用计算器';
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', en
      ? 'xugtek: lightweight free online tools — a token/API cost calculator with DeepSeek, GPT-6, Kimi, Qwen and GLM pricing in CNY/USD, plus an LLM value ranking based on independent measurements.'
      : 'xugtek：轻量、快速、实用的免费在线工具集合。提供 Token/API 费用计算器，覆盖 DeepSeek、GPT-6、Opus 5.5、Kimi、Qwen、GLM 等 26 款大模型价格，支持人民币/美元双币种与缓存命中计费，快速估算每日与每月 API 成本；另有 LLM 性价比排行榜，基于独立实测智能指数、每任务成本与耗时，综合排名 25 款主流大模型。');
  }
}

function init() {
  initSite();
  setDocumentLanguage();
  document.addEventListener('xugtek:langchange', setDocumentLanguage);
}

init();
