import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getProfile, getProjects } from '../firebase/firestoreService.js';

export default function SettingsDrawer({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  // --- Setting 7: Public Portfolio Visibility ---
  const [isPortfolioPublic, setIsPortfolioPublic] = useState(() => {
    try {
      const saved = localStorage.getItem('scaffold_portfolio_visibility');
      return saved !== 'private';
    } catch {
      return true;
    }
  });

  const [linkCopied, setLinkCopied] = useState(false);

  const handleToggleVisibility = () => {
    const nextVal = !isPortfolioPublic;
    setIsPortfolioPublic(nextVal);
    try {
      localStorage.setItem('scaffold_portfolio_visibility', nextVal ? 'public' : 'private');
    } catch (e) {
      console.warn('Failed to save portfolio visibility:', e);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/portfolio`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // --- Setting 8: Cloud Data Sync Status ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('On page load');

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      if (currentUser?.uid) {
        const [profileData, projectsData] = await Promise.all([
          getProfile(currentUser.uid).catch(err => {
            console.warn('Profile sync warning:', err);
            return null;
          }),
          getProjects(currentUser.uid).catch(err => {
            console.warn('Projects sync warning:', err);
            return null;
          })
        ]);
        if (profileData && Object.keys(profileData).length > 0) {
          localStorage.setItem('scaffold_profile_store', JSON.stringify(profileData));
        }
        if (Array.isArray(projectsData) && projectsData.length > 0) {
          localStorage.setItem('scaffold_tracker_store', JSON.stringify(projectsData));
        }
      }
    } catch (err) {
      console.warn('Manual sync error:', err);
    } finally {
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  // --- Category 1: 💾 Data Management & Backup ---
  const [dataNotice, setDataNotice] = useState(null);

  // 1A. Export Workspace Data (JSON)
  const handleExportData = () => {
    try {
      const exportObject = {
        scaffold_version: '1.2.0-react',
        export_timestamp: new Date().toISOString(),
        user_email: currentUser?.email || 'guest',
        profile: (() => {
          try { return JSON.parse(localStorage.getItem('scaffold_profile_store') || '{}'); } catch { return {}; }
        })(),
        tracker_projects: (() => {
          try { return JSON.parse(localStorage.getItem('scaffold_tracker_store') || '[]'); } catch { return []; }
        })(),
        settings: {
          theme: localStorage.getItem('scaffold-theme') || 'dark',
          portfolio_visibility: localStorage.getItem('scaffold_portfolio_visibility') || 'public',
          reduce_motion: localStorage.getItem('scaffold_reduce_motion') === 'true',
          compact_mode: localStorage.getItem('scaffold_compact_mode') === 'true',
          default_landing: localStorage.getItem('scaffold_default_landing') || '/'
        }
      };

      const jsonStr = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      const dlAnchor = document.createElement('a');
      dlAnchor.href = blobUrl;
      const dateTag = new Date().toISOString().slice(0, 10);
      dlAnchor.download = `scaffold-workspace-backup-${dateTag}.json`;
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      document.body.removeChild(dlAnchor);
      URL.revokeObjectURL(blobUrl);

      setDataNotice({ type: 'success', message: 'Backup JSON downloaded successfully!' });
      setTimeout(() => setDataNotice(null), 3500);
    } catch (err) {
      console.error('Data export error:', err);
      setDataNotice({ type: 'error', message: 'Export failed: ' + err.message });
    }
  };

  // 1B. Import / Restore Data (JSON)
  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        const parsed = JSON.parse(raw);

        let restoredItems = 0;
        if (parsed.profile && typeof parsed.profile === 'object') {
          localStorage.setItem('scaffold_profile_store', JSON.stringify(parsed.profile));
          restoredItems++;
        }
        if (parsed.tracker_projects && Array.isArray(parsed.tracker_projects)) {
          localStorage.setItem('scaffold_tracker_store', JSON.stringify(parsed.tracker_projects));
          restoredItems++;
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
          if (parsed.settings.theme) localStorage.setItem('scaffold-theme', parsed.settings.theme);
          if (parsed.settings.portfolio_visibility) localStorage.setItem('scaffold_portfolio_visibility', parsed.settings.portfolio_visibility);
          if (parsed.settings.reduce_motion !== undefined) localStorage.setItem('scaffold_reduce_motion', String(parsed.settings.reduce_motion));
          if (parsed.settings.compact_mode !== undefined) localStorage.setItem('scaffold_compact_mode', String(parsed.settings.compact_mode));
          if (parsed.settings.default_landing) localStorage.setItem('scaffold_default_landing', parsed.settings.default_landing);
          restoredItems++;
        }

        setDataNotice({
          type: 'success',
          message: `Workspace data restored (${restoredItems} modules)! Refreshing will apply full state.`,
          showReload: true
        });
      } catch (err) {
        console.error('Import parse error:', err);
        setDataNotice({ type: 'error', message: 'Invalid JSON file: ' + err.message });
      }
    };
    reader.readAsText(file);
    // Reset file input so subsequent identical files can be selected
    e.target.value = '';
  };

  // 1C. Purge Local Cache
  const handlePurgeCache = () => {
    if (window.confirm('Clear all local cached items (profile and tracker store)? Your Firebase cloud data will remain safe.')) {
      try {
        localStorage.removeItem('scaffold_profile_store');
        localStorage.removeItem('scaffold_tracker_store');
        setDataNotice({
          type: 'success',
          message: 'Local cache cleared. Fresh Firestore data will sync on page visit.'
        });
        setTimeout(() => setDataNotice(null), 3000);
      } catch (err) {
        setDataNotice({ type: 'error', message: 'Failed to purge cache: ' + err.message });
      }
    }
  };

  // --- Category 2: 🎨 Appearance & UX Customization ---
  const [reduceMotion, setReduceMotion] = useState(() => {
    try {
      return localStorage.getItem('scaffold_reduce_motion') === 'true';
    } catch {
      return false;
    }
  });

  const [compactMode, setCompactMode] = useState(() => {
    try {
      return localStorage.getItem('scaffold_compact_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [defaultLanding, setDefaultLanding] = useState(() => {
    try {
      return localStorage.getItem('scaffold_default_landing') || '/';
    } catch {
      return '/';
    }
  });

  // Apply visual classes on initial mount & updates
  useEffect(() => {
    if (reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    try {
      localStorage.setItem('scaffold_reduce_motion', String(reduceMotion));
    } catch (e) {}
  }, [reduceMotion]);

  useEffect(() => {
    if (compactMode) {
      document.body.classList.add('compact-density');
    } else {
      document.body.classList.remove('compact-density');
    }
    try {
      localStorage.setItem('scaffold_compact_mode', String(compactMode));
    } catch (e) {}
  }, [compactMode]);

  const handleLandingChange = (e) => {
    const val = e.target.value;
    setDefaultLanding(val);
    try {
      localStorage.setItem('scaffold_default_landing', val);
    } catch (err) {}
  };

  // --- Setting 10: System Info calculation ---
  const storageInfo = useMemo(() => {
    try {
      let totalBytes = 0;
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('scaffold')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2;
          count++;
        }
      }
      return {
        keys: count,
        sizeKb: (totalBytes / 1024).toFixed(1)
      };
    } catch {
      return { keys: 0, sizeKb: '0.0' };
    }
  }, [isOpen, dataNotice]);

  const viewportInfo = typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : '1920 × 1080';

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        id="settingsBackdrop"
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-over Panel */}
      <aside
        id="settingsDrawer"
        role="dialog"
        aria-label="Workspace Settings"
        aria-modal="true"
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] md:w-[480px] z-[99999] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'var(--card)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.45)'
        }}
      >
        {/* Drawer Header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'var(--border-strong)', background: 'rgba(var(--accent-rgb), 0.03)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center border"
              style={{
                background: 'rgba(var(--accent-rgb), 0.1)',
                borderColor: 'var(--border-strong)',
                color: 'var(--accent)'
              }}
            >
              <i className="fas fa-gear text-base"></i>
            </div>
            <div>
              <h2 className="font-display font-bold text-base md:text-lg leading-tight" style={{ color: 'var(--fg)' }}>
                Workspace Settings
              </h2>
              <p className="text-xs text-muted font-mono">Platform preferences, UX &amp; diagnostics</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Settings Drawer"
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-elev)',
              color: 'var(--muted)'
            }}
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Feedback Notice Banner */}
          {dataNotice && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
                dataNotice.type === 'error'
                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <i className={`fas ${dataNotice.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
                <span>{dataNotice.message}</span>
              </div>
              {dataNotice.showReload && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn-primary text-[10px] px-2.5 py-1 whitespace-nowrap"
                  style={{ background: '#10b981', color: '#fff' }}
                >
                  Reload Now
                </button>
              )}
            </div>
          )}

          {/* SECTION 1: 💾 Data Management & Backup */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-database text-xs" style={{ color: 'var(--accent)' }}></i>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Data Management &amp; Backup
                </h3>
              </div>
              <span className="font-mono text-[10px] text-muted">Portable JSON</span>
            </div>

            <div
              className="p-4 rounded-xl border space-y-3 font-mono text-xs"
              style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
            >
              <div className="text-muted leading-relaxed">
                Export or restore your full workspace state including profile info, tracker projects, and UI preferences.
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Export Button */}
                <button
                  type="button"
                  id="exportDataBtn"
                  onClick={handleExportData}
                  className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                  title="Download complete JSON backup"
                >
                  <i className="fas fa-file-export text-emerald-400"></i>
                  <span>Export JSON</span>
                </button>

                {/* Import Button */}
                <button
                  type="button"
                  id="importDataBtn"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                  title="Restore workspace from JSON file"
                >
                  <i className="fas fa-file-import text-cyan-400"></i>
                  <span>Import JSON</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportFileChange}
                />
              </div>

              {/* Purge Cache Action */}
              <div
                className="pt-3 border-t flex items-center justify-between text-[11px]"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="text-muted">Need a fresh sync?</span>
                <button
                  type="button"
                  id="purgeCacheBtn"
                  onClick={handlePurgeCache}
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 underline"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i> Purge Local Cache
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 2: 🎨 Appearance & UX Customization */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-sliders-h text-xs" style={{ color: 'var(--accent)' }}></i>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Appearance &amp; UX
                </h3>
              </div>
              <span className="font-mono text-[10px] text-muted">Personalization</span>
            </div>

            <div
              className="p-4 rounded-xl border space-y-3.5"
              style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
            >
              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-semibold" style={{ color: 'var(--fg)' }}>
                    Reduce Motion &amp; Glow
                  </div>
                  <div className="text-[11px] text-muted">
                    Disables floating ambient dots, mouse glow &amp; cyber scanlines
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  id="toggleReduceMotionBtn"
                  aria-checked={reduceMotion}
                  aria-label="Toggle Reduced Motion"
                  onClick={() => setReduceMotion((prev) => !prev)}
                  className={`scaffold-toggle-track flex-shrink-0 ${reduceMotion ? 'checked' : ''}`}
                >
                  <span className="scaffold-toggle-thumb" />
                </button>
              </div>

              {/* Compact Density Mode Toggle */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="font-mono text-xs font-semibold" style={{ color: 'var(--fg)' }}>
                    Compact Density Mode
                  </div>
                  <div className="text-[11px] text-muted">
                    Tighter row &amp; card padding for high-density tracker view
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  id="toggleCompactModeBtn"
                  aria-checked={compactMode}
                  aria-label="Toggle Compact Density Mode"
                  onClick={() => setCompactMode((prev) => !prev)}
                  className={`scaffold-toggle-track flex-shrink-0 ${compactMode ? 'checked' : ''}`}
                >
                  <span className="scaffold-toggle-thumb" />
                </button>
              </div>

              {/* Default Landing Route Select */}
              <div className="pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold" style={{ color: 'var(--fg)' }}>Default Landing Route:</span>
                </div>
                <select
                  id="defaultLandingSelect"
                  value={defaultLanding}
                  onChange={handleLandingChange}
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono border"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--fg)'
                  }}
                >
                  <option value="/">Home (/)</option>
                  <option value="/dashboard">Dashboard (/dashboard)</option>
                  <option value="/tracker">Tracker (/tracker)</option>
                  <option value="/profile">Profile (/profile)</option>
                  <option value="/portfolio">Portfolio (/portfolio)</option>
                  <option value="/resume">Resume (/resume)</option>
                  <option value="/assistant">Assistant (/assistant)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 3: Setting 7 - Public Portfolio Visibility */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-globe text-xs" style={{ color: 'var(--accent)' }}></i>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Portfolio Visibility
                </h3>
              </div>
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{
                  background: isPortfolioPublic ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isPortfolioPublic ? '#10b981' : '#f59e0b',
                  border: `1px solid ${isPortfolioPublic ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}
              >
                {isPortfolioPublic ? '● Public' : '○ Private'}
              </span>
            </div>

            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-mono text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                    {isPortfolioPublic ? 'Public Showcase Active' : 'Private Draft Mode'}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {isPortfolioPublic
                      ? 'Anyone with your link can view your live portfolio, projects, and credentials.'
                      : 'Your portfolio is restricted to private preview. External visitors cannot see it.'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  id="togglePortfolioVisibilityBtn"
                  aria-checked={isPortfolioPublic}
                  aria-label="Toggle Public Portfolio Visibility"
                  onClick={handleToggleVisibility}
                  className={`scaffold-toggle-track flex-shrink-0 ${isPortfolioPublic ? 'checked' : ''}`}
                >
                  <span className="scaffold-toggle-thumb" />
                </button>
              </div>

              {/* Share link action */}
              <div
                className="pt-3 border-t flex items-center justify-between gap-2"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="font-mono text-xs truncate text-muted select-all">
                  /portfolio
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1.5"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  <i className={`fas ${linkCopied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                  <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 4: Setting 8 - Cloud Data Sync Status */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-cloud text-xs" style={{ color: 'var(--accent)' }}></i>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Cloud Data Sync
                </h3>
              </div>
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{
                  background: currentUser ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: currentUser ? '#10b981' : '#eab308',
                  border: currentUser ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)'
                }}
              >
                {currentUser ? '● Cloud Connected' : '○ Local Session'}
              </span>
            </div>

            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${currentUser ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {currentUser && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute animate-ping opacity-75"></span>}
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold" style={{ color: 'var(--fg)' }}>
                      Firebase Firestore Sync
                    </div>
                    <div className="text-[11px] text-muted truncate max-w-[200px]">
                      {currentUser ? currentUser.email : 'Local Session (Sign in to sync)'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                  title="Re-sync workspace data with Firestore"
                >
                  <i className={`fas fa-sync-alt ${isSyncing ? 'animate-spin text-emerald-400' : ''}`}></i>
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>

              <div
                className="pt-2 border-t flex items-center justify-between font-mono text-[11px] text-muted"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-emerald-400 animate-pulse' : (currentUser ? 'bg-emerald-500' : 'bg-amber-400')}`}></span>
                  Status: {isSyncing ? 'Syncing...' : (currentUser ? 'Synced' : 'Local Only')}
                </span>
                <span>Last sync: {lastSyncTime}</span>
              </div>
            </div>
          </section>

          {/* SECTION 5: Setting 9 - Keyboard Shortcuts Reference */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-keyboard text-xs" style={{ color: 'var(--accent)' }}></i>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Keyboard Shortcuts Guide
                </h3>
              </div>
              <span className="font-mono text-[10px] text-muted">Full Reference</span>
            </div>

            <div
              className="p-4 rounded-xl border space-y-2.5 font-mono text-xs"
              style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-muted">Command &amp; Search Palette</span>
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    <kbd className="scaffold-kbd">Ctrl</kbd>+<kbd className="scaffold-kbd">K</kbd>
                  </span>
                  <span className="text-[10px] text-muted">or</span>
                  <kbd className="scaffold-kbd">/</kbd>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Quick Add Card</span>
                <span className="flex items-center gap-0.5">
                  <kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">N</kbd>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Export / Print Resume PDF</span>
                <span className="flex items-center gap-0.5">
                  <kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">E</kbd>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Focus AI Copilot Prompt</span>
                <span className="flex items-center gap-0.5">
                  <kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">A</kbd>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Toggle Full Screen Mode</span>
                <span className="flex items-center gap-0.5">
                  <kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">F</kbd>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Quick Sign Out</span>
                <span className="flex items-center gap-0.5">
                  <kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">L</kbd>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Cycle Theme (Dark/Light/Cyber)</span>
                <kbd className="scaffold-kbd">T</kbd>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Toggle Settings Drawer</span>
                <kbd className="scaffold-kbd">?</kbd>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Close Drawer / Modals</span>
                <kbd className="scaffold-kbd">Esc</kbd>
              </div>

              <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[11px] text-muted mb-1">Quick Module Navigation:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Home</span>
                    <span className="flex items-center gap-0.5"><kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">1</kbd></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Dashboard</span>
                    <span className="flex items-center gap-0.5"><kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">2</kbd></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Profile</span>
                    <span className="flex items-center gap-0.5"><kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">3</kbd></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Tracker</span>
                    <span className="flex items-center gap-0.5"><kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">4</kbd></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Portfolio</span>
                    <span className="flex items-center gap-0.5"><kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">5</kbd></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Resume</span>
                    <span className="flex items-center gap-0.5"><kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">6</kbd></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Assistant</span>
                    <span className="flex items-center gap-0.5"><kbd className="scaffold-kbd">Alt</kbd>+<kbd className="scaffold-kbd">7</kbd></span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: Setting 10 - System Info */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-info-circle text-xs" style={{ color: 'var(--accent)' }}></i>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  System Information
                </h3>
              </div>
              <span className="font-mono text-[10px] text-muted">v1.2.0-react</span>
            </div>

            <div
              className="p-4 rounded-xl border space-y-2 font-mono text-xs"
              style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-muted">Platform:</span>
                <span style={{ color: 'var(--fg)' }} className="font-semibold">Scaffold Dev Hub</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Core Framework:</span>
                <span style={{ color: 'var(--fg)' }}>React 18.3.1 (Vite)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Backend Database:</span>
                <span style={{ color: 'var(--fg)' }}>Cloud Firestore</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Local Cache:</span>
                <span style={{ color: 'var(--fg)' }}>{storageInfo.sizeKb} KB ({storageInfo.keys} stores)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Viewport:</span>
                <span style={{ color: 'var(--fg)' }}>{viewportInfo}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Drawer Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0 font-mono text-xs"
          style={{ borderColor: 'var(--border-strong)', background: 'rgba(var(--accent-rgb), 0.02)' }}
        >
          <span className="text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            All modules operational
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            Done
          </button>
        </div>
      </aside>
    </>
  );
}
