// === BOOT SCREEN PAGE (INITIAL WEBSITE & REFRESH LOADER) ===
// Terminal system initialization loader sequence with strict auth redirection rules

import { getCurrentAuthUser } from '../../../firebase/authService.js';

export function renderBootPage() {
    return `
    <div class="boot-container">
        <div class="boot-terminal">
            <div class="flex items-center justify-between mb-6 border-b pb-4" style="border-color: var(--border);">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                    <span class="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                    <span class="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                    <span class="text-xs text-muted font-mono ml-2">scaffold_kernel_v1.0.4</span>
                </div>
                <span class="tag">SYSTEM LOADER</span>
            </div>
            <div id="bootLog" class="space-y-2 text-sm leading-relaxed font-mono">
                <div><span style="color: var(--accent);">$</span> initialize --system scaffold</div>
            </div>
            <div class="mt-8 border-t pt-4 flex justify-between items-center text-xs font-mono text-muted" style="border-color: var(--border);">
                <span id="bootStatusText">Verifying credentials & security modules...</span>
                <span class="logo-cursor"></span>
            </div>
        </div>
    </div>
    `;
}

export function initBootSequence() {
    const logEl = document.getElementById('bootLog');
    const statusText = document.getElementById('bootStatusText');
    if (!logEl) return;

    const messages = [
        "[OK] Initializing memory subsystems...",
        "[OK] Mounting Firestore & Firebase Auth handlers...",
        "[OK] Loading local cache stores (profileStore, trackerStore)...",
        "[OK] Security Captcha & Theme engine initialized...",
        "[READY] Scaffold kernel boot complete. Redirecting..."
    ];

    let delay = 250;
    messages.forEach((msg, idx) => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = 'text-xs text-green-400 font-mono';
            line.textContent = msg;
            logEl.appendChild(line);

            if (idx === messages.length - 1) {
                if (statusText) statusText.textContent = "Redirecting...";
                setTimeout(() => {
                    const user = getCurrentAuthUser();

                    // If user is NOT logged in -> ALWAYS redirect to #login
                    if (!user) {
                        window.location.hash = '#login';
                    } else {
                        // If user IS logged in -> redirect to target page or #home
                        let target = sessionStorage.getItem('scaffold_redirect_target') || '#home';
                        sessionStorage.removeItem('scaffold_redirect_target');
                        if (target === '#boot' || target === '#login') {
                            target = '#home';
                        }
                        window.location.hash = target;
                    }
                }, 500);
            }
        }, delay);
        delay += 350;
    });
}
