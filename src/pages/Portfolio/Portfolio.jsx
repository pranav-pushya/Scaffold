import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useProfile } from '../../hooks/useProfile.js';
import { useTracker } from '../../hooks/useTracker.js';
import './portfolio.css';

export default function Portfolio() {
  const { currentUser } = useAuth();
  const { profile, loadProfile } = useProfile();
  const { projects, loadProjects } = useTracker();

  const [isSyncing, setIsSyncing] = useState(true);
  const [statusNotice, setStatusNotice] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const userId = currentUser?.uid;

  useEffect(() => {
    let isMounted = true;

    if (!userId) {
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    setStatusNotice({ type: 'loading', text: 'Syncing portfolio showcase from Firestore...' });

    // 3s soft loading notice
    const slowTimer = setTimeout(() => {
      if (isMounted && isSyncing) {
        setStatusNotice({ type: 'warning', text: 'Still loading, this may take a moment on slow connections...' });
      }
    }, 3000);

    // 20s soft timeout notice
    const softTimeoutTimer = setTimeout(() => {
      if (isMounted && isSyncing) {
        setStatusNotice({ type: 'warning', text: 'Still establishing Firestore connection...' });
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
          setStatusNotice(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          clearTimeout(slowTimer);
          clearTimeout(softTimeoutTimer);
          setIsSyncing(false);
          console.error('Portfolio sync error:', err);
          setStatusNotice({
            type: 'error',
            text: `⚠️ Unable to sync live portfolio data — ${err.message || err}.`
          });
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(slowTimer);
      clearTimeout(softTimeoutTimer);
    };
  }, [userId, loadProfile, loadProjects]);

  // Derived user details
  const fullName = profile?.fullName || currentUser?.displayName || 'Developer';
  const targetRole = profile?.targetRole || 'Software Engineer & Developer';
  const email = profile?.email || currentUser?.email || '';

  // Technical skills
  const coreLangs = profile?.coreLanguages
    ? profile.coreLanguages.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const frameworks = profile?.frameworks
    ? profile.frameworks.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const devTools = profile?.devTools
    ? profile.devTools.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const projectList = Array.isArray(projects) ? projects : [];

  return (
    <div className="portfolio-wrapper">
      <div className="portfolio-container">
        {/* Async Loading / Connection Error Status Indicator */}
        {statusNotice && (
          <div
            id="portfolioDataStatus"
            className="mb-6 p-3 rounded-lg border font-mono text-xs"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {statusNotice.type === 'loading' && (
              <span className="text-emerald-500">
                <i className="fas fa-circle-notch fa-spin mr-1"></i> {statusNotice.text}
              </span>
            )}
            {statusNotice.type === 'warning' && (
              <span className="text-amber-400">
                <i className="fas fa-circle-notch fa-spin mr-1"></i> {statusNotice.text}
              </span>
            )}
            {statusNotice.type === 'error' && (
              <span className="text-amber-400">{statusNotice.text}</span>
            )}
          </div>
        )}

        {/* Hero Banner */}
        <div className="portfolio-hero-card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3 flex-wrap">
                {profile?.jobStatus && (
                  <span
                    id="portJobStatus"
                    className="tag"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#059669',
                      borderColor: 'rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {profile.jobStatus}
                  </span>
                )}
                {profile?.location && (
                  <span id="portLocation" className="text-xs font-mono text-muted">
                    <i className="fas fa-map-marker-alt text-amber-500 mr-1"></i>
                    {profile.location}
                  </span>
                )}
              </div>

              <h1 id="portFullName" className="font-display font-extrabold text-4xl" style={{ color: 'var(--fg)' }}>
                {fullName}
              </h1>
              <h2 id="portTargetRole" className="font-mono text-lg font-bold text-emerald-500">
                {targetRole}
              </h2>
              {profile?.tagline && (
                <p id="portTagline" className="text-sm text-muted leading-relaxed">
                  {profile.tagline}
                </p>
              )}
            </div>

            <div id="portPhotoBox">
              {profile?.photoUrl ? (
                <div
                  id="portPhotoClickBox"
                  className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shrink-0 shadow-lg cursor-pointer group relative transition-transform duration-200 hover:scale-105 hover:border-emerald-400"
                  title="Click to view full photo"
                  onClick={() => setPhotoModalOpen(true)}
                >
                  <img src={profile.photoUrl} alt={fullName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-base">
                    <i className="fas fa-search-plus"></i>
                  </div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <i className="fas fa-user-code text-4xl text-emerald-500"></i>
                </div>
              )}
            </div>
          </div>

          {/* Social & Contact Links */}
          <div
            id="portSocialLinks"
            className="flex items-center gap-4 flex-wrap pt-6 mt-6 border-t font-mono text-xs"
            style={{ borderColor: 'var(--border)' }}
          >
            {email && (
              <a href={`mailto:${email}`} className="hover-link flex items-center gap-1.5">
                <i className="fas fa-envelope text-emerald-500"></i> {email}
              </a>
            )}
            {profile?.phone && (
              <span className="text-muted flex items-center gap-1.5">
                <i className="fas fa-phone text-emerald-500"></i> {profile.phone}
              </span>
            )}
            {profile?.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-link flex items-center gap-1.5"
              >
                <i className="fab fa-github"></i> GitHub ↗
              </a>
            )}
            {profile?.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-link flex items-center gap-1.5"
              >
                <i className="fab fa-linkedin text-blue-500"></i> LinkedIn ↗
              </a>
            )}
            {profile?.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-link flex items-center gap-1.5"
              >
                <i className="fas fa-globe text-cyan-500"></i> Website ↗
              </a>
            )}
          </div>
        </div>

        {/* About & Executive Bio */}
        {profile?.bio && (
          <div id="portBioSection" className="portfolio-section-card">
            <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <i className="fas fa-user text-emerald-500"></i> About &amp; Bio
            </h3>
            <p id="portBioText" className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Categorized Technical Competencies */}
        <div id="portSkillsSection" className="portfolio-section-card">
          <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2" style={{ color: 'var(--fg)' }}>
            <i className="fas fa-code text-emerald-500"></i> Technical Competencies
          </h3>

          <div id="portSkillsContainer" className="space-y-5">
            {isSyncing && !coreLangs.length && !frameworks.length && !devTools.length ? (
              <div className="text-xs text-muted font-mono italic">
                <i className="fas fa-circle-notch fa-spin mr-1 text-emerald-500"></i> Syncing technical competencies...
              </div>
            ) : coreLangs.length || frameworks.length || devTools.length ? (
              <>
                {coreLangs.length > 0 && (
                  <div>
                    <div className="font-mono text-xs text-muted mb-2 font-bold">CORE LANGUAGES &amp; FUNDAMENTALS</div>
                    <div className="flex flex-wrap gap-2">
                      {coreLangs.map((lang, idx) => (
                        <span key={idx} className="tech-tag">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {frameworks.length > 0 && (
                  <div>
                    <div className="font-mono text-xs text-muted mb-2 font-bold">
                      FRAMEWORKS, LIBRARIES &amp; DATABASES
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {frameworks.map((fw, idx) => (
                        <span
                          key={idx}
                          className="tech-tag"
                          style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {devTools.length > 0 && (
                  <div>
                    <div className="font-mono text-xs text-muted mb-2 font-bold">
                      DEVELOPER TOOLS &amp; PLATFORMS
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {devTools.map((tool, idx) => (
                        <span
                          key={idx}
                          className="tech-tag"
                          style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-muted font-mono italic">No skills listed yet in Profile OS.</div>
            )}
          </div>
        </div>

        {/* Featured Projects (Synched from Tracker) */}
        <div className="portfolio-section-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <i className="fas fa-folder-open text-emerald-500"></i> Featured Projects (
              <span id="portProjectCount">{projectList.length}</span>)
            </h3>
            <Link to="/tracker" className="btn-secondary text-xs px-3 py-1.5">
              <i className="fas fa-tasks mr-1"></i> Manage in Tracker
            </Link>
          </div>

          <div id="portProjectsGrid">
            {isSyncing && projectList.length === 0 ? (
              <div
                className="text-center py-10 border border-dashed rounded-xl"
                style={{ borderColor: 'var(--border)' }}
              >
                <i className="fas fa-circle-notch fa-spin text-2xl text-emerald-500 mb-3"></i>
                <p className="text-xs text-muted">Syncing project portfolio...</p>
              </div>
            ) : projectList.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {projectList.map((p) => {
                  const pTags = (p.techStack || p.tech || '')
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean);

                  return (
                    <div key={p.id || p.title} className="portfolio-project-card space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display font-bold text-lg" style={{ color: 'var(--fg)' }}>
                          {p.title || p.name || 'Untitled Project'}
                        </h4>
                        <span
                          className="tag text-[10px]"
                          style={{
                            background:
                              p.status === 'Done'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : p.status === 'In Progress'
                                ? 'rgba(59, 130, 246, 0.1)'
                                : 'rgba(107, 114, 128, 0.1)',
                            color:
                              p.status === 'Done'
                                ? '#059669'
                                : p.status === 'In Progress'
                                ? '#2563eb'
                                : '#6b7280',
                            borderColor:
                              p.status === 'Done'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : p.status === 'In Progress'
                                ? 'rgba(59, 130, 246, 0.3)'
                                : 'rgba(107, 114, 128, 0.3)'
                          }}
                        >
                          {p.status || 'Active'}
                        </span>
                      </div>

                      {pTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pTags.map((t, idx) => (
                            <span
                              key={idx}
                              className="tech-tag"
                              style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {p.description && (
                        <p className="text-xs text-muted leading-relaxed">{p.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs font-mono pt-2">
                        {p.repoUrl && (
                          <a
                            href={p.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover-link text-emerald-500"
                          >
                            Repo ↗
                          </a>
                        )}
                        {p.deployUrl && (
                          <a
                            href={p.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover-link text-emerald-500"
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="text-center py-10 border border-dashed rounded-xl"
                style={{ borderColor: 'var(--border)' }}
              >
                <i className="fas fa-project-diagram text-3xl text-muted mb-3"></i>
                <p className="text-sm text-muted mb-4">No projects logged in your Tracker yet.</p>
                <Link to="/tracker" className="btn-primary text-xs px-4 py-2">
                  Add Projects in Tracker
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Work Experience */}
        {profile?.experience && (
          <div id="portExpSection" className="portfolio-section-card">
            <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <i className="fas fa-briefcase text-emerald-500"></i> Work Experience &amp; Past Roles
            </h3>
            <p id="portExpText" className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {profile.experience}
            </p>
          </div>
        )}

        {/* Academic Credentials & Achievements */}
        {(profile?.degree || profile?.institution || profile?.achievements) && (
          <div id="portEduSection" className="portfolio-section-card">
            <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <i className="fas fa-graduation-cap text-emerald-500"></i> Education &amp; Achievements
            </h3>
            <div id="portEduContainer" className="space-y-4 font-mono text-sm">
              {(profile?.degree || profile?.institution) && (
                <div>
                  <div className="font-bold text-base" style={{ color: 'var(--fg)' }}>
                    {profile.degree || 'Degree'}
                  </div>
                  <div className="text-muted text-xs">
                    {profile.institution || 'University'}{' '}
                    {profile.gradYear ? `• Class of ${profile.gradYear}` : ''}{' '}
                    {profile.cgpa ? `(${profile.cgpa})` : ''}
                  </div>
                  {profile.coursework && (
                    <div className="text-xs text-muted pt-1">Coursework: {profile.coursework}</div>
                  )}
                  {profile.certifications && (
                    <div className="text-xs text-muted pt-1">Certifications: {profile.certifications}</div>
                  )}
                </div>
              )}

              {profile?.achievements && (
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="font-bold text-xs text-muted mb-2">KEY ACHIEVEMENTS &amp; HONORS</div>
                  <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                    {profile.achievements}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div
          className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <Link to="/profile" className="btn-secondary text-xs px-4 py-2.5">
            <i className="fas fa-user-edit mr-1"></i> Edit Profile Data
          </Link>
          <Link
            to="/resume"
            className="btn-primary text-xs px-5 py-2.5"
            style={{ background: '#10b981', color: '#fff' }}
          >
            <i className="fas fa-file-invoice mr-1"></i> Generate Printable ATS Resume →
          </Link>
        </div>
      </div>

      {/* Portfolio Photo Lightbox Modal */}
      {photoModalOpen && (
        <div
          id="portPhotoModal"
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300"
          onClick={() => setPhotoModalOpen(false)}
        >
          <div
            className="p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl border text-center relative space-y-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              id="closePortPhotoModalBtn"
              className="absolute top-4 right-4 text-muted hover:text-white transition-colors text-lg"
              title="Close"
              onClick={() => setPhotoModalOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="flex justify-center my-2">
              <img
                id="portModalImage"
                src={profile?.photoUrl}
                alt="Full Profile Photo"
                className="max-w-full max-h-[60vh] rounded-xl border-2 border-emerald-500/40 object-cover shadow-2xl"
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link to="/profile" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <i className="fas fa-crop-alt"></i> Edit in Profile
              </Link>
              <button
                type="button"
                id="closePortPhotoModalBtn2"
                className="btn-primary text-xs px-4 py-1.5"
                style={{ background: '#10b981', color: '#fff' }}
                onClick={() => setPhotoModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
