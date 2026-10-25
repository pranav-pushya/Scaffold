/**
 * Component & Integration Tests for Interview.jsx (AI Mock Interview & Viva Prep)
 *
 * Verifies:
 * 1. Renders the setup screen with track selection and candidate context.
 * 2. Renders all 5 interview tracks (Viva Defense, Frontend, Backend, System Design, Behavioral).
 * 3. Allows selecting a track and selecting experience level.
 * 4. Starts an interview session when clicking "Enter Mock Arena".
 * 5. Displays question content and answer input console in active session.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Interview from '../pages/Interview/Interview.jsx';

// Mock Auth, Profile, and Tracker hooks
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test_uid_123', email: 'test@scaffold.dev', displayName: 'Alex Dev' }
  })
}));

vi.mock('../hooks/useProfile.js', () => ({
  useProfile: () => ({
    profile: {
      fullName: 'Alex Dev',
      targetRole: 'Full Stack React Engineer',
      coreLanguages: 'JavaScript, TypeScript, React',
      frameworks: 'Node.js, Express, Firebase'
    }
  })
}));

vi.mock('../hooks/useTracker.js', () => ({
  useTracker: () => ({
    addProject: vi.fn().mockResolvedValue({ id: 'proj_new' })
  })
}));

describe('Interview Component (/interview)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderInterview = () => {
    return render(
      <MemoryRouter>
        <Interview />
      </MemoryRouter>
    );
  };

  it('renders the initial setup screen without crashing', () => {
    renderInterview();
    expect(screen.getByText(/AI Mock Interview Arena & Viva Prep/i)).toBeInTheDocument();
    expect(screen.getByText(/Alex Dev/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Stack React Engineer/i)).toBeInTheDocument();
  });

  it('renders all 5 interview tracks', () => {
    renderInterview();
    expect(screen.getByText(/Scaffold Viva Defense/i)).toBeInTheDocument();
    expect(screen.getByText(/Frontend React Engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend & Cloud Systems/i)).toBeInTheDocument();
    expect(screen.getByText(/System Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/Behavioral & STAR Method/i)).toBeInTheDocument();
  });

  it('allows switching tracks and session length', () => {
    renderInterview();
    const frontendCard = screen.getByText(/Frontend React Engineering/i).closest('.interview-track-card');
    fireEvent.click(frontendCard);
    expect(frontendCard).toHaveClass('selected');

    const fullMockBtn = screen.getByRole('button', { name: /5 Questions/i });
    fireEvent.click(fullMockBtn);
    expect(fullMockBtn).toBeInTheDocument();
  });

  it('starts an active interview session when clicking Enter Mock Arena', () => {
    renderInterview();
    const startBtn = screen.getByRole('button', { name: /Enter Mock Arena/i });
    fireEvent.click(startBtn);

    // Should transition to active question view
    expect(screen.getByText(/AI INTERVIEWER/i)).toBeInTheDocument();
    expect(screen.getByText(/YOUR ANSWER CONSOLE/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Explain your thought process clearly/i)).toBeInTheDocument();
  });

  it('toggles guidance hint in active question view', () => {
    renderInterview();
    fireEvent.click(screen.getByRole('button', { name: /Enter Mock Arena/i }));

    const hintToggle = screen.getByRole('button', { name: /Need a Guidance Hint/i });
    expect(hintToggle).toBeInTheDocument();
    fireEvent.click(hintToggle);

    expect(screen.getByText(/Hide Guidance Hint/i)).toBeInTheDocument();
    expect(screen.getByText(/Hint:/i)).toBeInTheDocument();
  });
});
