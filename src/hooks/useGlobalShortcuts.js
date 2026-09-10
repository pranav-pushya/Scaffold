import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGlobalShortcuts({
  onToggleSettings,
  onTogglePalette,
  onToggleFullScreen,
  onTriggerLogout,
  onCloseAll
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable;

      // 1. Command & Search Palette: Ctrl+K or Cmd+K (allowed from anywhere including inputs)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        onTogglePalette?.();
        return;
      }

      // 2. Escape: Close open modals/drawers (allowed from anywhere)
      if (e.key === 'Escape') {
        onCloseAll?.();
        return;
      }

      // 3. Full Screen Mode: Alt + F (or Alt + Z fallback)
      if (e.altKey && (e.key === 'f' || e.key === 'F' || e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        onToggleFullScreen?.();
        return;
      }

      // 4. Quick Logout: Alt + L
      if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        onTriggerLogout?.();
        return;
      }

      // 5. Quick Add Project: Alt + N (or N if not typing in input)
      if ((e.altKey && (e.key === 'n' || e.key === 'N')) || (!isInput && (e.key === 'n' || e.key === 'N'))) {
        e.preventDefault();
        if (window.location.pathname !== '/tracker') {
          navigate('/tracker?new=1');
        } else {
          const btn = document.getElementById('toggleCardFormBtn');
          if (btn) btn.click();
        }
        return;
      }

      // 6. Focus AI Prompt: Alt + A
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (window.location.pathname !== '/assistant') {
          navigate('/assistant');
          setTimeout(() => document.getElementById('chatInput')?.focus(), 300);
        } else {
          document.getElementById('chatInput')?.focus();
        }
        return;
      }

      // 7. Print / Export PDF: Alt + E
      if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        if (window.location.pathname !== '/resume') {
          navigate('/resume');
          setTimeout(() => window.print(), 500);
        } else {
          window.print();
        }
        return;
      }

      // 8. Navigation: Alt + 1-7
      if (e.altKey && e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const routes = ['/', '/dashboard', '/profile', '/tracker', '/portfolio', '/resume', '/assistant'];
        const idx = parseInt(e.key, 10) - 1;
        if (routes[idx]) navigate(routes[idx]);
        return;
      }

      // Shortcuts that only fire when NOT typing in an input field:
      if (isInput) return;

      // 9. Command & Search Palette via Slash: /
      if (e.key === '/') {
        e.preventDefault();
        onTogglePalette?.();
        return;
      }

      // 10. Toggle Settings: ? or Shift + /
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onToggleSettings?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onToggleSettings, onTogglePalette, onToggleFullScreen, onTriggerLogout, onCloseAll]);
}
