/**
 * Integration-style tests for ProtectedRoute.jsx
 *
 * ProtectedRoute reads auth state from AuthContext via the useAuth() hook.
 * We mock AuthContext directly to avoid any Firebase SDK calls in tests.
 *
 * Three scenarios are covered:
 *   1. loading=true  → should render the "Authenticating..." spinner
 *   2. loading=false, currentUser=null  → should redirect to /login
 *   3. loading=false, currentUser=<user> → should render children
 *
 * React Router v7 ships MemoryRouter for test environments. We inspect the
 * rendered location using a lightweight LocationDisplay helper component so
 * we can assert that a <Navigate to="/login"> actually changed the URL.
 *
 * CLO06 scope: integration-style test with mocked context.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

// --- Helpers -----------------------------------------------------------------

/**
 * Renders <ProtectedRoute> inside a full router with:
 *   - an initial entry at /dashboard (the protected page)
 *   - a stub /login route so <Navigate to="/login"> has somewhere to go
 *
 * @param {{ currentUser: object|null, loading: boolean }} authValue
 * @param {React.ReactNode} children
 */
function renderWithAuth(authValue, children = <div>Protected Content</div>) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          {/* The protected route wraps its content */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute>{children}</ProtectedRoute>}
          />
          {/* Stub login page — ProtectedRoute redirects here */}
          <Route
            path="/login"
            element={<div>Login Page</div>}
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// --- Tests -------------------------------------------------------------------

describe('ProtectedRoute', () => {
  describe('while auth is loading (loading=true)', () => {
    it('renders the authenticating spinner instead of children', () => {
      renderWithAuth({ currentUser: null, loading: true });
      expect(screen.getByText(/Authenticating/i)).toBeInTheDocument();
    });

    it('does NOT render the protected children during loading', () => {
      renderWithAuth({ currentUser: null, loading: true });
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('when unauthenticated (loading=false, currentUser=null)', () => {
    it('redirects to /login — renders the login stub page', () => {
      renderWithAuth({ currentUser: null, loading: false });
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('does NOT render the protected children after redirect', () => {
      renderWithAuth({ currentUser: null, loading: false });
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated (loading=false, currentUser is set)', () => {
    const mockUser = { uid: 'test-uid-123', email: 'dev@scaffold.dev', displayName: 'Dev User' };

    it('renders the protected children', () => {
      renderWithAuth({ currentUser: mockUser, loading: false });
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('does NOT redirect to /login when authenticated', () => {
      renderWithAuth({ currentUser: mockUser, loading: false });
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('renders custom children content correctly', () => {
      renderWithAuth(
        { currentUser: mockUser, loading: false },
        <section><h1>Dashboard</h1><p>Welcome back</p></section>
      );
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });
  });
});
