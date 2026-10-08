import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './notfound.css';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '404 — Page Not Found | Scaffold';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="notfound-wrapper">
      <div className="notfound-terminal">
        {/* Terminal Header */}
        <div className="notfound-terminal-header">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
            <span className="text-xs text-muted font-mono ml-2">error_code_404.sh</span>
          </div>
          <span className="tag">ROUTE RESOLUTION FAILURE</span>
        </div>

        {/* Terminal Body */}
        <div className="notfound-terminal-body space-y-6">
          <div className="space-y-2">
            <div className="text-xs text-muted">
              <span className="notfound-prompt">$</span> curl -I https://scaffold.dev{location.pathname}
            </div>
            <div className="font-mono text-sm text-red-400 font-semibold">
              HTTP/2 404 NOT FOUND: No route registered for path
            </div>
          </div>

          <div className="py-2">
            <div className="font-mono font-black text-6xl md:text-7xl tracking-tight" style={{ color: 'var(--fg)' }}>
              404<span style={{ color: 'var(--accent)' }}>_</span>
            </div>
            <p className="text-sm md:text-base font-mono font-bold mt-2" style={{ color: 'var(--accent)' }}>
              Target route not found in kernel registry.
            </p>
          </div>

          <div
            className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
            style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
          >
            <div className="text-muted">Requested Path:</div>
            <div>
              <span className="notfound-path-badge">{location.pathname}</span>
            </div>
            <p className="text-muted pt-1">
              The route you requested does not exist or may have been relocated during system compilation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              to="/"
              className="btn-primary text-xs px-5 py-2.5 w-full sm:w-auto justify-center font-mono flex items-center gap-2"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              <i className="fas fa-home"></i> Go Home
            </Link>
            <Link
              to="/dashboard"
              className="btn-secondary text-xs px-5 py-2.5 w-full sm:w-auto justify-center font-mono flex items-center gap-2"
            >
              <i className="fas fa-chart-line"></i> Go to Dashboard
            </Link>
          </div>

          <div className="border-t pt-4 flex items-center justify-between text-[11px] text-muted font-mono" style={{ borderColor: 'var(--border)' }}>
            <span>Scaffold Diagnostic Kernel</span>
            <span>
              <span style={{ color: 'var(--accent)' }}>$</span> ready <span className="logo-cursor"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
