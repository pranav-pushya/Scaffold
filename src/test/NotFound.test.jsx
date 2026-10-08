/**
 * Component and integration tests for NotFound.jsx
 *
 * Verifies that:
 * 1. The custom 404 terminal view renders without crashing.
 * 2. The 404 code and route failure messages are visible.
 * 3. The invalid requested path from location.pathname is displayed in the badge.
 * 4. Links to Home ("/") and Dashboard ("/dashboard") are rendered.
 * 5. document.title is updated on mount and cleaned up on unmount.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../pages/NotFound/NotFound.jsx';

function renderNotFound(initialPath = '/non-existent-route') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('NotFound component', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = 'Scaffold';
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('renders the 404 indicator and error messages', () => {
    renderNotFound('/unknown/path');
    const matches = screen.getAllByText(/404/);
    expect(matches.length).toBeGreaterThan(0);
    expect(screen.getByText(/ROUTE RESOLUTION FAILURE/i)).toBeInTheDocument();
    expect(screen.getByText(/Target route not found in kernel registry/i)).toBeInTheDocument();
  });

  it('displays the exact invalid path requested by the user', () => {
    const invalidPath = '/xyz/arbitrary-endpoint';
    renderNotFound(invalidPath);
    expect(screen.getByText(invalidPath)).toBeInTheDocument();
  });

  it('renders navigation links to Home and Dashboard', () => {
    renderNotFound('/invalid');
    const homeLink = screen.getByRole('link', { name: /Go Home/i });
    const dashLink = screen.getByRole('link', { name: /Go to Dashboard/i });

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(dashLink).toBeInTheDocument();
    expect(dashLink).toHaveAttribute('href', '/dashboard');
  });

  it('updates document.title on mount and restores on unmount', () => {
    const { unmount } = renderNotFound('/some-404');
    expect(document.title).toBe('404 — Page Not Found | Scaffold');
    unmount();
    expect(document.title).toBe('Scaffold');
  });
});
