// === LOGIN / SIGNUP PAGE ===
// Handles Email/Password Authentication, Google Auth, Captcha & Form validation

import { loginWithEmail, signUpWithEmail, loginWithGoogle } from '../../../firebase/authService.js';
import { renderCaptchaWidget } from './captcha.js';

let captchaInstance = null;

export function renderLoginPage() {
    captchaInstance = renderCaptchaWidget();

    return `
    <div class="login-wrapper bg-grid">
        <div class="login-card">
            <!-- Left Panel (Brand / Info) -->
            <div class="p-8 md:p-12 flex flex-col justify-between" style="background: var(--bg-elev); border-right: 1px solid var(--border);">
                <div>
                    <span class="tag mb-4 inline-block">PBE-I Authentication</span>
                    <h2 class="font-display text-3xl font-black mb-4">Welcome to <span style="color: var(--accent);">&lt;/S&gt;</span>caffold</h2>
                    <p class="text-sm text-muted leading-relaxed mb-6">
                        Access your developer profile, project stores, and analytics. Powered by Firebase Auth & Firestore.
                    </p>
                </div>
                <div class="space-y-3 font-mono text-xs" style="color: var(--fg-dim);">
                    <div class="flex items-center gap-2"><i class="fas fa-check text-amber-500"></i> Firebase Auth (Email/Password)</div>
                    <div class="flex items-center gap-2"><i class="fas fa-check text-amber-500"></i> Google Single Sign-On</div>
                    <div class="flex items-center gap-2"><i class="fas fa-check text-amber-500"></i> Captcha Security Guard</div>
                </div>
            </div>

            <!-- Right Panel (Auth Form) -->
            <div class="p-8 md:p-12 flex flex-col justify-center">
                <div class="flex items-center justify-between mb-6 border-b pb-3" style="border-color: var(--border);">
                    <button id="tabLogin" class="font-mono text-sm font-bold active-tab" style="color: var(--accent);">Sign In</button>
                    <button id="tabSignup" class="font-mono text-sm text-muted">Sign Up</button>
                </div>

                <form id="authForm" class="space-y-4">
                    <div id="nameField" class="hidden">
                        <label class="block font-mono text-xs mb-1 text-muted">Full Name</label>
                        <input type="text" id="nameInput" class="input-field" placeholder="Pranav Pushya">
                    </div>

                    <div>
                        <label class="block font-mono text-xs mb-1 text-muted">Email Address</label>
                        <input type="email" id="emailInput" class="input-field" placeholder="developer@scaffold.dev" required>
                    </div>

                    <div>
                        <label class="block font-mono text-xs mb-1 text-muted">Password</label>
                        <input type="password" id="passInput" class="input-field" placeholder="••••••••" required>
                    </div>

                    <!-- Captcha Widget -->
                    ${captchaInstance.html}

                    <div id="authError" class="text-xs font-mono text-red-400 hidden"></div>

                    <button type="submit" id="submitAuthBtn" class="btn-primary w-full justify-center">
                        Sign In <i class="fas fa-arrow-right text-xs"></i>
                    </button>
                </form>

                <div class="my-6 text-center text-xs text-muted font-mono">OR</div>

                <button id="googleAuthBtn" class="btn-secondary w-full justify-center">
                    <i class="fab fa-google text-red-400"></i> Continue with Google
                </button>
            </div>
        </div>
    </div>
    `;
}

export function bindLoginEvents() {
    let mode = 'login'; // 'login' or 'signup'

    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('submitAuthBtn');
    const authForm = document.getElementById('authForm');
    const googleBtn = document.getElementById('googleAuthBtn');
    const errorEl = document.getElementById('authError');

    if (!authForm) return;

    tabLogin.addEventListener('click', () => {
        mode = 'login';
        tabLogin.style.color = 'var(--accent)';
        tabSignup.style.color = 'var(--muted)';
        nameField.classList.add('hidden');
        submitBtn.innerHTML = `Sign In <i class="fas fa-arrow-right text-xs"></i>`;
    });

    tabSignup.addEventListener('click', () => {
        mode = 'signup';
        tabSignup.style.color = 'var(--accent)';
        tabLogin.style.color = 'var(--muted)';
        nameField.classList.remove('hidden');
        submitBtn.innerHTML = `Create Account <i class="fas fa-user-plus text-xs"></i>`;
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.classList.add('hidden');

        // Verify captcha
        if (captchaInstance && !captchaInstance.verify()) {
            errorEl.textContent = '❌ Captcha verification failed. Please try again.';
            errorEl.classList.remove('hidden');
            return;
        }

        const email = document.getElementById('emailInput').value;
        const pass = document.getElementById('passInput').value;
        const name = document.getElementById('nameInput')?.value;

        try {
            if (mode === 'signup') {
                await signUpWithEmail(email, pass, name);
            } else {
                await loginWithEmail(email, pass);
            }
            window.location.hash = '#home';
        } catch (err) {
            errorEl.textContent = `❌ ${err.message}`;
            errorEl.classList.remove('hidden');
        }
    });

    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                await loginWithGoogle();
                window.location.hash = '#home';
            } catch (err) {
                errorEl.textContent = `❌ ${err.message}`;
                errorEl.classList.remove('hidden');
            }
        });
    }
}
