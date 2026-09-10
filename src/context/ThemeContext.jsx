import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const THEMES = ['dark', 'light', 'cyber'];
const STORAGE_KEY = 'scaffold-theme';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.includes(saved)) return saved;
    } catch (e) {
      console.warn('Unable to read theme from localStorage:', e);
    }
    return 'dark';
  });

  const changeTheme = useCallback((newTheme, animate = true) => {
    if (!THEMES.includes(newTheme)) return;

    if (animate && typeof document !== 'undefined') {
      document.body.classList.add('theme-anim');
      setTimeout(() => {
        document.body.classList.remove('theme-anim');
      }, 700);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }

    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage:', e);
    }

    setThemeState(newTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const currentIndex = THEMES.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      const nextTheme = THEMES[nextIndex];

      if (typeof document !== 'undefined') {
        document.body.classList.add('theme-anim');
        setTimeout(() => {
          document.body.classList.remove('theme-anim');
        }, 700);
        document.documentElement.setAttribute('data-theme', nextTheme);
      }

      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (e) {
        console.warn('Unable to persist theme to localStorage:', e);
      }

      return nextTheme;
    });
  }, []);

  // Initial sync & keydown shortcut
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }

    const handleKeyDown = (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        cycleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, cycleTheme]);

  const value = useMemo(() => ({
    theme,
    setTheme: changeTheme,
    cycleTheme,
    themes: THEMES
  }), [theme, changeTheme, cycleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
