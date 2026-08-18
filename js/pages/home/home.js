// === HOME PAGE ===
// Landing view customized specifically for Scaffold SPA Platform

export function renderHomePage() {
    return `
    <section class="hero-section bg-grid" id="hero">
        <div class="float-dot" style="width: 500px; height: 500px; top: 5%; left: -150px; background: var(--accent);"></div>
        <div class="float-dot" style="width: 600px; height: 600px; bottom: -200px; right: -200px; background: var(--accent-2); animation-delay: -5s;"></div>
        <div class="mouse-glow" id="mouseGlow"></div>

        <div class="relative max-w-7xl mx-auto px-6 w-full" style="z-index: 2;">
            <div class="max-w-5xl">
                <!-- Issue meta -->
                <div class="flex items-center gap-3 mb-8 font-mono text-xs flex-wrap" style="color: var(--muted);">
                    <span class="tag">PBE-I Build 1.0.4</span>
                    <span>·</span>
                    <span>Firebase SPA Architecture</span>
                    <span>·</span>
                    <span class="flex items-center gap-2">
                        <span class="stat-dot"></span> system operational
                    </span>
                </div>

                <!-- Typewriter greeting -->
                <h1 class="font-mono font-bold mb-8"
                    style="font-size: clamp(2.5rem, 7.5vw, 6.5rem); line-height: 1.02; letter-spacing: -0.045em;">
                    <span style="color: var(--muted);">$</span> <span id="typewriter" class="cursor"></span>
                </h1>

                <!-- Subtitle -->
                <p class="font-display text-2xl md:text-3xl mb-5"
                    style="font-style: italic; font-weight: 400; color: var(--fg); line-height: 1.3;">
                    A unified developer workspace & engineering log — built for modern system architects.
                </p>

                <p class="text-base md:text-lg mb-12 max-w-2xl" style="color: var(--muted); line-height: 1.6;">
                    An all-in-one developer OS combining real-time project management, AI-assisted portfolio showcase, ATS resume exporting, and multi-factor security.
                </p>

                <!-- CTAs -->
                <div class="flex flex-wrap gap-4 mb-20">
                    <a href="#dashboard" class="btn-primary">
                        launch dashboard
                        <i class="fas fa-arrow-right text-xs"></i>
                    </a>
                    <a href="#login" class="btn-secondary">
                        <i class="fas fa-key text-xs"></i>
                        account portal
                    </a>
                </div>

                <!-- Stats grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl">
                    <div>
                        <div class="font-mono font-bold text-3xl md:text-4xl" style="color: var(--accent);">3</div>
                        <div class="font-mono text-xs uppercase tracking-widest mt-2" style="color: var(--muted);">core engineers</div>
                    </div>
                    <div>
                        <div class="font-mono font-bold text-3xl md:text-4xl" style="color: var(--accent);">100%</div>
                        <div class="font-mono text-xs uppercase tracking-widest mt-2" style="color: var(--muted);">vanilla JS & firebase</div>
                    </div>
                    <div>
                        <div class="font-mono font-bold text-3xl md:text-4xl" style="color: var(--accent);">3</div>
                        <div class="font-mono text-xs uppercase tracking-widest mt-2" style="color: var(--muted);">theme modes (press T)</div>
                    </div>
                    <div>
                        <div class="font-mono font-bold text-3xl md:text-4xl" style="color: var(--accent);">∞</div>
                        <div class="font-mono text-xs uppercase tracking-widest mt-2" style="color: var(--muted);">possibilities</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Marquee -->
    <div class="py-5 border-y marquee-wrap" style="border-color: var(--border); background: var(--bg-elev);">
        <div class="marquee font-mono text-sm uppercase tracking-widest flex gap-8" style="color: var(--muted);">
            <span>Vanilla JS</span><span>·</span><span>Firebase Auth</span><span>·</span><span>Firestore</span><span>·</span><span>Security Check</span><span>·</span><span>Vite</span><span>·</span><span>Tailwind CSS</span><span>·</span><span>Theme Engine</span><span>·</span><span>SPA Router</span><span>·</span>
            <span>Vanilla JS</span><span>·</span><span>Firebase Auth</span><span>·</span><span>Firestore</span><span>·</span><span>Security Check</span><span>·</span><span>Vite</span><span>·</span><span>Tailwind CSS</span><span>·</span><span>Theme Engine</span><span>·</span><span>SPA Router</span><span>·</span>
        </div>
    </div>

    <!-- Features Section -->
    <section class="max-w-6xl mx-auto px-6 py-20">
        <h2 class="font-display font-black text-3xl mb-12 text-center">Core Platform Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="card space-y-3">
                <i class="fas fa-user-lock text-3xl text-amber-500 mb-2"></i>
                <h3 class="font-display font-bold text-lg">Firebase Auth System</h3>
                <p class="text-xs text-muted leading-relaxed">
                    Multi-factor security flow integrating Email/Password, Google OAuth, and interactive math Security Check validation.
                </p>
                <a href="#login" class="hover-link font-mono text-xs">Test Auth Portal →</a>
            </div>

            <div class="article-card">
                <div class="flex items-center justify-between mb-4">
                    <span class="tag">Database</span>
                    <i class="fas fa-database text-cyan-500 text-lg"></i>
                </div>
                <h3 class="font-display font-bold text-2xl mb-3">Firestore Profile Store</h3>
                <p class="text-sm text-muted leading-relaxed mb-6">
                    Controlled form management backing technical bios, education, skill sets, and career objectives to Firestore.
                </p>
                <a href="#profile" class="hover-link font-mono text-xs">Edit Developer Profile →</a>
            </div>

            <div class="article-card">
                <div class="flex items-center justify-between mb-4">
                    <span class="tag">CRUD</span>
                    <i class="fas fa-list-check text-emerald-500 text-lg"></i>
                </div>
                <h3 class="font-display font-bold text-2xl mb-3">Project Tracker</h3>
                <p class="text-sm text-muted leading-relaxed mb-6">
                    Real-time project tracking with progress meters, tech stack tags, and dynamic store synchronization.
                </p>
                <a href="#tracker" class="hover-link font-mono text-xs">Manage Projects →</a>
            </div>
        </div>
    </section>
    `;
}

