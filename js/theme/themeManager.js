// === THEME MANAGER ===
// Controls dark, light, and cyber themes with localStorage persistence and keyboard shortcuts

const THEMES = ['dark', 'light', 'cyber'];
const STORAGE_KEY = 'scaffold-theme';
const root = document.documentElement;

export function getTheme() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && THEMES.includes(saved)) return saved;
    } catch (e) { }
    return 'dark';
}

export function setTheme(theme, animate = true) {
    if (!THEMES.includes(theme)) return;

    if (animate) {
        document.body.classList.add('theme-anim');
        setTimeout(() => document.body.classList.remove('theme-anim'), 700);
    }

    root.setAttribute('data-theme', theme);
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { }

    // Update active theme toggle buttons if present
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

export function cycleTheme() {
    const current = root.getAttribute('data-theme') || getTheme();
    const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
    setTheme(THEMES[nextIndex], true);
}

export function initThemeManager() {
    // Initial load
    setTheme(getTheme(), false);

    // Event listener for theme toggle buttons
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.theme-btn');
        if (btn && btn.dataset.theme) {
            setTheme(btn.dataset.theme, true);
        }
    });

    // Keyboard shortcut: Press 'T' to cycle themes
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 't' || e.key === 'T') {
            cycleTheme();
        }
    });
}
