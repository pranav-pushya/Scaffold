import React from 'react';
import { Link } from 'react-router-dom';

const TEAM_MEMBERS = [
  {
    name: 'Pranav Pushya',
    role: 'State & AI Integration',
    avatar: 'PP',
    githubUrl: 'https://github.com/pranav-pushya',
    linkedinUrl: 'https://www.linkedin.com/in/pranav-pushya/',
  },
  {
    name: 'Tiksha',
    role: 'UI/UX & Design System',
    avatar: 'T',
    githubUrl: 'https://github.com/tiksha26',
    linkedinUrl: 'https://www.linkedin.com/in/tiksha-642255370?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  },
  {
    name: 'Tammanna Kakkar',
    role: 'ATS Engine & Resume Exporter',
    avatar: 'TK',
    githubUrl: 'https://github.com/TamannaKakkar2310',
    linkedinUrl: 'https://www.linkedin.com/in/tamanna-kakkar-995b73385?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  },
];

const PLATFORM_HIGHLIGHTS = [
  'Profile OS',
  'AI Project Coach',
  'Kanban Tracker',
  'Auto Portfolio',
  'ATS Resume Exporter',
];

export default function Footer() {
  return (
    <footer
      className="py-14 px-6 border-t mt-auto"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand & Highlights */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <Link
                to="/"
                className="font-mono font-bold text-xl flex items-center mb-4"
                style={{ color: 'var(--fg)', textDecoration: 'none' }}
              >
                <span style={{ color: 'var(--accent)' }}>&lt;/S&gt;</span>caffold
                <span className="logo-cursor"></span>
              </Link>
              <p className="text-sm text-muted mb-6 leading-relaxed max-w-md">
                Next-generation engineering workspace integrating developer profiles, automated portfolios, project
                tracking, and intelligent career tools.
              </p>
            </div>

            {/* Platform Highlights Pills */}
            <div>
              <span className="tag mb-3 inline-block">Platform Modules</span>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_HIGHLIGHTS.map((item) => (
                  <span
                    key={item}
                    className="font-mono text-xs px-3 py-1 rounded border"
                    style={{
                      background: 'var(--bg)',
                      borderColor: 'var(--border-strong)',
                      color: 'var(--fg-dim)',
                    }}
                  >
                    <i className="fas fa-cube text-xs text-amber-500 mr-1"></i> {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Core Team Members */}
          <div className="lg:col-span-7">
            <span className="tag mb-4 inline-block">Core Engineering Team</span>
            <div className="grid sm:grid-cols-3 gap-4">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  className="p-4 rounded-lg border flex flex-col justify-between"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                        style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: 'var(--fg)' }}>
                          {member.name}
                        </div>
                        <div className="font-mono text-xs" style={{ color: 'var(--accent-2)' }}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 pt-3 border-t font-mono text-xs"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-link flex items-center gap-1"
                    >
                      <i className="fab fa-github"></i> GitHub
                    </a>
                    <span style={{ color: 'var(--muted)' }}>·</span>
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-link flex items-center gap-1"
                    >
                      <i className="fab fa-linkedin"></i> LinkedIn
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Terminal Footer Status Bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 font-mono text-xs border-t"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          <div>© 2026 Scaffold Platform</div>
          <div>
            <span style={{ color: 'var(--accent)' }}>$</span> echo "thanks for using scaffold" | sudo tee /dev/stdout
          </div>
        </div>
      </div>
    </footer>
  );
}
