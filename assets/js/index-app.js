import { getLang, t } from './i18n.js';
import { initSite } from './site.js';

function setDocumentLanguage() {
  document.title = `${t('siteName')} - ${t('heroTitle')}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', getLang() === 'en'
      ? 'xugtek: lightweight, fast and practical online tools.'
      : 'xugtek：轻量、快速、实用的在线工具集合。');
  }
}

function init() {
  initSite();
  setDocumentLanguage();
  document.addEventListener('xugtek:langchange', setDocumentLanguage);
}

init();
