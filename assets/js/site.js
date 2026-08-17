import { initI18n } from './i18n.js';
import { initTheme } from './theme.js';

function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

export function initSite() {
  initTheme();
  initI18n();
  initYear();
}
