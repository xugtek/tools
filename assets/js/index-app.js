import { getLang, t } from './i18n.js';
import { initSite } from './site.js';

function setDocumentLanguage() {
  document.title = `${t('siteName')} - ${t('heroTitle')}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', getLang() === 'en'
      ? 'XugTek Tools: lightweight, fast, SEO-friendly and privacy-conscious online tools.'
      : 'XugTek 工具站：轻量、快速、关注 SEO 与隐私的在线工具集合。');
  }
}

function init() {
  initSite();
  setDocumentLanguage();
  document.addEventListener('xugtek:langchange', setDocumentLanguage);
}

init();
