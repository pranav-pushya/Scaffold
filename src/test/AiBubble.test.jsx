/**
 * Unit & Integration Tests for AiBubble.jsx
 *
 * Verifies that:
 * 1. The floating bubble renders when authenticated.
 * 2. Clicking the trigger opens the chat drawer.
 * 3. Welcome message contains the "🎙️ Mock Interview" quick chip.
 * 4. Triggering the interview query returns instant knowledge with /interview route and Alt + 8 shortcut.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AiBubble from '../components/AiBubble.jsx';

// Mock Auth, Profile, and Tracker hooks
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test_uid_456', email: 'dev@scaffold.dev', displayName: 'Sam Dev' }
  })
}));

vi.mock('../hooks/useProfile.js', () => ({
  useProfile: () => ({
    profile: {
      fullName: 'Sam Dev',
      targetRole: 'Frontend Engineer',
      coreLanguages: 'JavaScript, React',
      frameworks: 'Tailwind CSS, Vite'
    }
  })
}));

vi.mock('../hooks/useTracker.js', () => ({
  useTracker: () => ({
    projects: [
      { id: 'p1', title: 'Task 1', status: 'Done' },
      { id: 'p2', title: 'Task 2', status: 'In-Progress' }
    ]
  })
}));

describe('AiBubble Component (Ambient Copilot)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  const renderBubble = () => {
    return render(
      <MemoryRouter>
        <AiBubble />
      </MemoryRouter>
    );
  };

  it('renders the floating bubble button for authenticated users', () => {
    renderBubble();
    const trigger = screen.getByLabelText(/Open Ambient AI Copilot/i);
    expect(trigger).toBeInTheDocument();
  });

  it('opens the copilot chat drawer and displays the welcome message with Mock Interview chip', () => {
    renderBubble();
    const trigger = screen.getByLabelText(/Open Ambient AI Copilot/i);
    fireEvent.click(trigger);

    expect(screen.getByText(/ambient workspace copilot/i)).toBeInTheDocument();
    expect(screen.getByText(/🎙️ Mock Interview/i)).toBeInTheDocument();
  });

  it('provides instant knowledge about the /interview page when clicking the Mock Interview chip', () => {
    renderBubble();
    fireEvent.click(screen.getByLabelText(/Open Ambient AI Copilot/i));

    const interviewChip = screen.getByText(/🎙️ Mock Interview/i);
    fireEvent.click(interviewChip);

    // Instant knowledge response should be rendered without API call
    expect(screen.getByText(/AI Mock Interview Arena & Viva Prep:/i)).toBeInTheDocument();
    expect(screen.getByText(/5 Tracks:/i)).toBeInTheDocument();
    expect(screen.getByText(/Alt \+ 8/i)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Open Mock Interview Arena →/i });
    expect(link).toHaveAttribute('href', '/interview');
  });
});
