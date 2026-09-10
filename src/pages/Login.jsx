import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import './login.css';

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return { num1, num2, expected: num1 + num2 };
}

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser, loginWithEmail, signUpWithEmail, loginWithGoogle, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected here from a protected route and user is already authenticated, resume to target
  useEffect(() => {
    if (currentUser && location.state?.from?.pathname) {
      navigate(location.state.from.pathname, { replace: true });
    }
  }, [currentUser, navigate, location]);

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Captcha validation
    if (parseInt(captchaAnswer, 10) !== captcha.expected) {
      setError('Captcha verification failed. Please try again.');
      setCaptcha(generateCaptcha());
      setCaptchaAnswer('');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      setCaptcha(generateCaptcha());
      setCaptchaAnswer('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper bg-grid">
      <div className="login-card">
        {/* Left Panel (Brand / Info) */}
        <div
          className="p-8 md:p-12 flex flex-col justify-between"
          style={{ background: 'var(--bg-elev)', borderRight: '1px solid var(--border)' }}
        >
          <div>
            <span className="tag mb-4 inline-block">PBE-I Authentication</span>
            <h2 className="font-display text-3xl font-black mb-4">
              Welcome to <span style={{ color: 'var(--accent)' }}>&lt;/S&gt;</span>caffold
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Access your developer profile, project stores, and analytics. Powered by Firebase Auth &amp; Firestore.
            </p>
          </div>
          <div className="space-y-3 font-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
            <div className="flex items-center gap-2">
              <i className="fas fa-check text-amber-500"></i> Firebase Auth (Email/Password)
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-check text-amber-500"></i> Google Single Sign-On
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-check text-amber-500"></i> Captcha Security Guard
            </div>
          </div>
        </div>

        {/* Right Panel (Auth Form or Active Session Account Portal) */}
        {currentUser ? (
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div>
              <div
                className="flex items-center justify-between mb-4 border-b pb-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="tag">Active Session</span>
                <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Authenticated
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Account Portal</h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                You are currently signed in to &lt;/S&gt;caffold. Manage your developer profile, open project stores, or switch accounts below.
              </p>

              <div
                className="p-4 rounded border font-mono text-xs space-y-2"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div className="text-muted text-[11px] uppercase tracking-wider">Signed in as</div>
                <div className="font-bold text-sm" style={{ color: 'var(--accent)' }}>
                  {currentUser.displayName || 'Developer'}
                </div>
                <div style={{ color: 'var(--fg-dim)' }}>
                  {currentUser.email || 'No email associated'}
                </div>
                {currentUser.uid && (
                  <div
                    className="text-[10px] text-muted pt-2 border-t mt-2 font-mono"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    UID: {currentUser.uid}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div id="authError" className="text-xs font-mono text-red-400">
                ❌ {error}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Link to="/profile" id="portalProfileBtn" className="btn-primary w-full justify-center">
                <i className="fas fa-user-circle text-xs mr-1"></i>
                Developer Profile &amp; Settings
              </Link>
              <Link to="/dashboard" id="portalDashboardBtn" className="btn-secondary w-full justify-center">
                <i className="fas fa-chart-line text-xs mr-1"></i>
                Launch Dashboard
              </Link>
              <button
                type="button"
                id="portalLogoutBtn"
                onClick={async () => {
                  try {
                    await logoutUser();
                  } catch (err) {
                    setError(err.message || 'Logout failed');
                  }
                }}
                className="btn-secondary w-full justify-center text-red-400 hover:text-red-300"
                style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <i className="fas fa-sign-out-alt text-xs mr-1"></i>
                Sign Out / Switch Account
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div
              className="flex items-center justify-between mb-6 border-b pb-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                type="button"
                id="tabLogin"
                onClick={() => handleTabSwitch('login')}
                className={`font-mono text-sm font-bold ${mode === 'login' ? 'active-tab' : 'text-muted'}`}
                style={{ color: mode === 'login' ? 'var(--accent)' : 'var(--muted)' }}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tabSignup"
                onClick={() => handleTabSwitch('signup')}
                className={`font-mono text-sm font-bold ${mode === 'signup' ? 'active-tab' : 'text-muted'}`}
                style={{ color: mode === 'signup' ? 'var(--accent)' : 'var(--muted)' }}
              >
                Sign Up
              </button>
            </div>

            <form id="authForm" onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div id="nameField">
                  <label className="block font-mono text-xs mb-1 text-muted">Full Name</label>
                  <input
                    type="text"
                    id="nameInput"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Pranav Pushya"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-xs mb-1 text-muted">Email Address</label>
                <input
                  type="email"
                  id="emailInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="developer@scaffold.dev"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs mb-1 text-muted">Password</label>
                <input
                  type="password"
                  id="passInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Captcha Widget */}
              <div
                className="p-4 rounded border my-4"
                style={{ background: 'var(--bg-elev)', borderColor: 'var(--border-strong)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                    <i className="fas fa-shield-alt text-amber-500 mr-1"></i> Security Check
                  </span>
                  <span className="tag">SECURITY CHECK</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold" style={{ color: 'var(--fg)' }}>
                    What is {captcha.num1} + {captcha.num2}?
                  </span>
                  <input
                    type="number"
                    id="captchaAnswer"
                    data-expected={captcha.expected}
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="input-field py-1.5 px-3 text-xs w-24"
                    placeholder="Answer"
                    required
                  />
                </div>
              </div>

              {error && (
                <div id="authError" className="text-xs font-mono text-red-400">
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                id="submitAuthBtn"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center"
              >
                {mode === 'login' ? (
                  <>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}{' '}
                    <i className="fas fa-arrow-right text-xs ml-1"></i>
                  </>
                ) : (
                  <>
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}{' '}
                    <i className="fas fa-user-plus text-xs ml-1"></i>
                  </>
                )}
              </button>
            </form>

            <div className="my-6 text-center text-xs text-muted font-mono">OR</div>

            <button
              type="button"
              id="googleAuthBtn"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="btn-secondary w-full justify-center"
            >
              <i className="fab fa-google text-red-400 mr-2"></i> Continue with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
