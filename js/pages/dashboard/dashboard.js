// === DASHBOARD PAGE ===
// Dynamic developer dashboard matching reference architecture

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProfile, getProjects } from '../../../firebase/firestoreService.js';

export async function renderDashboardPage() {
    const user = getCurrentAuthUser() || { displayName: 'Developer', email: '', uid: 'demo' };
    const profile = await getProfile(user.uid) || {};
    const projects = await getProjects(user.uid) || [];

    // Calculate real Profile Readiness & ATS Score
    const profileFields = [
        profile.fullName, profile.email, profile.phone, profile.location,
        profile.targetRole, profile.bio, profile.coreLanguages, profile.frameworks,
        profile.devTools, profile.degree, profile.institution, profile.githubUrl,
        profile.linkedinUrl, profile.experience
    ];
    const filledCount = profileFields.filter(Boolean).length;
    const readinessPercent = Math.round((filledCount / profileFields.length) * 100);

    // ATS Score heuristic based on completed fields & logged projects
    let atsScore = Math.round((readinessPercent * 0.75) + (projects.length >= 1 ? 15 : 0) + (projects.length >= 3 ? 10 : 0));
    if (atsScore > 100) atsScore = 100;

    let gradeText = 'Grade D • Needs Work';
    let gradeColor = '#ef4444';
    if (atsScore >= 80) { gradeText = 'Grade A • Excellent'; gradeColor = '#10b981'; }
    else if (atsScore >= 60) { gradeText = 'Grade B • Good'; gradeColor = '#3b82f6'; }
    else if (atsScore >= 40) { gradeText = 'Grade C • Fair'; gradeColor = '#f59e0b'; }

    // Project statistics
    const totalProjects = projects.length;
    const inProgressProjects = projects.filter(p => (p.status || '').toLowerCase().includes('progress')).length;
    const completedProjects = projects.filter(p => {
        const s = (p.status || '').toLowerCase();
        return s.includes('done') || s.includes('complete');
    }).length;
    const activeTasks = projects.filter(p => (p.status || '').toLowerCase().includes('progress'));

    const userName = profile.fullName || user.displayName || 'Developer';
    const userRole = profile.targetRole || 'Software Engineer & Developer';
    const expLevel = profile.experienceLevel || 'Beginner';

    return `
    <div class="dashboard-wrapper max-w-7xl mx-auto space-y-6">
        
        <!-- ROW 1: Hero Welcome & Profile/ATS Score -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left Welcome Hero (Span 2) -->
            <div class="lg:col-span-2 dashboard-hero-banner flex flex-col justify-between p-6 md:p-8 rounded-2xl border relative overflow-hidden"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="space-y-4">
                    <div class="flex items-center gap-3 flex-wrap">
                        <h1 class="font-display font-black text-3xl md:text-4xl" style="color: var(--fg);">
                            Welcome back, ${userName} 👋
                        </h1>
                        <span class="px-3 py-1 rounded-full text-xs font-mono font-bold"
                            style="background: rgba(16, 185, 129, 0.15); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);">
                            ${expLevel}
                        </span>
                    </div>

                    <h2 class="font-mono font-bold text-lg text-emerald-500">${userRole}</h2>

                    <p class="text-sm text-muted leading-relaxed max-w-2xl">
                        Track your active deliverables, monitor profile readiness, inspect ATS score heuristics, and feature your verified portfolio accomplishments.
                    </p>
                </div>

                <div class="pt-6 mt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    style="border-color: var(--border);">
                    <div class="w-full sm:w-auto flex-1 max-w-xs space-y-1.5">
                        <div class="flex justify-between text-xs font-mono">
                            <span class="text-muted">Profile Readiness:</span>
                            <span class="font-bold text-emerald-500">${readinessPercent}%</span>
                        </div>
                        <div class="w-full h-2 rounded-full overflow-hidden" style="background: var(--border);">
                            <div class="h-full bg-emerald-500 transition-all duration-500" style="width: ${readinessPercent}%;"></div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <a href="#profile" class="btn-secondary text-xs px-4 py-2 flex items-center gap-2">
                            <i class="fas fa-edit text-amber-500"></i> Edit Profile
                        </a>
                        <a href="#tracker" class="btn-primary text-xs px-4 py-2 flex items-center gap-2" style="background: #10b981; color: #fff;">
                            <i class="fas fa-tasks"></i> Open Kanban →
                        </a>
                    </div>
                </div>
            </div>

            <!-- Right Profile & ATS Score Card (Span 1) -->
            <div class="dashboard-score-card p-6 md:p-8 rounded-2xl border flex flex-col justify-between text-center"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="space-y-4">
                    <div class="font-mono text-xs font-bold uppercase tracking-wider text-muted">
                        PROFILE & ATS SCORE
                    </div>

                    <div class="py-2">
                        <div class="font-mono font-extrabold text-5xl md:text-6xl" style="color: var(--fg);">
                            ${atsScore}<span class="text-2xl text-muted font-normal">/100</span>
                        </div>
                    </div>

                    <div>
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold"
                            style="background: rgba(239, 68, 68, 0.1); color: ${gradeColor}; border: 1px solid ${gradeColor}40;">
                            ${gradeText}
                        </span>
                    </div>
                </div>

                <div class="pt-6 mt-6 border-t space-y-3" style="border-color: var(--border);">
                    <p class="text-xs text-muted leading-relaxed">
                        ${readinessPercent < 100 ? 'Add your professional email, bio, and city/country location for employer ATS indexing.' : 'Your profile is fully optimized for employer ATS indexing!'}
                    </p>
                    <a href="#profile" class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:underline">
                        View Full Audit →
                    </a>
                </div>
            </div>

        </div>

        <!-- ROW 2: 3 Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div class="dashboard-stat-card p-6 rounded-2xl border flex items-center justify-between"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="space-y-1">
                    <div class="font-mono text-xs font-bold uppercase tracking-wider text-muted">TOTAL PROJECTS</div>
                    <div class="font-mono font-extrabold text-3xl" style="color: var(--fg);">${totalProjects}</div>
                    <div class="text-xs text-muted">Across all Kanban columns</div>
                </div>
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">
                    📁
                </div>
            </div>

            <div class="dashboard-stat-card p-6 rounded-2xl border flex items-center justify-between"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="space-y-1">
                    <div class="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">IN PROGRESS</div>
                    <div class="font-mono font-extrabold text-3xl text-emerald-500">${inProgressProjects}</div>
                    <div class="text-xs text-muted">Active deliverables</div>
                </div>
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style="background: rgba(16, 185, 129, 0.12); color: #10b981;">
                    ⚡
                </div>
            </div>

            <div class="dashboard-stat-card p-6 rounded-2xl border flex items-center justify-between"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="space-y-1">
                    <div class="font-mono text-xs font-bold uppercase tracking-wider text-blue-500">COMPLETED</div>
                    <div class="font-mono font-extrabold text-3xl text-blue-500">${completedProjects}</div>
                    <div class="text-xs text-muted">Verified in Portfolio</div>
                </div>
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style="background: rgba(59, 130, 246, 0.12); color: #3b82f6;">
                    ✅
                </div>
            </div>

        </div>

        <!-- ROW 3: Active Tasks & AI Career Coach -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Left: Active Tasks -->
            <div class="p-6 rounded-2xl border flex flex-col justify-between space-y-4"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="flex items-center justify-between">
                    <h3 class="font-display font-bold text-lg flex items-center gap-2" style="color: var(--fg);">
                        ⚡ Active Tasks (${inProgressProjects})
                    </h3>
                    <a href="#tracker" class="text-xs font-bold text-emerald-500 hover:underline">
                        Open Board →
                    </a>
                </div>

                ${activeTasks.length ? `
                    <div class="space-y-2">
                        ${activeTasks.map(t => `
                            <div class="p-3 rounded-lg border flex items-center justify-between text-xs" style="border-color: var(--border); background: rgba(var(--accent-rgb), 0.02);">
                                <span class="font-bold" style="color: var(--fg);">${t.title || t.name}</span>
                                <span class="font-mono text-[10px] text-emerald-500">${t.techStack || t.tech || 'In Progress'}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="p-8 rounded-xl border border-dashed text-center text-xs text-muted" style="border-color: var(--border);">
                        No tasks currently in progress.
                    </div>
                `}
            </div>

            <!-- Right: AI Career Coach -->
            <div class="p-6 rounded-2xl border flex flex-col justify-between space-y-4"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="flex items-center justify-between">
                    <h3 class="font-display font-bold text-lg flex items-center gap-2" style="color: var(--fg);">
                        🤖 AI Career Coach
                    </h3>
                    <a href="#assistant" class="text-xs font-bold text-emerald-500 hover:underline">
                        Launch Coach →
                    </a>
                </div>

                <p class="text-xs text-muted leading-relaxed">
                    Get personalized project ideas, skill gap analysis, and ATS optimization advice tailored to your career target (<strong style="color: var(--fg);">${userRole}</strong>).
                </p>

                <div class="p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
                    style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);">
                    <span class="text-emerald-600 font-medium">💡 Generate custom project ideas</span>
                    <button id="suggestIdeasBtn" class="btn-primary text-[11px] px-3 py-1.5 shrink-0" style="background: #10b981; color: #fff;">
                        Suggest Ideas
                    </button>
                </div>
            </div>

        </div>

        <!-- ROW 4: Portfolio Showcase & ATS Resume Exporter -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="p-5 rounded-2xl border flex items-center justify-between gap-4"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style="background: rgba(16, 185, 129, 0.12); color: #10b981;">
                        💼
                    </div>
                    <div>
                        <h4 class="font-display font-bold text-base" style="color: var(--fg);">Portfolio Showcase</h4>
                        <p class="text-xs text-muted">${completedProjects} verified projects ready to share</p>
                    </div>
                </div>
                <a href="#portfolio" class="text-xs font-bold text-emerald-500 hover:underline shrink-0">
                    View Showcase →
                </a>
            </div>

            <div class="p-5 rounded-2xl border flex items-center justify-between gap-4"
                style="background: var(--card); border-color: var(--border-strong);">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style="background: rgba(168, 85, 247, 0.12); color: #a855f7;">
                        📄
                    </div>
                    <div>
                        <h4 class="font-display font-bold text-base" style="color: var(--fg);">ATS Resume Exporter</h4>
                        <p class="text-xs text-muted">Formatted CV synced with your latest profile record</p>
                    </div>
                </div>
                <a href="#resume" class="text-xs font-bold text-emerald-500 hover:underline shrink-0">
                    Export Resume →
                </a>
            </div>

        </div>

    </div>

    <!-- AI Suggest Ideas Modal -->
    <div id="ideasModalOverlay" class="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
        <div class="p-6 rounded-2xl max-w-lg w-full mx-4 shadow-2xl space-y-4 border" style="background: var(--card); border-color: var(--border-strong);">
            <div class="flex items-center justify-between border-b pb-3" style="border-color: var(--border);">
                <h3 class="font-display font-bold text-lg flex items-center gap-2" style="color: var(--fg);">
                    💡 AI Recommended Projects for ${userRole}
                </h3>
                <button type="button" id="closeIdeasBtn" class="text-muted hover:text-fg text-lg">&times;</button>
            </div>

            <div class="space-y-3 text-xs leading-relaxed">
                <div class="p-3 rounded-lg border" style="border-color: var(--border); background: rgba(var(--accent-rgb), 0.02);">
                    <div class="font-bold text-emerald-500 mb-1">1. Micro-Frontend Dashboard Architecture</div>
                    <p class="text-muted">Build a multi-app dashboard integrating custom web components, state management, and real-time telemetry analytics.</p>
                </div>

                <div class="p-3 rounded-lg border" style="border-color: var(--border); background: rgba(var(--accent-rgb), 0.02);">
                    <div class="font-bold text-emerald-500 mb-1">2. High-Performance ATS Resume Parser API</div>
                    <p class="text-muted">Implement a serverless heuristic parser that checks keywords, section hierarchy, and formatting compliance.</p>
                </div>

                <div class="p-3 rounded-lg border" style="border-color: var(--border); background: rgba(var(--accent-rgb), 0.02);">
                    <div class="font-bold text-emerald-500 mb-1">3. Collaborative Realtime Kanban Engine</div>
                    <p class="text-muted">Develop a drag-and-drop workspace board backed by Firebase Firestore with offline persistence and optimistic updates.</p>
                </div>
            </div>

            <div class="flex justify-end pt-2">
                <a href="#tracker" id="addIdeaToTrackerBtn" class="btn-primary text-xs px-4 py-2" style="background: #10b981; color: #fff;">
                    Add to Tracker Board →
                </a>
            </div>
        </div>
    </div>
    `;
}

export function bindDashboardEvents() {
    const suggestBtn = document.getElementById('suggestIdeasBtn');
    const ideasModal = document.getElementById('ideasModalOverlay');
    const closeIdeasBtn = document.getElementById('closeIdeasBtn');

    if (suggestBtn && ideasModal) {
        suggestBtn.addEventListener('click', () => {
            ideasModal.classList.remove('opacity-0', 'pointer-events-none');
        });
    }

    if (closeIdeasBtn && ideasModal) {
        closeIdeasBtn.addEventListener('click', () => {
            ideasModal.classList.add('opacity-0', 'pointer-events-none');
        });
    }
}
