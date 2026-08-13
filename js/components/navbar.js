// === NAVBAR COMPONENT ===
// Render navigation header with dynamic auth user state, mobile menu toggle, settings modal, and logout confirmation popup

import { getCurrentAuthUser, logoutUser } from '../../firebase/authService.js';
import { getTheme } from '../theme/themeManager.js';

export function renderNavbar() {
    const user = getCurrentAuthUser();
    const currentTheme = getTheme();

    return `
    <header class="fixed top-0 left-0 right-0 z-50"
        style="backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); background: rgba(var(--accent-rgb), 0.02); border-bottom: 1px solid var(--border);">
        <nav class="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <a href="#home" class="font-mono font-bold text-lg flex items-center"
                style="color: var(--fg); text-decoration: none;">
                <span style="color: var(--accent);">&lt;/S&gt;</span>caffold<span class="logo-cursor"></span>
            </a>

            <!-- Desktop Nav Links -->
            <div class="hidden md:flex items-center gap-7 font-mono text-sm">
                <a href="#home" class="hover-link">home</a>
                <a href="#dashboard" class="hover-link">dashboard</a>
                <a href="#profile" class="hover-link">profile</a>
                <a href="#tracker" class="hover-link">tracker</a>
                <a href="#portfolio" class="hover-link">portfolio</a>
                <a href="#resume" class="hover-link">resume</a>
                <a href="#assistant" class="hover-link" style="color: var(--accent);">assistant</a>
            </div>

            <div class="flex items-center gap-2 md:gap-3">
                <div class="theme-toggle" role="group" aria-label="Theme selector">
                    <button class="theme-btn ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark" title="Dark" aria-label="Dark theme"><i class="fas fa-moon"></i></button>
                    <button class="theme-btn ${currentTheme === 'light' ? 'active' : ''}" data-theme="light" title="Light" aria-label="Light theme"><i class="fas fa-sun"></i></button>
                    <button class="theme-btn ${currentTheme === 'cyber' ? 'active' : ''}" data-theme="cyber" title="Cyber" aria-label="Cyber theme"><i class="fas fa-terminal"></i></button>
                </div>

                <button id="settingsBtn" class="btn-secondary text-xs flex items-center justify-center" title="Settings" aria-label="Settings" style="padding: 7px 11px; border-radius: 999px;">
                    <i class="fas fa-cog text-sm"></i>
                </button>

                ${user ? `
                    <button id="logoutBtn" class="btn-secondary text-xs px-2.5 py-1.5 md:px-3" style="padding: 6px 12px;">
                        <i class="fas fa-sign-out-alt"></i> <span class="hidden sm:inline">logout</span>
                    </button>
                ` : `
                    <a href="#login" class="btn-primary text-xs px-2.5 py-1.5 md:px-3" style="padding: 6px 12px;">
                        <i class="fas fa-lock"></i> <span class="hidden sm:inline">login</span>
                    </a>
                `}

                <!-- Mobile Hamburger Button -->
                <button id="mobileMenuBtn" class="btn-secondary text-xs md:hidden flex items-center justify-center" title="Toggle Navigation Menu" style="padding: 7px 11px; border-radius: 8px;">
                    <i class="fas fa-bars text-sm"></i>
                </button>
            </div>
        </nav>

        <!-- Mobile Navigation Menu Drawer -->
        <div id="mobileNavMenu" class="hidden md:hidden border-b shadow-2xl p-5 space-y-3 font-mono text-sm" style="background: var(--card); border-color: var(--border-strong);">
            <a href="#home" class="mobile-nav-link block py-2 border-b" style="border-color: var(--border); color: var(--fg);"><i class="fas fa-home mr-2 text-emerald-500"></i> home</a>
            <a href="#dashboard" class="mobile-nav-link block py-2 border-b" style="border-color: var(--border); color: var(--fg);"><i class="fas fa-chart-line mr-2 text-cyan-500"></i> dashboard</a>
            <a href="#profile" class="mobile-nav-link block py-2 border-b" style="border-color: var(--border); color: var(--fg);"><i class="fas fa-user-edit mr-2 text-amber-500"></i> profile</a>
            <a href="#tracker" class="mobile-nav-link block py-2 border-b" style="border-color: var(--border); color: var(--fg);"><i class="fas fa-tasks mr-2 text-emerald-500"></i> tracker</a>
            <a href="#portfolio" class="mobile-nav-link block py-2 border-b" style="border-color: var(--border); color: var(--fg);"><i class="fas fa-globe mr-2 text-blue-500"></i> portfolio</a>
            <a href="#resume" class="mobile-nav-link block py-2 border-b" style="border-color: var(--border); color: var(--fg);"><i class="fas fa-file-invoice mr-2 text-purple-500"></i> resume</a>
            <a href="#assistant" class="mobile-nav-link block py-2" style="color: var(--accent);"><i class="fas fa-brain mr-2"></i> assistant</a>
        </div>
    </header>

    <!-- Logout Confirmation Modal Overlay (Root Positioned) -->
    <div id="logoutModalOverlay" class="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
        <div class="p-6 rounded-xl max-w-md w-full mx-4 shadow-2xl space-y-4 border" style="background: var(--card); border-color: var(--border-strong);">
            <div class="flex items-center gap-3 text-red-400">
                <i class="fas fa-sign-out-alt text-2xl"></i>
                <h3 class="font-display font-bold text-lg" style="color: var(--fg);">Sign Out of Scaffold?</h3>
            </div>
            <p class="text-sm text-muted leading-relaxed">
                Are you sure you want to log out of your current session? You will be redirected to the account login portal.
            </p>
            <div class="flex items-center justify-end gap-3 pt-2">
                <button type="button" id="cancelLogoutBtn" class="btn-secondary text-xs px-4 py-2">Cancel</button>
                <button type="button" id="confirmLogoutBtn" class="btn-primary text-xs px-4 py-2" style="background: #ef4444; color: #fff;">Confirm Logout</button>
            </div>
        </div>
    </div>
    `;
}

export function bindNavbarEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutOverlay = document.getElementById('logoutModalOverlay');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileNavMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNavMenu.classList.toggle('hidden');
        });
    }

    if (mobileLinks.length && mobileNavMenu) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavMenu.classList.add('hidden');
            });
        });
    }

    if (logoutBtn && logoutOverlay) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (mobileNavMenu) mobileNavMenu.classList.add('hidden');
            logoutOverlay.classList.remove('opacity-0', 'pointer-events-none');
        });
    }

    if (cancelLogoutBtn && logoutOverlay) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutOverlay.classList.add('opacity-0', 'pointer-events-none');
        });
    }

    if (confirmLogoutBtn && logoutOverlay) {
        confirmLogoutBtn.addEventListener('click', async () => {
            logoutOverlay.classList.add('opacity-0', 'pointer-events-none');
            await logoutUser();
        });
    }
}
