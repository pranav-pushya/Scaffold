/**
 * Component test for Footer.jsx
 *
 * Goal: confirm the component renders without crashing and that key
 * static content is present in the DOM. Footer is an ideal first
 * component test — it has no props, no auth dependency, no async code,
 * and no Firebase calls.
 *
 * Footer uses <Link> from react-router-dom, so we wrap it in
 * <MemoryRouter> to satisfy the Router context requirement.
 *
 * CLO06 scope: component-level rendering test with RTL.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/Footer.jsx';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer component', () => {
  it('renders without crashing', () => {
    // If this throws, the component has a fatal render error
    expect(() => renderFooter()).not.toThrow();
  });

  it('renders the copyright line', () => {
    renderFooter();
    expect(screen.getByText(/© 2026 Scaffold Platform/i)).toBeInTheDocument();
  });

  it('renders all three team member names', () => {
    renderFooter();
    expect(screen.getByText('Pranav Pushya')).toBeInTheDocument();
    expect(screen.getByText('Tiksha')).toBeInTheDocument();
    expect(screen.getByText('Tammanna Kakkar')).toBeInTheDocument();
  });

  it('renders the team member roles', () => {
    renderFooter();
    expect(screen.getByText('State & AI Integration')).toBeInTheDocument();
    expect(screen.getByText('UI/UX & Design System')).toBeInTheDocument();
    expect(screen.getByText('ATS Engine & Resume Exporter')).toBeInTheDocument();
  });

  it('renders all five platform module pills', () => {
    renderFooter();
    const modules = [
      'Profile OS',
      'AI Project Coach',
      'Kanban Tracker',
      'Auto Portfolio',
      'ATS Resume Exporter',
    ];
    for (const mod of modules) {
      expect(screen.getByText(new RegExp(mod, 'i'))).toBeInTheDocument();
    }
  });

  it('renders the "Core Engineering Team" section label', () => {
    renderFooter();
    expect(screen.getByText(/Core Engineering Team/i)).toBeInTheDocument();
  });

  it('renders GitHub and LinkedIn links for each team member', () => {
    renderFooter();
    const githubLinks = screen.getAllByText(/GitHub/i);
    const linkedinLinks = screen.getAllByText(/LinkedIn/i);
    // Three team members → three of each
    expect(githubLinks).toHaveLength(3);
    expect(linkedinLinks).toHaveLength(3);
  });

  it('renders as a <footer> semantic element', () => {
    const { container } = renderFooter();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