export function bindHomeEvents() {
    // Typewriter
    const greetings = [
        "hello, developer.",
        "you found </S>caffold.",
        "welcome to developers dashboard.",
        "architected for modern engineers.",
        "console.log('system operational.');",
    ];
    const typeEl = document.getElementById('typewriter');
    let gIdx = 0, cIdx = 0, deleting = false;

    function tick() {
        if (!typeEl) return;
        const current = greetings[gIdx];
        if (deleting) {
            cIdx--;
            typeEl.textContent = current.slice(0, cIdx);
            if (cIdx === 0) {
                deleting = false;
                gIdx = (gIdx + 1) % greetings.length;
                setTimeout(tick, 400);
                return;
            }
            setTimeout(tick, 35);
        } else {
            cIdx++;
            typeEl.textContent = current.slice(0, cIdx);
            if (cIdx === current.length) {
                deleting = true;
                setTimeout(tick, 2200);
                return;
            }
            setTimeout(tick, 75 + Math.random() * 50);
        }
    }
    if (typeEl) tick();

    // Mouse Glow
    const mouseGlow = document.getElementById('mouseGlow');
    const hero = document.getElementById('hero');
    if (hero && mouseGlow) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouseGlow.style.left = (e.clientX - rect.left) + 'px';
            mouseGlow.style.top = (e.clientY - rect.top) + 'px';
            mouseGlow.style.opacity = '1';
        });
        hero.addEventListener('mouseleave', () => {
            mouseGlow.style.opacity = '0';
        });
    }
}
