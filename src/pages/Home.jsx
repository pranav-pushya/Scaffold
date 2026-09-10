import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './home.css';

export default function Home() {
  const navigate = useNavigate();
  const [typewriterText, setTypewriterText] = useState('');
  const [mouseGlow, setMouseGlow] = useState({ x: 0, y: 0, visible: false });

  // Typewriter effect converted to React useState/useEffect
  useEffect(() => {
    const greetings = [
      "hello, developer.",
      "you found </S>caffold.",
      "welcome to developers dashboard.",
      "architected for modern engineers.",
      "console.log('system operational.');",
    ];
    let gIdx = 0;
    let cIdx = 0;
    let deleting = false;
    let timeoutId;

    function tick() {
      const current = greetings[gIdx];
      if (deleting) {
        cIdx--;
        setTypewriterText(current.slice(0, cIdx));
        if (cIdx === 0) {
          deleting = false;
          gIdx = (gIdx + 1) % greetings.length;
          timeoutId = setTimeout(tick, 400);
          return;
        }
        timeoutId = setTimeout(tick, 35);
      } else {
        cIdx++;
        setTypewriterText(current.slice(0, cIdx));
        if (cIdx === current.length) {
          deleting = true;
          timeoutId = setTimeout(tick, 2200);
          return;
        }
        timeoutId = setTimeout(tick, 75 + Math.random() * 50);
      }
    }

    tick();

    return () => clearTimeout(timeoutId);
  }, []);

  // Mouse glow effect converted to React state
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setMouseGlow((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero-section bg-grid"
        id="hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="float-dot"
          style={{ width: '500px', height: '500px', top: '5%', left: '-150px', background: 'var(--accent)' }}
        ></div>
        <div
          className="float-dot"
          style={{
            width: '600px',
            height: '600px',
            bottom: '-200px',
            right: '-200px',
            background: 'var(--accent-2)',
            animationDelay: '-5s',
          }}
        ></div>
        <div
          className="mouse-glow"
          id="mouseGlow"
          style={{
            left: `${mouseGlow.x}px`,
            top: `${mouseGlow.y}px`,
            opacity: mouseGlow.visible ? 1 : 0,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-6 w-full" style={{ zIndex: 2 }}>
          <div className="max-w-5xl">
            {/* Issue meta */}
            <div className="flex items-center gap-3 mb-8 font-mono text-xs flex-wrap" style={{ color: 'var(--muted)' }}>
              <span className="tag">PBE-II Build 1.0.4</span>
              <span>·</span>
              <span>Firebase SPA Architecture</span>
              <span>·</span>
              <span className="flex items-center gap-2">
                <span className="stat-dot"></span> system operational
              </span>
            </div>

            {/* Typewriter greeting */}
            <h1
              className="font-mono font-bold mb-8"
              style={{ fontSize: 'clamp(2.5rem, 7.5vw, 6.5rem)', lineHeight: 1.02, letterSpacing: '-0.045em' }}
            >
              <span style={{ color: 'var(--muted)' }}>$</span>{' '}
              <span id="typewriter" className="cursor">
                {typewriterText}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="font-display text-2xl md:text-3xl mb-5"
              style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--fg)', lineHeight: 1.3 }}
            >
              A unified developer workspace &amp; engineering log — built for modern system architects.
            </p>

            <p className="text-base md:text-lg mb-12 max-w-2xl" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              An all-in-one developer OS combining real-time project management, AI-assisted portfolio showcase, ATS resume exporting, and multi-factor security.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-20">
              <Link to="/dashboard" className="btn-primary">
                launch dashboard
                <i className="fas fa-arrow-right text-xs ml-1"></i>
              </Link>
              <Link to="/login" id="accountPortalBtn" className="btn-secondary">
                <i className="fas fa-key text-xs mr-1"></i>
                account portal
              </Link>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl">
              <div>
                <div className="font-mono font-bold text-3xl md:text-4xl" style={{ color: 'var(--accent)' }}>
                  3
                </div>
                <div className="font-mono text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--muted)' }}>
                  core engineers
                </div>
              </div>
              <div>
                <div className="font-mono font-bold text-3xl md:text-4xl" style={{ color: 'var(--accent)' }}>
                  100%
                </div>
                <div className="font-mono text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--muted)' }}>
                  react JS &amp; firebase
                </div>
              </div>
              <div>
                <div className="font-mono font-bold text-3xl md:text-4xl" style={{ color: 'var(--accent)' }}>
                  3
                </div>
                <div className="font-mono text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--muted)' }}>
                  theme modes (press T)
                </div>
              </div>
              <div>
                <div className="font-mono font-bold text-3xl md:text-4xl" style={{ color: 'var(--accent)' }}>
                  ∞
                </div>
                <div className="font-mono text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--muted)' }}>
                  possibilities
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="py-5 border-y marquee-wrap" style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}>
        <div className="marquee font-mono text-sm uppercase tracking-widest flex gap-8" style={{ color: 'var(--muted)' }}>
          <span>Vanilla JS</span><span>·</span><span>Firebase Auth</span><span>·</span><span>Firestore</span><span>·</span><span>Security Check</span><span>·</span><span>Vite</span><span>·</span><span>Tailwind CSS</span><span>·</span><span>Theme Engine</span><span>·</span><span>SPA Router</span><span>·</span>
          <span>Vanilla JS</span><span>·</span><span>Firebase Auth</span><span>·</span><span>Firestore</span><span>·</span><span>Security Check</span><span>·</span><span>Vite</span><span>·</span><span>Tailwind CSS</span><span>·</span><span>Theme Engine</span><span>·</span><span>SPA Router</span><span>·</span>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display font-black text-3xl mb-12 text-center">Core Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card space-y-3">
            <i className="fas fa-user-lock text-3xl text-amber-500 mb-2"></i>
            <h3 className="font-display font-bold text-lg">Firebase Auth System</h3>
            <p className="text-xs text-muted leading-relaxed">
              Multi-factor security flow integrating Email/Password, Google OAuth, and interactive math Security Check validation.
            </p>
            <Link to="/login" className="hover-link font-mono text-xs">
              Test Auth Portal →
            </Link>
          </div>

          <div className="article-card">
            <div className="flex items-center justify-between mb-4">
              <span className="tag">Database</span>
              <i className="fas fa-database text-cyan-500 text-lg"></i>
            </div>
            <h3 className="font-display font-bold text-2xl mb-3">Firestore Profile Store</h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Controlled form management backing technical bios, education, skill sets, and career objectives to Firestore.
            </p>
            <Link to="/profile" className="hover-link font-mono text-xs">
              Edit Developer Profile →
            </Link>
          </div>

          <div className="article-card">
            <div className="flex items-center justify-between mb-4">
              <span className="tag">CRUD</span>
              <i className="fas fa-list-check text-emerald-500 text-lg"></i>
            </div>
            <h3 className="font-display font-bold text-2xl mb-3">Project Tracker</h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Real-time project tracking with progress meters, tech stack tags, and dynamic store synchronization.
            </p>
            <Link to="/tracker" className="hover-link font-mono text-xs">
              Manage Projects →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
