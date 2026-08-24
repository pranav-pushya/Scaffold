import { initThemeManager } from './theme/themeManager.js';
import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initRouter();
});
