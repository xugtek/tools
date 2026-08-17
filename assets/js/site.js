import { initI18n } from './i18n.js';
import { initTheme } from './theme.js';

export function initSite() {
  initTheme();
  initI18n();
}
