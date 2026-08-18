// === ATS RESUME EXPORTER PAGE ===
// Dynamic ATS-formatted resume auto-generated from Profile OS data and Tracker projects with non-blocking initial rendering

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProfile, getProjects, fetchWithTimeout } from '../../../firebase/firestoreService.js';

export function renderResumePage() {
    const user = getCurrentAuthUser() || { uid: 'demo' };
    const fullName = user.displayName || 'Developer Name';

    return `
    <div class="resume-wrapper">
        <div class="resume-container space-y-6">

            <!-- Print & Action Controls -->
            <div class="no-print flex items-center justify-between gap-3 p-4 rounded-xl border" style="background: var(--card); border-color: var(--border-strong);">
                <div id="resumeDataStatus" class="font-mono text-xs text-muted">
                    <i class="fas fa-circle-notch fa-spin text-emerald-500 mr-1"></i> Syncing ATS resume data...
                </div>
                <div class="flex items-center gap-3">
                    <a href="#profile" class="btn-secondary text-xs px-3 py-2">
                        <i class="fas fa-edit mr-1"></i> Edit Data
                    </a>
                    <button id="printResumeBtn" class="btn-primary text-xs px-5 py-2" style="background: #10b981; color: #fff;">
                        <i class="fas fa-print mr-1"></i> Print / Save as PDF
                    </button>
                </div>
            </div>

            <!-- Classic Clean ATS Resume Sheet -->
            <div class="resume-sheet space-y-6">
                
                <!-- Resume Header -->
                <div class="border-b pb-4" style="border-color: #e5e7eb;">
                    <h1 id="resHeaderName" class="resume-header-name">${fullName}</h1>
                    <div id="resHeaderRole" class="resume-header-role">Software Engineer</div>
                    
                    <div id="resContactList" class="flex flex-wrap gap-4 text-xs text-gray-600 mt-3 font-mono">
                    </div>
                </div>

                <!-- Executive Summary -->
                <div id="resSummarySection" class="hidden">
                    <h2 class="resume-section-title">Professional Summary</h2>
                    <p id="resSummaryText" class="text-xs text-gray-700 leading-relaxed whitespace-pre-line"></p>
                </div>

                <!-- Technical Skills -->
                <div id="resSkillsSection" class="hidden">
                    <h2 class="resume-section-title">Technical Skills</h2>
                    <div id="resSkillsContainer" class="space-y-1 text-xs text-gray-800 font-mono">
                    </div>
                </div>

                <!-- Projects (Pulling Live from Tracker) -->
                <div>
                    <h2 class="resume-section-title">Technical Projects (<span id="resProjectCount">0</span>)</h2>
                    <div id="resProjectsList">
                        <p class="text-xs text-gray-500 italic">Syncing project records...</p>
                    </div>
                </div>

                <!-- Work Experience -->
                <div id="resExpSection" class="hidden">
                    <h2 class="resume-section-title">Work Experience</h2>
                    <p id="resExpText" class="text-xs text-gray-700 leading-relaxed whitespace-pre-line"></p>
                </div>

                <!-- Education & Credentials -->
                <div id="resEduSection" class="hidden">
                    <h2 class="resume-section-title">Education & Achievements</h2>
                    <div id="resEduContainer" class="text-xs text-gray-800 space-y-2 font-mono">
                    </div>
                </div>

            </div>

        </div>
    </div>
    `;
}

