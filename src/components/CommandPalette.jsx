import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';

export default function CommandPalette({ isOpen, onClose, onOpenSettings, onToggleFullScreen, onTriggerLogout }) {
  const navigate = useNavigate();
  const { setTheme, cycleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allCommands = useMemo(() => [
    // Navigation
    {
      id: 'nav-home',
      category: 'Navigation',
      icon: 'fa-home',
      title: 'Go to Home',
      description: 'Landing page, metrics & features overview',
      shortcut: 'Alt + 1',
      action: () => navigate('/')
    },
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      icon: 'fa-chart-line',
      title: 'Go to Dashboard',
      description: 'Activity stats, analytics & quick actions',
      shortcut: 'Alt + 2',
      action: () => navigate('/dashboard')
    },
    {
      id: 'nav-profile',
      category: 'Navigation',
      icon: 'fa-user-edit',
      title: 'Go to Profile',
      description: 'Edit career profile, competencies & education',
      shortcut: 'Alt + 3',
      action: () => navigate('/profile')
    },
    {
      id: 'nav-tracker',
      category: 'Navigation',
      icon: 'fa-tasks',
      title: 'Go to Tracker',
      description: 'Manage project pipelines & application stages',
      shortcut: 'Alt + 4',
      action: () => navigate('/tracker')
    },
    {
      id: 'nav-portfolio',
      category: 'Navigation',
      icon: 'fa-globe',
      title: 'Go to Portfolio',
      description: 'Live developer showcase for recruiters',
      shortcut: 'Alt + 5',
      action: () => navigate('/portfolio')
    },
    {
      id: 'nav-resume',
      category: 'Navigation',
      icon: 'fa-file-invoice',
      title: 'Go to Resume',
      description: 'ATS resume sheet & PDF export preview',
      shortcut: 'Alt + 6',
      action: () => navigate('/resume')
    },
    {
      id: 'nav-assistant',
      category: 'Navigation',
      icon: 'fa-brain',
      title: 'Go to Assistant',
      description: 'Groq-powered AI developer copilot',
      shortcut: 'Alt + 7',
      action: () => navigate('/assistant')
    },

    // Actions & Tools
    {
      id: 'action-add-project',
      category: 'Actions & Tools',
      icon: 'fa-plus-circle',
      title: 'Add New Project / Card',
      description: 'Open the tracker card creation dialog',
      shortcut: 'Alt + N',
      action: () => {
        if (window.location.pathname !== '/tracker') {
          navigate('/tracker?new=1');
        } else {
          const btn = document.getElementById('toggleCardFormBtn');
          if (btn) btn.click();
        }
      }
    },
    {
      id: 'action-export-pdf',
      category: 'Actions & Tools',
      icon: 'fa-print',
      title: 'Export / Print Resume PDF',
      description: 'Generate clean print/PDF view of ATS resume',
      shortcut: 'Ctrl + P',
      action: () => {
        if (window.location.pathname !== '/resume') {
          navigate('/resume');
          setTimeout(() => window.print(), 500);
        } else {
          window.print();
        }
      }
    },
    {
      id: 'action-fullscreen-mode',
      category: 'Actions & Tools',
      icon: 'fa-expand',
      title: 'Toggle Full Screen Mode',
      description: 'Enter or exit native full screen view',
      shortcut: 'Alt + F',
      action: () => onToggleFullScreen?.()
    },
    {
      id: 'action-open-settings',
      category: 'Actions & Tools',
      icon: 'fa-gear',
      title: 'Open Workspace Settings',
      description: 'Configure portfolio visibility, data sync & UX',
      shortcut: '?',
      action: () => onOpenSettings?.()
    },
    {
      id: 'action-focus-ai',
      category: 'Actions & Tools',
      icon: 'fa-terminal',
      title: 'Focus AI Prompt',
      description: 'Jump directly to AI chat composer',
      shortcut: 'Alt + A',
      action: () => {
        if (window.location.pathname !== '/assistant') {
          navigate('/assistant');
          setTimeout(() => document.getElementById('chatInput')?.focus(), 300);
        } else {
          document.getElementById('chatInput')?.focus();
        }
      }
    },
    {
      id: 'action-logout',
      category: 'Actions & Tools',
      icon: 'fa-sign-out-alt',
      title: 'Sign Out / Logout',
      description: 'End current authentication session safely',
      shortcut: 'Alt + L',
      action: () => onTriggerLogout?.()
    },

    // Theme Customization
    {
      id: 'theme-cycle',
      category: 'Themes',
      icon: 'fa-palette',
      title: 'Cycle Theme Mode',
      description: 'Switch between Dark, Light, and Cyber',
      shortcut: 'T',
      action: () => cycleTheme()
    },
    {
      id: 'theme-dark',
      category: 'Themes',
      icon: 'fa-moon',
      title: 'Set Theme: Dark',
      description: 'Deep obsidian contrast theme',
      shortcut: '',
      action: () => setTheme('dark')
    },
    {
      id: 'theme-light',
      category: 'Themes',
      icon: 'fa-sun',
      title: 'Set Theme: Light',
      description: 'Clean high-readability daylight theme',
      shortcut: '',
      action: () => setTheme('light')
    },
    {
      id: 'theme-cyber',
      category: 'Themes',
      icon: 'fa-terminal',
      title: 'Set Theme: Cyber Terminal',
      description: 'Matrix green CRT scanlines & phosphor glow',
      shortcut: '',
      action: () => setTheme('cyber')
    }
  ], [navigate, setTheme, cycleTheme, onToggleFullScreen, onOpenSettings, onTriggerLogout]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return allCommands;
    const q = search.toLowerCase();
    return allCommands.filter((cmd) =>
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.shortcut.toLowerCase().includes(q)
    );
  }, [allCommands, search]);

  // Auto-scroll active item into view when navigating with arrow keys
  useEffect(() => {
    if (!listRef.current || filteredCommands.length === 0) return;
    const selectedEl = listRef.current.children[selectedIndex];
    if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
      selectedEl.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [selectedIndex, filteredCommands.length]);

  // Lock body scroll and isolate scrolling strictly to the Command Palette
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleWheelOutside = (e) => {
      // If scroll occurs outside the scrollable command list, prevent page scrolling
      if (listRef.current && !listRef.current.contains(e.target)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheelOutside, { passive: false });
    window.addEventListener('touchmove', handleWheelOutside, { passive: false });

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('wheel', handleWheelOutside);
      window.removeEventListener('touchmove', handleWheelOutside);
    };
  }, [isOpen]);

  // Keyboard navigation within palette
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredCommands[selectedIndex];
      if (target) {
        onClose();
        target.action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="commandPaletteOverlay"
      className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 md:pt-24 px-4 transition-all duration-200"
      onClick={onClose}
    >
      <div
        id="commandPaletteModal"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border-strong)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          overscrollBehavior: 'contain'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          className="p-4 border-b flex items-center gap-3 flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
        >
          <i className="fas fa-terminal text-sm" style={{ color: 'var(--accent)' }}></i>
          <input
            ref={inputRef}
            type="text"
            id="commandPaletteInput"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, pages, actions... (Ctrl+K or /)"
            className="w-full bg-transparent border-none outline-none font-mono text-sm"
            style={{ color: 'var(--fg)' }}
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="scaffold-kbd text-[10px]">ESC</kbd>
        </div>

        {/* Filtered Command List */}
        <div
          ref={listRef}
          id="commandPaletteList"
          className="max-h-[380px] overflow-y-auto p-2 space-y-1"
          style={{ overscrollBehavior: 'contain' }}
        >
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-muted font-mono text-xs">
              <i className="fas fa-ghost text-lg mb-2 block opacity-40"></i>
              No commands matching "{search}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    onClose();
                    cmd.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-all font-mono text-xs ${
                    isSelected ? 'shadow-sm' : ''
                  }`}
                  style={{
                    background: isSelected ? 'rgba(var(--accent-rgb), 0.12)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'transparent'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                      style={{
                        background: isSelected ? 'var(--accent)' : 'var(--bg-elev)',
                        color: isSelected ? 'var(--bg)' : 'var(--fg)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <i className={`fas ${cmd.icon}`}></i>
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>
                        {cmd.title}
                      </div>
                      <div className="text-[11px] text-muted">
                        {cmd.description}
                      </div>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {cmd.shortcut.split('+').map((keyPart, kIdx) => (
                        <kbd key={kIdx} className="scaffold-kbd text-[10px]">
                          {keyPart.trim()}
                        </kbd>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          className="px-4 py-2.5 border-t flex items-center justify-between font-mono text-[11px] text-muted flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
        >
          <div className="flex items-center gap-3">
            <span><kbd className="scaffold-kbd text-[9px]">↑</kbd> <kbd className="scaffold-kbd text-[9px]">↓</kbd> navigate</span>
            <span><kbd className="scaffold-kbd text-[9px]">↵</kbd> select</span>
          </div>
          <span>Scaffold Command Palette</span>
        </div>
      </div>
    </div>
  );
}
