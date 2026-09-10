import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { logoutUser } from '../firebase/authService.js';

export default function Navbar() {
  const { currentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logoutUser();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  const navItems = [
    { to: '/', label: 'home' },
    { to: '/dashboard', label: 'dashboard' },
    { to: '/profile', label: 'profile' },
    { to: '/tracker', label: 'tracker' },
    { to: '/portfolio', label: 'portfolio' },
    { to: '/resume', label: 'resume' },
    { to: '/assistant', label: 'assistant' },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(var(--accent-rgb), 0.02)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="font-mono font-bold text-lg flex items-center"
            style={{ color: 'var(--fg)', textDecoration: 'none' }}
          >
            <span style={{ color: 'var(--accent)' }}>&lt;/S&gt;</span>caffold
            <span className="logo-cursor"></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 font-mono text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `hover-link ${isActive ? 'active-nav-link' : ''}`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent)' : undefined,
                  fontWeight: isActive ? 600 : undefined,
                  textDecoration: 'none'
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme Toggle */}
            <div className="theme-toggle" role="group" aria-label="Theme selector">
              <button
                type="button"
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Dark"
                aria-label="Dark theme"
              >
                <i className="fas fa-moon"></i>
              </button>
              <button
                type="button"
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                title="Light"
                aria-label="Light theme"
              >
                <i className="fas fa-sun"></i>
              </button>
              <button
                type="button"
                className={`theme-btn ${theme === 'cyber' ? 'active' : ''}`}
                onClick={() => setTheme('cyber')}
                title="Cyber"
                aria-label="Cyber theme"
              >
                <i className="fas fa-terminal"></i>
              </button>
            </div>

            {/* Auth Button */}
            {currentUser ? (
              <button
                id="logoutBtn"
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="btn-secondary text-xs px-2.5 py-1.5 md:px-3"
                style={{ padding: '6px 12px' }}
              >
                <i className="fas fa-sign-out-alt"></i> <span className="hidden sm:inline">logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-xs px-2.5 py-1.5 md:px-3"
                style={{ padding: '6px 12px', textDecoration: 'none' }}
              >
                <i className="fas fa-lock"></i> <span className="hidden sm:inline">login</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobileMenuBtn"
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="btn-secondary text-xs md:hidden flex items-center justify-center"
              title="Toggle Navigation Menu"
              style={{ padding: '7px 11px', borderRadius: '8px' }}
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-sm`}></i>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobileNavMenu"
            className="md:hidden border-b shadow-2xl p-5 space-y-3 font-mono text-sm"
            style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
          >
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-link block py-2 border-b"
              style={({ isActive }) => ({
                borderColor: 'var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--fg)',
                fontWeight: isActive ? 600 : undefined,
                textDecoration: 'none'
              })}
            >
              <i className="fas fa-home mr-2 text-emerald-500"></i> home
            </NavLink>
            <NavLink
              to="/dashboard"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-link block py-2 border-b"
              style={({ isActive }) => ({
                borderColor: 'var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--fg)',
                fontWeight: isActive ? 600 : undefined,
                textDecoration: 'none'
              })}
            >
              <i className="fas fa-chart-line mr-2 text-cyan-500"></i> dashboard
            </NavLink>
            <NavLink
              to="/profile"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-link block py-2 border-b"
              style={({ isActive }) => ({
                borderColor: 'var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--fg)',
                fontWeight: isActive ? 600 : undefined,
                textDecoration: 'none'
              })}
            >
              <i className="fas fa-user-edit mr-2 text-amber-500"></i> profile
            </NavLink>
            <NavLink
              to="/tracker"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-link block py-2 border-b"
              style={({ isActive }) => ({
                borderColor: 'var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--fg)',
                fontWeight: isActive ? 600 : undefined,
                textDecoration: 'none'
              })}
            >
              <i className="fas fa-tasks mr-2 text-emerald-500"></i> tracker
            </NavLink>
            <NavLink
              to="/portfolio"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-link block py-2 border-b"
              style={({ isActive }) => ({
                borderColor: 'var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--fg)',
                fontWeight: isActive ? 600 : undefined,
                textDecoration: 'none'
              })}
            >
              <i className="fas fa-globe mr-2 text-blue-500"></i> portfolio
            </NavLink>
            <NavLink
              to="/resume"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-link block py-2 border-b"
              style={({ isActive }) => ({
                borderColor: 'var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--fg)',
                fontWeight: isActive ? 600 : undefined,
                textDecoration: 'none'
              })}
            >
              <i className="fas fa-file-invoice mr-2 text-purple-500"></i> resume
            </NavLink>
            <NavLink
              to="/assistant"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-link block py-2"
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--fg)',
                fontWeight: isActive ? 600 : undefined,
                textDecoration: 'none'
              })}
            >
              <i className="fas fa-brain mr-2"></i> assistant
            </NavLink>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutModal && (
        <div
          id="logoutModalOverlay"
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="p-6 rounded-xl max-w-md w-full mx-4 shadow-2xl space-y-4 border"
            style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <i className="fas fa-sign-out-alt text-2xl"></i>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--fg)' }}>
                Sign Out of Scaffold?
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Are you sure you want to log out of your current session? You will be redirected to the account login portal.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="cancelLogoutBtn"
                onClick={() => setShowLogoutModal(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirmLogoutBtn"
                onClick={handleConfirmLogout}
                className="btn-primary text-xs px-4 py-2"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
