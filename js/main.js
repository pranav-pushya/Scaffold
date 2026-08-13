// === SCAFFOLD APPLICATION BOOTSTRAP ===
// SPA Entry Point: Initializes Theme Manager and Client Router

import { initThemeManager } from './theme/themeManager.js';
import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize multi-theme system
    initThemeManager();

    // 2. Initialize hash routing
    initRouter();
});
