import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile } from '../hooks/useProfile.js';
import { useTracker } from '../hooks/useTracker.js';
import './dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { profile, loadProfile } = useProfile();
  const { projects, loadProjects } = useTracker();

  const [isLoading, setIsLoading] = useState(true);
  const [statusNotice, setStatusNotice] = useState('');
  const [showIdeasModal, setShowIdeasModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const userId = currentUser?.uid;

    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setStatusNotice('');

    // Soft loading indicator after 3 seconds
    const slowTimer = setTimeout(() => {
      if (isMounted && isLoading) {
        setStatusNotice('Still loading, this may take a moment on slow connections...');
      }
    }, 3000);

    // Fetch Profile & Projects in parallel
    Promise.all([
      loadProfile(userId),
      loadProjects(userId)
    ])
      .then(() => {
        if (isMounted) {
          clearTimeout(slowTimer);
          setIsLoading(false);
          setStatusNotice('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          clearTimeout(slowTimer);
          setIsLoading(false);
          console.error('Dashboard sync error:', err);
          setStatusNotice(`⚠️ Unable to sync live Firestore data — ${err.message || err}. Using cached data.`);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(slowTimer);
    };
  }, [currentUser?.uid, loadProfile, loadProjects]);

  // Derived user details
  const userName = profile?.fullName || currentUser?.displayName || 'Developer';
  const userRole = profile?.targetRole || 'Software Engineer & Developer';
  const expLevel = profile?.expLevel || 'Developer';

  // Profile readiness calculation (14 key fields)
  const profileFields = [
    profile?.fullName, profile?.email, profile?.phone, profile?.location,
    profile?.targetRole, profile?.bio, profile?.coreLanguages, profile?.frameworks,
    profile?.devTools, profile?.degree, profile?.institution, profile?.githubUrl,
    profile?.linkedinUrl, profile?.experience
  ];
  const filledCount = profileFields.filter(Boolean).length;
  const readinessPercent = Math.round((filledCount / profileFields.length) * 100);

  // ATS Score calculation
  const projectList = Array.isArray(projects) ? projects : [];
  let atsScore = Math.round((readinessPercent * 0.75) + (projectList.length >= 1 ? 15 : 0) + (projectList.length >= 3 ? 10 : 0));
  if (atsScore > 100) atsScore = 100;

  let gradeText = 'Grade D • Needs Work';
  let gradeColor = '#ef4444';
  if (atsScore >= 80) {
    gradeText = 'Grade A • Excellent';
    gradeColor = '#10b981';
  } else if (atsScore >= 60) {
    gradeText = 'Grade B • Good';
    gradeColor = '#3b82f6';
  } else if (atsScore >= 40) {
    gradeText = 'Grade C • Fair';
    gradeColor = '#f59e0b';
  }

  const atsHint = readinessPercent < 100
    ? 'Add your professional email, bio, and city/country location for employer ATS indexing.'
    : 'Your profile is fully optimized for employer ATS indexing!';

  // Project Metrics
  const totalProjects = projectList.length;
  const inProgressProjects = projectList.filter((p) => (p.status || '').toLowerCase().includes('progress'));
  const completedProjects = projectList.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s.includes('done') || s.includes('complete');
  }).length;

  return (
    <div className="dashboard-wrapper max-w-7xl mx-auto space-y-6">
      {/* ROW 1: Hero Welcome & Profile/ATS Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Welcome Hero (Span 2) */}
        <div
          className="lg:col-span-2 dashboard-hero-banner flex flex-col justify-between p-6 md:p-8 rounded-2xl border relative overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 id="dashUserName" className="font-display font-black text-3xl md:text-4xl" style={{ color: 'var(--fg)' }}>
                Welcome back, {userName} 👋
              </h1>
              <span
                id="dashExpBadge"
                className="px-3 py-1 rounded-full text-xs font-mono font-bold"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {expLevel}
              </span>
            </div>

            <h2 id="dashUserRole" className="font-mono font-bold text-lg text-emerald-500">
              {userRole}
            </h2>

            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Track your active deliverables, monitor profile readiness, inspect ATS score heuristics, and feature your verified portfolio accomplishments.
            </p>

            {statusNotice && (
              <div
                id="dashStatusNotice"
                className="font-mono text-xs p-2 rounded border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <span className="text-amber-400">
                  <i className="fas fa-circle-notch fa-spin mr-1"></i> {statusNotice}
                </span>
              </div>
            )}
          </div>

          <div
            className="pt-6 mt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="w-full sm:w-auto flex-1 max-w-xs space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted">Profile Readiness:</span>
                <span id="dashReadinessText" className="font-bold text-emerald-500">
                  {readinessPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  id="dashReadinessBar"
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${readinessPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link to="/profile" className="btn-secondary text-xs px-4 py-2 flex items-center gap-2">
                <i className="fas fa-edit text-amber-500"></i> Edit Profile
              </Link>
              <Link
                to="/tracker"
                className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
                style={{ background: '#10b981', color: '#fff' }}
              >
                <i className="fas fa-tasks"></i> Open Kanban →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Profile & ATS Score Card (Span 1) */}
        <div
          className="dashboard-score-card p-6 md:p-8 rounded-2xl border flex flex-col justify-between text-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="space-y-4">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
              PROFILE &amp; ATS SCORE
            </div>

            <div className="py-2">
              <div id="dashAtsScore" className="font-mono font-extrabold text-5xl md:text-6xl" style={{ color: 'var(--fg)' }}>
                {atsScore}
                <span className="text-2xl text-muted font-normal">/100</span>
              </div>
            </div>

            <div>
              <span
                id="dashAtsBadge"
                className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold"
                style={{
                  background: `${gradeColor}1a`,
                  color: gradeColor,
                  border: `1px solid ${gradeColor}40`,
                }}
              >
                {gradeText}
              </span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
            <p id="dashAtsHint" className="text-xs text-muted leading-relaxed">
              {atsHint}
            </p>
            <Link to="/profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:underline">
              View Full Audit →
            </Link>
          </div>
        </div>
      </div>

      {/* ROW 2: 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="dashboard-stat-card p-6 rounded-2xl border flex items-center justify-between"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="space-y-1">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-muted">TOTAL PROJECTS</div>
            <div id="dashTotalProjects" className="font-mono font-extrabold text-3xl" style={{ color: 'var(--fg)' }}>
              {totalProjects}
            </div>
            <div className="text-xs text-muted">Across all Kanban columns</div>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}
          >
            📁
          </div>
        </div>

        <div
          className="dashboard-stat-card p-6 rounded-2xl border flex items-center justify-between"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="space-y-1">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">IN PROGRESS</div>
            <div id="dashInProgressProjects" className="font-mono font-extrabold text-3xl text-emerald-500">
              {inProgressProjects.length}
            </div>
            <div className="text-xs text-muted">Active deliverables</div>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}
          >
            ⚡
          </div>
        </div>

        <div
          className="dashboard-stat-card p-6 rounded-2xl border flex items-center justify-between"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="space-y-1">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-blue-500">COMPLETED</div>
            <div id="dashCompletedProjects" className="font-mono font-extrabold text-3xl text-blue-500">
              {completedProjects}
            </div>
            <div className="text-xs text-muted">Verified in Portfolio</div>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}
          >
            ✅
          </div>
        </div>
      </div>

      {/* ROW 3: Active Tasks & AI Career Coach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Active Tasks */}
        <div
          className="p-6 rounded-2xl border flex flex-col justify-between space-y-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              ⚡ Active Tasks (<span id="dashActiveTaskCount">{inProgressProjects.length}</span>)
            </h3>
            <Link to="/tracker" className="text-xs font-bold text-emerald-500 hover:underline">
              Open Board →
            </Link>
          </div>

          <div id="dashActiveTasksList">
            {isLoading && !projectList.length ? (
              <div
                className="p-8 rounded-xl border border-dashed text-center text-xs text-muted"
                style={{ borderColor: 'var(--border)' }}
              >
                Loading active deliverables...
              </div>
            ) : inProgressProjects.length > 0 ? (
              <div className="space-y-2">
                {inProgressProjects.map((t) => (
                  <div
                    key={t.id || t.title || t.name}
                    className="p-3 rounded-lg border flex items-center justify-between text-xs"
                    style={{ borderColor: 'var(--border)', background: 'rgba(34, 211, 238, 0.02)' }}
                  >
                    <span className="font-bold" style={{ color: 'var(--fg)' }}>
                      {t.title || t.name}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-500">
                      {t.techStack || t.tech || 'In Progress'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="p-8 rounded-xl border border-dashed text-center text-xs text-muted"
                style={{ borderColor: 'var(--border)' }}
              >
                No tasks currently in progress.
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Career Coach */}
        <div
          className="p-6 rounded-2xl border flex flex-col justify-between space-y-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              🤖 AI Career Coach
            </h3>
            <Link to="/assistant" className="text-xs font-bold text-emerald-500 hover:underline">
              Launch Coach →
            </Link>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Get personalized project ideas, skill gap analysis, and ATS optimization advice tailored to your target engineering role.
          </p>

          <div
            className="p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
          >
            <span className="text-emerald-600 font-medium">💡 Generate custom project ideas</span>
            <button
              id="suggestIdeasBtn"
              type="button"
              onClick={() => setShowIdeasModal(true)}
              className="btn-primary text-[11px] px-3 py-1.5 shrink-0"
              style={{ background: '#10b981', color: '#fff' }}
            >
              Suggest Ideas
            </button>
          </div>
        </div>
      </div>

      {/* ROW 4: Portfolio Showcase & ATS Resume Exporter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="p-5 rounded-2xl border flex items-center justify-between gap-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}
            >
              💼
            </div>
            <div>
              <h4 className="font-display font-bold text-base" style={{ color: 'var(--fg)' }}>
                Portfolio Showcase
              </h4>
              <p id="dashPortfolioSub" className="text-xs text-muted">
                {completedProjects} verified projects ready to share
              </p>
            </div>
          </div>
          <Link to="/portfolio" className="text-xs font-bold text-emerald-500 hover:underline shrink-0">
            View Showcase →
          </Link>
        </div>

        <div
          className="p-5 rounded-2xl border flex items-center justify-between gap-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}
            >
              📄
            </div>
            <div>
              <h4 className="font-display font-bold text-base" style={{ color: 'var(--fg)' }}>
                ATS Resume Exporter
              </h4>
              <p className="text-xs text-muted">Formatted CV synced with your latest profile record</p>
            </div>
          </div>
          <Link to="/resume" className="text-xs font-bold text-emerald-500 hover:underline shrink-0">
            Export Resume →
          </Link>
        </div>
      </div>

      {/* AI Suggest Ideas Modal */}
      {showIdeasModal && (
        <div
          id="ideasModalOverlay"
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setShowIdeasModal(false)}
        >
          <div
            className="p-6 rounded-2xl max-w-lg w-full mx-4 shadow-2xl space-y-4 border"
            style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-display font-bold text-lg flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                💡 AI Recommended Engineering Projects
              </h3>
              <button
                type="button"
                id="closeIdeasBtn"
                onClick={() => setShowIdeasModal(false)}
                className="text-muted hover:text-fg text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div
                className="p-3 rounded-lg border"
                style={{ borderColor: 'var(--border)', background: 'rgba(34, 211, 238, 0.02)' }}
              >
                <div className="font-bold text-emerald-500 mb-1">1. Micro-Frontend Dashboard Architecture</div>
                <p className="text-muted">
                  Build a multi-app dashboard integrating custom web components, state management, and real-time telemetry analytics.
                </p>
              </div>

              <div
                className="p-3 rounded-lg border"
                style={{ borderColor: 'var(--border)', background: 'rgba(34, 211, 238, 0.02)' }}
              >
                <div className="font-bold text-emerald-500 mb-1">2. High-Performance ATS Resume Parser API</div>
                <p className="text-muted">
                  Implement a serverless heuristic parser that checks keywords, section hierarchy, and formatting compliance.
                </p>
              </div>

              <div
                className="p-3 rounded-lg border"
                style={{ borderColor: 'var(--border)', background: 'rgba(34, 211, 238, 0.02)' }}
              >
                <div className="font-bold text-emerald-500 mb-1">3. Collaborative Realtime Kanban Engine</div>
                <p className="text-muted">
                  Develop a drag-and-drop workspace board backed by Firebase Firestore with offline persistence and optimistic updates.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Link
                to="/tracker"
                id="addIdeaToTrackerBtn"
                className="btn-primary text-xs px-4 py-2"
                style={{ background: '#10b981', color: '#fff' }}
                onClick={() => setShowIdeasModal(false)}
              >
                Add to Tracker Board →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
