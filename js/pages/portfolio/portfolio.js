// === AUTO PORTFOLIO PAGE ===
// Dynamic developer portfolio auto-generated from Profile OS data and Tracker projects with non-blocking initial rendering

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProfile, getProjects, fetchWithTimeout } from '../../../firebase/firestoreService.js';

export function renderPortfolioPage() {
    const user = getCurrentAuthUser() || { uid: 'demo' };
    const userName = user.displayName || 'Developer';

    return `
    <div class="portfolio-wrapper">
        <div class="portfolio-container">

            <!-- Async Loading / Connection Error Status Indicator -->
            <div id="portfolioDataStatus" class="mb-6 p-3 rounded-lg border font-mono text-xs hidden" style="background: var(--card); border-color: var(--border);">
            </div>

            <!-- Hero Banner -->
            <div class="portfolio-hero-card">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="space-y-3 max-w-2xl">
                        <div class="flex items-center gap-3 flex-wrap">
                            <span id="portJobStatus" class="tag hidden" style="background: rgba(16, 185, 129, 0.1); color: #059669; border-color: rgba(16, 185, 129, 0.3);">
                                Open to Opportunities
                            </span>
                            <span id="portLocation" class="text-xs font-mono text-muted"></span>
                        </div>
                        
                        <h1 id="portFullName" class="font-display font-extrabold text-4xl" style="color: var(--fg);">${userName}</h1>
                        <h2 id="portTargetRole" class="font-mono text-lg font-bold text-emerald-500">Software Engineer & Developer</h2>
                        <p id="portTagline" class="text-sm text-muted leading-relaxed"></p>
                    </div>

                    <div id="portPhotoBox">
                        <div class="w-28 h-28 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <i class="fas fa-user-code text-4xl text-emerald-500"></i>
                        </div>
                    </div>
                </div>

                <!-- Social & Contact Links -->
                <div id="portSocialLinks" class="flex items-center gap-4 flex-wrap pt-6 mt-6 border-t font-mono text-xs" style="border-color: var(--border);">
                </div>
            </div>

            <!-- About & Executive Bio -->
            <div id="portBioSection" class="portfolio-section-card hidden">
                <h3 class="font-display font-bold text-xl mb-4 flex items-center gap-2" style="color: var(--fg);">
                    <i class="fas fa-user text-emerald-500"></i> About & Bio
                </h3>
                <p id="portBioText" class="text-sm text-muted leading-relaxed whitespace-pre-line"></p>
            </div>

            <!-- Categorized Technical Competencies -->
            <div id="portSkillsSection" class="portfolio-section-card">
                <h3 class="font-display font-bold text-xl mb-6 flex items-center gap-2" style="color: var(--fg);">
                    <i class="fas fa-code text-emerald-500"></i> Technical Competencies
                </h3>

                <div id="portSkillsContainer" class="space-y-5">
                    <div class="text-xs text-muted font-mono italic">
                        <i class="fas fa-circle-notch fa-spin mr-1 text-emerald-500"></i> Syncing technical competencies...
                    </div>
                </div>
            </div>

            <!-- Featured Projects (Synched from Tracker) -->
            <div class="portfolio-section-card">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="font-display font-bold text-xl flex items-center gap-2" style="color: var(--fg);">
                        <i class="fas fa-folder-open text-emerald-500"></i> Featured Projects (<span id="portProjectCount">0</span>)
                    </h3>
                    <a href="#tracker" class="btn-secondary text-xs px-3 py-1.5">
                        <i class="fas fa-tasks mr-1"></i> Manage in Tracker
                    </a>
                </div>

                <div id="portProjectsGrid">
                    <div class="text-center py-10 border border-dashed rounded-xl" style="border-color: var(--border);">
                        <i class="fas fa-circle-notch fa-spin text-2xl text-emerald-500 mb-3"></i>
                        <p class="text-xs text-muted">Syncing project portfolio...</p>
                    </div>
                </div>
            </div>

            <!-- Work Experience -->
            <div id="portExpSection" class="portfolio-section-card hidden">
                <h3 class="font-display font-bold text-xl mb-4 flex items-center gap-2" style="color: var(--fg);">
                    <i class="fas fa-briefcase text-emerald-500"></i> Work Experience & Past Roles
                </h3>
                <p id="portExpText" class="text-sm text-muted leading-relaxed whitespace-pre-line"></p>
            </div>

            <!-- Academic Credentials & Achievements -->
            <div id="portEduSection" class="portfolio-section-card hidden">
                <h3 class="font-display font-bold text-xl mb-4 flex items-center gap-2" style="color: var(--fg);">
                    <i class="fas fa-graduation-cap text-emerald-500"></i> Education & Achievements
                </h3>
                <div id="portEduContainer" class="space-y-4 font-mono text-sm">
                </div>
            </div>

            <!-- Bottom Navigation Bar -->
            <div class="flex items-center justify-between flex-wrap gap-4 pt-4 border-t" style="border-color: var(--border);">
                <a href="#profile" class="btn-secondary text-xs px-4 py-2.5">
                    <i class="fas fa-user-edit mr-1"></i> Edit Profile Data
                </a>
                <a href="#resume" class="btn-primary text-xs px-5 py-2.5" style="background: #10b981; color: #fff;">
                    <i class="fas fa-file-invoice mr-1"></i> Generate Printable ATS Resume →
                </a>
            </div>

        </div>
    </div>
    `;
}

