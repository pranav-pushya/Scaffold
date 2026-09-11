import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CommandPalette from './CommandPalette.jsx';
import AiBubble from './AiBubble.jsx';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts.js';

export default function Layout() {
  const location = useLocation();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Apply saved appearance preferences on load
  useEffect(() => {
    try {
      if (localStorage.getItem('scaffold_reduce_motion') === 'true') {
        document.body.classList.add('reduce-motion');
      }
      if (localStorage.getItem('scaffold_compact_mode') === 'true') {
        document.body.classList.add('compact-density');
      }
    } catch (e) {}
  }, []);

  // Full Screen API toggle handler
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Native fullscreen request error:', err);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullScreen(false);
    }
  };

  // Sync state with native fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Wire up global shortcuts
  useGlobalShortcuts({
    onToggleSettings: () => window.dispatchEvent(new CustomEvent('scaffold-toggle-settings')),
    onTogglePalette: () => setPaletteOpen((prev) => !prev),
    onToggleFullScreen: toggleFullScreen,
    onTriggerLogout: () => window.dispatchEvent(new CustomEvent('scaffold-trigger-logout')),
    onCloseAll: () => {
      setPaletteOpen(false);
      window.dispatchEvent(new CustomEvent('scaffold-close-all'));
    }
  });

  // Event listeners for palette, fullscreen, and close all
  useEffect(() => {
    const handleOpenPalette = () => setPaletteOpen(true);
    const handleToggleFs = () => toggleFullScreen();
    const handleCloseAll = () => setPaletteOpen(false);

    window.addEventListener('scaffold-open-palette', handleOpenPalette);
    window.addEventListener('scaffold-toggle-fullscreen', handleToggleFs);
    window.addEventListener('scaffold-close-all', handleCloseAll);

    return () => {
      window.removeEventListener('scaffold-open-palette', handleOpenPalette);
      window.removeEventListener('scaffold-toggle-fullscreen', handleToggleFs);
      window.removeEventListener('scaffold-close-all', handleCloseAll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Floating Exit Full Screen Button */}
      {isFullScreen && (
        <button
          type="button"
          id="exitFullScreenBtn"
          onClick={toggleFullScreen}
          className="fixed top-20 right-4 z-50 px-3.5 py-1.5 rounded-full font-mono text-xs border shadow-2xl flex items-center gap-2 transition-all hover:scale-105"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--accent)',
            color: 'var(--accent)'
          }}
          title="Exit Full Screen Mode (Alt + F)"
        >
          <i className="fas fa-compress"></i>
          <span>Exit Full Screen (Alt+F)</span>
        </button>
      )}

      <main id="mainContent" className="flex-1">
        <Outlet key={location.pathname} />
      </main>

      <Footer />

      {/* Ambient Floating AI Copilot */}
      <AiBubble />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenSettings={() => {
          setPaletteOpen(false);
          window.dispatchEvent(new CustomEvent('scaffold-open-settings'));
        }}
        onToggleFullScreen={toggleFullScreen}
        onTriggerLogout={() => {
          setPaletteOpen(false);
          window.dispatchEvent(new CustomEvent('scaffold-trigger-logout'));
        }}
      />
    </div>
  );
}
