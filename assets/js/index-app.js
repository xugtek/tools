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
      ? 'xugtek: lightweight, fast and practical online tools, featuring a free token/API cost calculator covering DeepSeek, Kimi, Qwen and GLM pricing.'
      : 'xugtek：轻量、快速、实用的在线工具集合，提供免费的 Token/API 费用计算器，支持 DeepSeek、Kimi、Qwen、GLM 等大模型价格估算。');
  }
}

function init() {
  initSite();
  setDocumentLanguage();
  document.addEventListener('xugtek:langchange', setDocumentLanguage);
}

init();
