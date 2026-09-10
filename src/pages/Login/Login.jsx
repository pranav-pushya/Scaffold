import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
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
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [modalResetError, setModalResetError] = useState('');
  const [modalResetSuccess, setModalResetSuccess] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser, loginWithEmail, signUpWithEmail, loginWithGoogle, logoutUser, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected here from a protected route and user is already authenticated, resume to target
  useEffect(() => {
    if (currentUser && location.state?.from?.pathname) {
      navigate(location.state.from.pathname, { replace: true });
    }
  }, [currentUser, navigate, location]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showResetModal) {
        setShowResetModal(false);
        setModalResetError('');
        setModalResetSuccess('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResetModal]);

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setResetMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowResetModal(false);
  };

  const handleOpenResetModal = (e) => {
    if (e) e.preventDefault();
    setError('');
    setModalResetError('');
    setModalResetSuccess('');
    setResetEmail(email.trim() || '');
    setShowResetModal(true);
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setModalResetError('');
    setModalResetSuccess('');
  };

  const handleModalResetSubmit = async (e) => {
    e.preventDefault();
    setModalResetError('');
    setModalResetSuccess('');

    const targetEmail = resetEmail.trim();
    if (!targetEmail) {
      setModalResetError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      setModalResetError('Please enter a valid email address.');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(targetEmail);
      setModalResetSuccess(`Password reset email sent to ${targetEmail}!`);
      setEmail(targetEmail);
      setResetMessage(`Password reset email sent to ${targetEmail} — check your inbox.`);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setModalResetError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setModalResetError('Please enter a valid email address.');
      } else if (err.code === 'auth/missing-email') {
        setModalResetError('Please enter your email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setModalResetError('Too many requests. Please try again in a few minutes.');
      } else {
        setModalResetError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    // If Sign Up, validate passwords match before proceeding
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="passInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    id="togglePasswordBtn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`password-toggle-btn ${showPassword ? 'active' : ''}`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      id="forgotPasswordBtn"
                      onClick={handleOpenResetModal}
                      className="text-xs font-mono transition-colors hover:underline"
                      style={{
                        color: 'var(--accent)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <div id="confirmPasswordField">
                  <label className="block font-mono text-xs mb-1 text-muted">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassInput"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      id="toggleConfirmPasswordBtn"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className={`password-toggle-btn ${showConfirmPassword ? 'active' : ''}`}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              )}

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

              {resetMessage && (
                <div
                  id="resetSuccessMsg"
                  className="text-xs font-mono text-emerald-400 p-3 rounded border flex items-center gap-2"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  <i className="fas fa-check-circle text-emerald-400 shrink-0"></i>
                  <span>{resetMessage}</span>
                </div>
              )}

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

      {/* On-Screen Forgot Password Modal Popup */}
      {showResetModal && (
        <div
          className="reset-modal-overlay"
          id="resetPasswordModal"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseResetModal();
          }}
        >
          <div className="reset-modal-box p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm"
                  style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent)' }}
                >
                  <i className="fas fa-key"></i>
                </div>
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--fg)' }}>
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                id="closeResetModalBtn"
                onClick={handleCloseResetModal}
                className="text-muted hover:text-white transition-colors p-1"
                aria-label="Close dialog"
              >
                <i className="fas fa-times text-base"></i>
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Enter your registered email address and we'll send you a secure link to reset your password.
            </p>

            <form onSubmit={handleModalResetSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs mb-1 text-muted">Email Address</label>
                <input
                  type="email"
                  id="resetEmailInput"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input-field"
                  placeholder="developer@scaffold.dev"
                  autoFocus
                  required
                />
              </div>

              {modalResetError && (
                <div
                  id="modalResetError"
                  className="text-xs font-mono text-red-400 p-3 rounded border flex items-center gap-2"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <i className="fas fa-exclamation-circle text-red-400 shrink-0"></i>
                  <span>{modalResetError}</span>
                </div>
              )}

              {modalResetSuccess && (
                <div className="space-y-3">
                  <div
                    id="modalResetSuccess"
                    className="text-xs font-mono text-emerald-400 p-3 rounded border flex items-center gap-2"
                    style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  >
                    <i className="fas fa-check-circle text-emerald-400 shrink-0"></i>
                    <span>{modalResetSuccess}</span>
                  </div>
                  <div
                    className="p-3 rounded border font-mono text-[11px] leading-relaxed"
                    style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start gap-2 text-amber-400 font-bold mb-1">
                      <i className="fas fa-envelope-open-text mt-0.5"></i> Check Spam / Junk Folder
                    </div>
                    <span className="text-muted">
                      Emails from Firebase often land in Gmail's <strong>Spam</strong> or <strong>Promotions</strong> folder from <em>noreply@scaffold-app-90278.firebaseapp.com</em>.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  id="cancelResetModalBtn"
                  onClick={handleCloseResetModal}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  {modalResetSuccess ? 'Close' : 'Cancel'}
                </button>
                {!modalResetSuccess && (
                  <button
                    type="submit"
                    id="submitResetModalBtn"
                    disabled={isResetting}
                    className="btn-primary text-xs px-4 py-2"
                    style={{ background: 'var(--accent)', color: '#000' }}
                  >
                    {isResetting ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin mr-1"></i> Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
