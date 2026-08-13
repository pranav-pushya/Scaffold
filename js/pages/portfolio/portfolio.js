// === AUTO PORTFOLIO PAGE ===
// Dynamic developer portfolio auto-generated from Profile OS data and Tracker projects

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProfile, getProjects } from '../../../firebase/firestoreService.js';

export async function renderPortfolioPage() {
    const user = getCurrentAuthUser() || { uid: 'demo' };
    const profile = await getProfile(user.uid) || {};
    const projects = await getProjects(user.uid) || [];

    const fullName = profile.fullName || user.displayName || 'Developer';
    const targetRole = profile.targetRole || 'Software Engineer';
    const tagline = profile.tagline || '';
    const bio = profile.bio || '';
    const location = profile.location || '';
    const email = profile.email || user.email || '';

    const coreLangs = profile.coreLanguages ? profile.coreLanguages.split(',').map(s => s.trim()).filter(Boolean) : [];
    const frameworks = profile.frameworks ? profile.frameworks.split(',').map(s => s.trim()).filter(Boolean) : [];
    const devTools = profile.devTools ? profile.devTools.split(',').map(s => s.trim()).filter(Boolean) : [];

    return `
    <div class="portfolio-wrapper">
        <div class="portfolio-container">



            <!-- Hero Banner -->
            <div class="portfolio-hero-card">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="space-y-3 max-w-2xl">
                        <div class="flex items-center gap-3 flex-wrap">
                            ${profile.jobStatus ? `
                                <span class="tag" style="background: rgba(16, 185, 129, 0.1); color: #059669; border-color: rgba(16, 185, 129, 0.3);">
                                    ${profile.jobStatus}
                                </span>
                            ` : ''}
                            ${location ? `<span class="text-xs font-mono text-muted"><i class="fas fa-map-marker-alt text-amber-500 mr-1"></i>${location}</span>` : ''}
                        </div>
                        
                        <h1 class="font-display font-extrabold text-4xl" style="color: var(--fg);">${fullName}</h1>
                        <h2 class="font-mono text-lg font-bold text-emerald-500">${targetRole}</h2>
                        ${tagline ? `<p class="text-sm text-muted leading-relaxed">${tagline}</p>` : ''}
                    </div>

                    ${profile.photoUrl ? `
                        <div class="w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shrink-0 shadow-lg">
                            <img src="${profile.photoUrl}" alt="${fullName}" class="w-full h-full object-cover">
                        </div>
                    ` : `
                        <div class="w-28 h-28 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <i class="fas fa-user-code text-4xl text-emerald-500"></i>
                        </div>
                    `}
                </div>

                <!-- Social & Contact Links -->
                <div class="flex items-center gap-4 flex-wrap pt-6 mt-6 border-t font-mono text-xs" style="border-color: var(--border);">
                    ${email ? `<a href="mailto:${email}" class="hover-link flex items-center gap-1.5"><i class="fas fa-envelope text-emerald-500"></i> ${email}</a>` : ''}
                    ${profile.phone ? `<span class="text-muted flex items-center gap-1.5"><i class="fas fa-phone text-emerald-500"></i> ${profile.phone}</span>` : ''}
                    ${profile.githubUrl ? `<a href="${profile.githubUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1.5"><i class="fab fa-github"></i> GitHub ↗</a>` : ''}
                    ${profile.linkedinUrl ? `<a href="${profile.linkedinUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1.5"><i class="fab fa-linkedin text-blue-500"></i> LinkedIn ↗</a>` : ''}
                    ${profile.websiteUrl ? `<a href="${profile.websiteUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1.5"><i class="fas fa-globe text-cyan-500"></i> Website ↗</a>` : ''}
                </div>
            </div>

            <!-- About & Executive Bio -->
            ${bio ? `
            <div class="portfolio-section-card">
                <h3 class="font-display font-bold text-xl mb-4 flex items-center gap-2" style="color: var(--fg);">
                    <i class="fas fa-user text-emerald-500"></i> About & Bio
                </h3>
                <p class="text-sm text-muted leading-relaxed whitespace-pre-line">${bio}</p>
            </div>
            ` : ''}

            <!-- Categorized Technical Competencies -->
            ${(coreLangs.length || frameworks.length || devTools.length) ? `
            <div class="portfolio-section-card">
                <h3 class="font-display font-bold text-xl mb-6 flex items-center gap-2" style="color: var(--fg);">
                    <i class="fas fa-code text-emerald-500"></i> Technical Competencies
                </h3>

                <div class="space-y-5">
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
                </div>
            </div>
            ` : ''}

            <!-- Featured Projects (Synched from Tracker) -->
            <div class="portfolio-section-card">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="font-display font-bold text-xl flex items-center gap-2" style="color: var(--fg);">
                        <i class="fas fa-folder-open text-emerald-500"></i> Featured Projects (${projects.length})
                    </h3>
                    <a href="#tracker" class="btn-secondary text-xs px-3 py-1.5">
                        <i class="fas fa-tasks mr-1"></i> Manage in Tracker
                    </a>
                </div>

                ${projects.length ? `
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
                ` : `
                    <div class="text-center py-10 border border-dashed rounded-xl" style="border-color: var(--border);">
                        <i class="fas fa-project-diagram text-3xl text-muted mb-3"></i>
                        <p class="text-sm text-muted mb-4">No projects logged in your Tracker yet.</p>
                        <a href="#tracker" class="btn-primary text-xs px-4 py-2">Add Projects in Tracker</a>
                    </div>
                `}
            </div>

            <!-- Work Experience -->
            ${profile.experience ? `
            <div class="portfolio-section-card">
                <h3 class="font-display font-bold text-xl mb-4 flex items-center gap-2" style="color: var(--fg);">
                    <i class="fas fa-briefcase text-emerald-500"></i> Work Experience & Past Roles
                </h3>
                <p class="text-sm text-muted leading-relaxed whitespace-pre-line">${profile.experience}</p>
            </div>
            ` : ''}

            <!-- Academic Credentials & Achievements -->
            ${(profile.degree || profile.institution || profile.achievements) ? `
            <div class="portfolio-section-card">
                <h3 class="font-display font-bold text-xl mb-4 flex items-center gap-2" style="color: var(--fg);">
                    <i class="fas fa-graduation-cap text-emerald-500"></i> Education & Achievements
                </h3>
                <div class="space-y-4 font-mono text-sm">
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
                </div>
            </div>
            ` : ''}

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