export function bindPortfolioEvents() {
    const user = getCurrentAuthUser() || { uid: 'demo' };
    const statusBox = document.getElementById('portfolioDataStatus');

    if (statusBox) {
        statusBox.classList.remove('hidden');
        statusBox.innerHTML = `<span class="text-emerald-500"><i class="fas fa-circle-notch fa-spin mr-1"></i> Syncing portfolio showcase from Firestore...</span>`;
    }

    // Intermediate 3s soft loading notice
    const slowTimer = setTimeout(() => {
        if (statusBox && !statusBox.classList.contains('hidden')) {
            statusBox.innerHTML = `<span class="text-amber-400"><i class="fas fa-circle-notch fa-spin mr-1"></i> Still loading, this may take a moment on slow connections...</span>`;
        }
    }, 3000);

    // 20s soft timeout notice
    const softTimeoutTimer = setTimeout(() => {
        if (statusBox && !statusBox.classList.contains('hidden')) {
            statusBox.innerHTML = `<span class="text-amber-400"><i class="fas fa-circle-notch fa-spin mr-1"></i> Still establishing Firestore connection...</span>`;
        }
    }, 20000);

    Promise.all([
        fetchWithTimeout(getProfile(user.uid), 20000),
        fetchWithTimeout(getProjects(user.uid), 20000)
    ]).then(([profile, projects]) => {
        clearTimeout(slowTimer);
        clearTimeout(softTimeoutTimer);
        if (!profile) profile = {};
        if (!projects) projects = [];
        if (statusBox) statusBox.classList.add('hidden');

        // Hero
        const fullName = profile.fullName || user.displayName || 'Developer';
        const targetRole = profile.targetRole || 'Software Engineer';

        setText('portFullName', fullName);
        setText('portTargetRole', targetRole);

        if (profile.jobStatus) {
            const el = document.getElementById('portJobStatus');
            if (el) {
                el.innerText = profile.jobStatus;
                el.classList.remove('hidden');
            }
        }

        if (profile.location) {
            const el = document.getElementById('portLocation');
            if (el) el.innerHTML = `<i class="fas fa-map-marker-alt text-amber-500 mr-1"></i>${profile.location}`;
        }

        if (profile.tagline) {
            setText('portTagline', profile.tagline);
        }

        if (profile.photoUrl) {
            const photoEl = document.getElementById('portPhotoBox');
            if (photoEl) {
                photoEl.innerHTML = `
                    <div class="w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shrink-0 shadow-lg">
                        <img src="${profile.photoUrl}" alt="${fullName}" class="w-full h-full object-cover">
                    </div>
                `;
            }
        }

        // Social Links
        const linksEl = document.getElementById('portSocialLinks');
        if (linksEl) {
            const email = profile.email || user.email || '';
            let html = '';
            if (email) html += `<a href="mailto:${email}" class="hover-link flex items-center gap-1.5"><i class="fas fa-envelope text-emerald-500"></i> ${email}</a>`;
            if (profile.phone) html += `<span class="text-muted flex items-center gap-1.5"><i class="fas fa-phone text-emerald-500"></i> ${profile.phone}</span>`;
            if (profile.githubUrl) html += `<a href="${profile.githubUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1.5"><i class="fab fa-github"></i> GitHub ↗</a>`;
            if (profile.linkedinUrl) html += `<a href="${profile.linkedinUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1.5"><i class="fab fa-linkedin text-blue-500"></i> LinkedIn ↗</a>`;
            if (profile.websiteUrl) html += `<a href="${profile.websiteUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1.5"><i class="fas fa-globe text-cyan-500"></i> Website ↗</a>`;
            linksEl.innerHTML = html;
        }

        // Bio
        if (profile.bio) {
            const bioSec = document.getElementById('portBioSection');
            if (bioSec) bioSec.classList.remove('hidden');
            setText('portBioText', profile.bio);
        }

        // Technical Skills
        const coreLangs = profile.coreLanguages ? profile.coreLanguages.split(',').map(s => s.trim()).filter(Boolean) : [];
        const frameworks = profile.frameworks ? profile.frameworks.split(',').map(s => s.trim()).filter(Boolean) : [];
        const devTools = profile.devTools ? profile.devTools.split(',').map(s => s.trim()).filter(Boolean) : [];

        const skillsContainer = document.getElementById('portSkillsContainer');
        if (skillsContainer) {
            if (coreLangs.length || frameworks.length || devTools.length) {
                skillsContainer.innerHTML = `
                    ${coreLangs.length ? `
                    <div>
                        <div class="font-mono text-xs text-muted mb-2 font-bold">CORE LANGUAGES & FUNDAMENTALS</div>
                        <div class="flex flex-wrap gap-2">
                            ${coreLangs.map(lang => `<span class="tech-tag">${lang}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    ${frameworks.length ? `
                    <div>
                        <div class="font-mono text-xs text-muted mb-2 font-bold">FRAMEWORKS, LIBRARIES & DATABASES</div>
                        <div class="flex flex-wrap gap-2">
                            ${frameworks.map(fw => `<span class="tech-tag" style="background: rgba(59, 130, 246, 0.12); color: #2563eb;">${fw}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    ${devTools.length ? `
                    <div>
                        <div class="font-mono text-xs text-muted mb-2 font-bold">DEVELOPER TOOLS & PLATFORMS</div>
                        <div class="flex flex-wrap gap-2">
                            ${devTools.map(tool => `<span class="tech-tag" style="background: rgba(168, 85, 247, 0.12); color: #9333ea;">${tool}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                `;
            } else {
                skillsContainer.innerHTML = `<div class="text-xs text-muted font-mono italic">No skills listed yet in Profile OS.</div>`;
            }
        }

        // Projects
        setText('portProjectCount', projects.length);
        const gridEl = document.getElementById('portProjectsGrid');
        if (gridEl) {
            if (projects.length) {
                gridEl.innerHTML = `
                    <div class="grid md:grid-cols-2 gap-6">
                        ${projects.map(p => {
                            const pTags = (p.techStack || p.tech || '').split(',').map(t => t.trim()).filter(Boolean);
                            return `
                            <div class="portfolio-project-card space-y-3">
                                <div class="flex items-start justify-between gap-2">
                                    <h4 class="font-display font-bold text-lg" style="color: var(--fg);">${p.title || p.name || 'Untitled Project'}</h4>
                                    <span class="tag text-[10px]" style="background: rgba(16, 185, 129, 0.1); color: #059669;">${p.status || 'Active'}</span>
                                </div>

                                ${pTags.length ? `
                                    <div class="flex flex-wrap gap-1">
                                        ${pTags.map(t => `<span class="tech-tag" style="font-size: 0.7rem; padding: 2px 7px;">${t}</span>`).join('')}
                                    </div>
                                ` : ''}

                                ${p.description ? `
                                    <p class="text-xs text-muted leading-relaxed">${p.description}</p>
                                ` : ''}

                                <div class="flex items-center gap-3 text-xs font-mono pt-2">
                                    ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener" class="hover-link text-emerald-500">Repo ↗</a>` : ''}
                                    ${p.deployUrl ? `<a href="${p.deployUrl}" target="_blank" rel="noopener" class="hover-link text-emerald-500">Live Demo ↗</a>` : ''}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                gridEl.innerHTML = `
                    <div class="text-center py-10 border border-dashed rounded-xl" style="border-color: var(--border);">
                        <i class="fas fa-project-diagram text-3xl text-muted mb-3"></i>
                        <p class="text-sm text-muted mb-4">No projects logged in your Tracker yet.</p>
                        <a href="#tracker" class="btn-primary text-xs px-4 py-2">Add Projects in Tracker</a>
                    </div>
                `;
            }
        }

        // Work Experience
        if (profile.experience) {
            const expSec = document.getElementById('portExpSection');
            if (expSec) expSec.classList.remove('hidden');
            setText('portExpText', profile.experience);
        }

        // Education
        if (profile.degree || profile.institution || profile.achievements) {
            const eduSec = document.getElementById('portEduSection');
            if (eduSec) eduSec.classList.remove('hidden');
            const eduContainer = document.getElementById('portEduContainer');
            if (eduContainer) {
                eduContainer.innerHTML = `
                    ${(profile.degree || profile.institution) ? `
                        <div>
                            <div class="font-bold text-base" style="color: var(--fg);">${profile.degree || 'Degree'}</div>
                            <div class="text-muted text-xs">${profile.institution || 'University'} ${profile.gradYear ? `• Class of ${profile.gradYear}` : ''} ${profile.cgpa ? `(${profile.cgpa})` : ''}</div>
                            ${profile.coursework ? `<div class="text-xs text-muted pt-1">Coursework: ${profile.coursework}</div>` : ''}
                            ${profile.certifications ? `<div class="text-xs text-muted pt-1">Certifications: ${profile.certifications}</div>` : ''}
                        </div>
                    ` : ''}

                    ${profile.achievements ? `
                        <div class="pt-2 border-t" style="border-color: var(--border);">
                            <div class="font-bold text-xs text-muted mb-2">KEY ACHIEVEMENTS & HONORS</div>
                            <p class="text-xs text-muted leading-relaxed whitespace-pre-line">${profile.achievements}</p>
                        </div>
                    ` : ''}
                `;
            }
        }

    }).catch(err => {
        clearTimeout(slowTimer);
        clearTimeout(softTimeoutTimer);
        console.error('Portfolio sync ACTUAL ERROR object:', err);
        if (statusBox) {
            statusBox.classList.remove('hidden');
            statusBox.innerHTML = `<span class="text-amber-400">⚠️ Unable to sync live portfolio data — ${err.message || err}.</span>`;
        }
    });

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el && text) el.innerText = text;
    }
}