export function bindResumeEvents() {
    const printBtn = document.getElementById('printResumeBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    const user = getCurrentAuthUser() || { uid: 'demo' };
    const statusBox = document.getElementById('resumeDataStatus');

    // Intermediate 3s soft loading notice
    const slowTimer = setTimeout(() => {
        if (statusBox) statusBox.innerHTML = `<span class="text-amber-400"><i class="fas fa-circle-notch fa-spin mr-1"></i> Still loading, this may take a moment on slow connections...</span>`;
    }, 3000);

    // 20s soft timeout notice
    const softTimeoutTimer = setTimeout(() => {
        if (statusBox) statusBox.innerHTML = `<span class="text-amber-400"><i class="fas fa-circle-notch fa-spin mr-1"></i> Still establishing Firestore connection...</span>`;
    }, 20000);

    Promise.all([
        fetchWithTimeout(getProfile(user.uid), 20000),
        fetchWithTimeout(getProjects(user.uid), 20000)
    ]).then(([profile, projects]) => {
        clearTimeout(slowTimer);
        clearTimeout(softTimeoutTimer);
        if (!profile) profile = {};
        if (!projects) projects = [];

        if (statusBox) statusBox.innerHTML = `<span class="text-emerald-500">✓ ATS Resume ready for export</span>`;

        // Header
        const fullName = profile.fullName || user.displayName || 'Developer Name';
        const targetRole = profile.targetRole || 'Software Engineer';
        setText('resHeaderName', fullName);
        setText('resHeaderRole', targetRole);

        // Contact
        const contactEl = document.getElementById('resContactList');
        if (contactEl) {
            const email = profile.email || user.email || '';
            const phone = profile.phone || '';
            const location = profile.location || '';
            let html = '';
            if (email) html += `<span>📧 ${email}</span>`;
            if (phone) html += `<span>📱 ${phone}</span>`;
            if (location) html += `<span>📍 ${location}</span>`;
            if (profile.githubUrl) html += `<span>🔗 ${profile.githubUrl.replace('https://', '')}</span>`;
            if (profile.linkedinUrl) html += `<span>🔗 ${profile.linkedinUrl.replace('https://', '')}</span>`;
            if (profile.websiteUrl) html += `<span>🌐 ${profile.websiteUrl.replace('https://', '')}</span>`;
            contactEl.innerHTML = html;
        }

        // Summary
        if (profile.bio) {
            const sec = document.getElementById('resSummarySection');
            if (sec) sec.classList.remove('hidden');
            setText('resSummaryText', profile.bio);
        }

        // Technical Skills
        const coreLangs = profile.coreLanguages || '';
        const frameworks = profile.frameworks || '';
        const devTools = profile.devTools || '';

        if (coreLangs || frameworks || devTools) {
            const sec = document.getElementById('resSkillsSection');
            if (sec) sec.classList.remove('hidden');
            const container = document.getElementById('resSkillsContainer');
            if (container) {
                let html = '';
                if (coreLangs) html += `<div><strong>Languages:</strong> ${coreLangs}</div>`;
                if (frameworks) html += `<div><strong>Frameworks & Databases:</strong> ${frameworks}</div>`;
                if (devTools) html += `<div><strong>Tools & Platforms:</strong> ${devTools}</div>`;
                container.innerHTML = html;
            }
        }

        // Projects
        setText('resProjectCount', projects.length);
        const projectsEl = document.getElementById('resProjectsList');
        if (projectsEl) {
            if (projects.length) {
                projectsEl.innerHTML = `
                    <div class="space-y-4">
                        ${projects.map(p => `
                            <div>
                                <div class="flex items-center justify-between text-xs font-bold text-gray-900">
                                    <span>${p.title || p.name}</span>
                                    <span class="font-mono text-[10px] text-gray-500">${p.status || 'Active'}</span>
                                </div>
                                ${(p.techStack || p.tech) ? `<div class="text-[11px] text-gray-600 italic mb-1">Technologies: ${p.techStack || p.tech}</div>` : ''}
                                ${p.description ? `<p class="text-xs text-gray-700 leading-relaxed">${p.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                projectsEl.innerHTML = `<p class="text-xs text-gray-500 italic">No projects listed. Add projects in the Project Tracker module.</p>`;
            }
        }

        // Work Experience
        if (profile.experience) {
            const sec = document.getElementById('resExpSection');
            if (sec) sec.classList.remove('hidden');
            setText('resExpText', profile.experience);
        }

        // Education
        if (profile.degree || profile.institution || profile.achievements || profile.certifications) {
            const sec = document.getElementById('resEduSection');
            if (sec) sec.classList.remove('hidden');
            const container = document.getElementById('resEduContainer');
            if (container) {
                container.innerHTML = `
                    ${(profile.degree || profile.institution) ? `
                        <div>
                            <div class="flex justify-between font-bold">
                                <span>${profile.degree || 'Degree'}</span>
                                <span>${profile.gradYear || ''}</span>
                            </div>
                            <div class="text-gray-600">${profile.institution || 'University'} ${profile.cgpa ? `(${profile.cgpa})` : ''}</div>
                            ${profile.coursework ? `<div class="text-[11px] text-gray-500 pt-0.5">Coursework: ${profile.coursework}</div>` : ''}
                        </div>
                    ` : ''}

                    ${profile.certifications ? `<div><strong>Certifications:</strong> ${profile.certifications}</div>` : ''}
                    ${profile.achievements ? `
                        <div class="pt-1">
                            <div class="font-bold text-gray-900">Key Achievements:</div>
                            <p class="text-xs text-gray-700 leading-relaxed whitespace-pre-line">${profile.achievements}</p>
                        </div>
                    ` : ''}
                `;
            }
        }

    }).catch(err => {
        clearTimeout(slowTimer);
        clearTimeout(softTimeoutTimer);
        console.error('Resume fetch ACTUAL ERROR object:', err);
        if (statusBox) statusBox.innerHTML = `<span class="text-amber-500">⚠️ Offline mode — ${err.message || err}</span>`;
    });

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el && text) el.innerText = text;
    }
}
