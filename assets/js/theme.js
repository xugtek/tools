const STORAGE_KEY = 'xugtek-theme';

function getSystemTheme() {
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme);
  }
}

export function initTheme() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  applyTheme(saved || getSystemTheme());

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });
}
