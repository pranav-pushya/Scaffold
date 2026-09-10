import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useProfile } from '../../hooks/useProfile.js';
import { useTracker } from '../../hooks/useTracker.js';
import './resume.css';

export default function Resume() {
  const { currentUser } = useAuth();
  const { profile, loadProfile } = useProfile();
  const { projects, loadProjects } = useTracker();

  const [isSyncing, setIsSyncing] = useState(true);
  const [statusNotice, setStatusNotice] = useState({
    type: 'loading',
    text: 'Syncing ATS resume data...'
  });

  const userId = currentUser?.uid;

  useEffect(() => {
    let isMounted = true;

    if (!userId) {
      setIsSyncing(false);
      setStatusNotice({ type: 'success', text: '✓ ATS Resume ready for export' });
      return;
    }

    setIsSyncing(true);
    setStatusNotice({ type: 'loading', text: 'Syncing ATS resume data...' });

    // 3s soft loading notice
    const slowTimer = setTimeout(() => {
      if (isMounted && isSyncing) {
        setStatusNotice({
          type: 'warning',
          text: 'Still loading, this may take a moment on slow connections...'
        });
      }
    }, 3000);

    // 20s soft timeout notice
    const softTimeoutTimer = setTimeout(() => {
      if (isMounted && isSyncing) {
        setStatusNotice({
          type: 'warning',
          text: 'Still establishing Firestore connection...'
        });
      }
    }, 20000);

    Promise.all([
      loadProfile(userId),
      loadProjects(userId)
    ])
      .then(() => {
        if (isMounted) {
          clearTimeout(slowTimer);
          clearTimeout(softTimeoutTimer);
          setIsSyncing(false);
          setStatusNotice({ type: 'success', text: '✓ ATS Resume ready for export' });
        }
      })
      .catch((err) => {
        if (isMounted) {
          clearTimeout(slowTimer);
          clearTimeout(softTimeoutTimer);
          setIsSyncing(false);
          console.error('Resume fetch error:', err);
          setStatusNotice({
            type: 'error',
            text: `⚠️ Offline mode — ${err.message || err}`
          });
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(slowTimer);
      clearTimeout(softTimeoutTimer);
    };
  }, [userId, loadProfile, loadProjects]);

  const handlePrint = () => {
    window.print();
  };

  // Header Details
  const fullName = profile?.fullName || currentUser?.displayName || 'Developer Name';
  const targetRole = profile?.targetRole || 'Software Engineer';
  const email = profile?.email || currentUser?.email || '';

  // Skills
  const coreLangs = profile?.coreLanguages || '';
  const frameworks = profile?.frameworks || '';
  const devTools = profile?.devTools || '';

  const projectList = Array.isArray(projects) ? projects : [];

  return (
    <div className="resume-wrapper">
      <div className="resume-container space-y-6">
        {/* Print & Action Controls (Hidden when printing via .no-print) */}
        <div
          className="no-print flex items-center justify-between gap-3 p-4 rounded-xl border"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <div id="resumeDataStatus" className="font-mono text-xs text-muted">
            {statusNotice.type === 'loading' && (
              <span>
                <i className="fas fa-circle-notch fa-spin text-emerald-500 mr-1"></i> {statusNotice.text}
              </span>
            )}
            {statusNotice.type === 'warning' && (
              <span className="text-amber-400">
                <i className="fas fa-circle-notch fa-spin mr-1"></i> {statusNotice.text}
              </span>
            )}
            {statusNotice.type === 'success' && (
              <span className="text-emerald-500">{statusNotice.text}</span>
            )}
            {statusNotice.type === 'error' && (
              <span className="text-amber-500">{statusNotice.text}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="btn-secondary text-xs px-3 py-2">
              <i className="fas fa-edit mr-1"></i> Edit Data
            </Link>
            <button
              id="printResumeBtn"
              type="button"
              onClick={handlePrint}
              className="btn-primary text-xs px-5 py-2"
              style={{ background: '#10b981', color: '#fff' }}
            >
              <i className="fas fa-print mr-1"></i> Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Classic Clean ATS Resume Sheet (Visible when printing) */}
        <div className="resume-sheet space-y-6">
          {/* Resume Header */}
          <div className="border-b pb-4" style={{ borderColor: '#e5e7eb' }}>
            <h1 id="resHeaderName" className="resume-header-name">
              {fullName}
            </h1>
            <div id="resHeaderRole" className="resume-header-role">
              {targetRole}
            </div>

            <div id="resContactList" className="flex flex-wrap gap-4 text-xs text-gray-600 mt-3 font-mono">
              {email && <span>📧 {email}</span>}
              {profile?.phone && <span>📱 {profile.phone}</span>}
              {profile?.location && <span>📍 {profile.location}</span>}
              {profile?.githubUrl && (
                <span>🔗 {profile.githubUrl.replace(/^https?:\/\//, '')}</span>
              )}
              {profile?.linkedinUrl && (
                <span>🔗 {profile.linkedinUrl.replace(/^https?:\/\//, '')}</span>
              )}
              {profile?.websiteUrl && (
                <span>🌐 {profile.websiteUrl.replace(/^https?:\/\//, '')}</span>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {profile?.bio && (
            <div id="resSummarySection">
              <h2 className="resume-section-title">Professional Summary</h2>
              <p id="resSummaryText" className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Technical Skills */}
          {(coreLangs || frameworks || devTools) && (
            <div id="resSkillsSection">
              <h2 className="resume-section-title">Technical Skills</h2>
              <div id="resSkillsContainer" className="space-y-1 text-xs text-gray-800 font-mono">
                {coreLangs && (
                  <div>
                    <strong>Languages:</strong> {coreLangs}
                  </div>
                )}
                {frameworks && (
                  <div>
                    <strong>Frameworks &amp; Databases:</strong> {frameworks}
                  </div>
                )}
                {devTools && (
                  <div>
                    <strong>Tools &amp; Platforms:</strong> {devTools}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Projects (Pulling Live from Tracker) */}
          <div>
            <h2 className="resume-section-title">
              Technical Projects (<span id="resProjectCount">{projectList.length}</span>)
            </h2>
            <div id="resProjectsList">
              {isSyncing && projectList.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Syncing project records...</p>
              ) : projectList.length > 0 ? (
                <div className="space-y-4">
                  {projectList.map((p, idx) => (
                    <div key={p.id || idx}>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                        <span>{p.title || p.name || 'Untitled Project'}</span>
                        <span className="font-mono text-[10px] text-gray-500">{p.status || 'Active'}</span>
                      </div>
                      {(p.techStack || p.tech) && (
                        <div className="text-[11px] text-gray-600 italic mb-1">
                          Technologies: {p.techStack || p.tech}
                        </div>
                      )}
                      {p.description && (
                        <p className="text-xs text-gray-700 leading-relaxed">{p.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  No projects listed. Add projects in the Project Tracker module.
                </p>
              )}
            </div>
          </div>

          {/* Work Experience */}
          {profile?.experience && (
            <div id="resExpSection">
              <h2 className="resume-section-title">Work Experience</h2>
              <p id="resExpText" className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {profile.experience}
              </p>
            </div>
          )}

          {/* Education & Credentials */}
          {(profile?.degree || profile?.institution || profile?.achievements || profile?.certifications) && (
            <div id="resEduSection">
              <h2 className="resume-section-title">Education &amp; Achievements</h2>
              <div id="resEduContainer" className="text-xs text-gray-800 space-y-2 font-mono">
                {(profile?.degree || profile?.institution) && (
                  <div>
                    <div className="flex justify-between font-bold">
                      <span>{profile.degree || 'Degree'}</span>
                      <span>{profile.gradYear || ''}</span>
                    </div>
                    <div className="text-gray-600">
                      {profile.institution || 'University'} {profile.cgpa ? `(${profile.cgpa})` : ''}
                    </div>
                    {profile.coursework && (
                      <div className="text-[11px] text-gray-500 pt-0.5">Coursework: {profile.coursework}</div>
                    )}
                  </div>
                )}

                {profile?.certifications && (
                  <div>
                    <strong>Certifications:</strong> {profile.certifications}
                  </div>
                )}

                {profile?.achievements && (
                  <div className="pt-1">
                    <div className="font-bold text-gray-900">Key Achievements:</div>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                      {profile.achievements}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
