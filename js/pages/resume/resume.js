// === ATS RESUME EXPORTER PAGE ===
// Dynamic ATS-formatted resume auto-generated from Profile OS data and Tracker projects

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProfile, getProjects } from '../../../firebase/firestoreService.js';

export async function renderResumePage() {
    const user = getCurrentAuthUser() || { uid: 'demo' };
    const profile = await getProfile(user.uid) || {};
    const projects = await getProjects(user.uid) || [];

    const fullName = profile.fullName || user.displayName || 'Developer Name';
    const targetRole = profile.targetRole || 'Software Engineer';
    const email = profile.email || user.email || '';
    const phone = profile.phone || '';
    const location = profile.location || '';

    const coreLangs = profile.coreLanguages || '';
    const frameworks = profile.frameworks || '';
    const devTools = profile.devTools || '';

    return `
    <div class="resume-wrapper">
        <div class="resume-container space-y-6">

            <!-- Print & Action Controls -->
            <div class="no-print flex items-center justify-end gap-3 p-4 rounded-xl border" style="background: var(--card); border-color: var(--border-strong);">
                <a href="#profile" class="btn-secondary text-xs px-3 py-2">
                    <i class="fas fa-edit mr-1"></i> Edit Data
                </a>
                <button id="printResumeBtn" class="btn-primary text-xs px-5 py-2" style="background: #10b981; color: #fff;">
                    <i class="fas fa-print mr-1"></i> Print / Save as PDF
                </button>
            </div>

            <!-- Classic Clean ATS Resume Sheet -->
            <div class="resume-sheet space-y-6">
                
                <!-- Resume Header -->
                <div class="border-b pb-4" style="border-color: #e5e7eb;">
                    <h1 class="resume-header-name">${fullName}</h1>
                    <div class="resume-header-role">${targetRole}</div>
                    
                    <div class="flex flex-wrap gap-4 text-xs text-gray-600 mt-3 font-mono">
                        ${email ? `<span>📧 ${email}</span>` : ''}
                        ${phone ? `<span>📱 ${phone}</span>` : ''}
                        ${location ? `<span>📍 ${location}</span>` : ''}
                        ${profile.githubUrl ? `<span>🔗 ${profile.githubUrl.replace('https://', '')}</span>` : ''}
                        ${profile.linkedinUrl ? `<span>🔗 ${profile.linkedinUrl.replace('https://', '')}</span>` : ''}
                        ${profile.websiteUrl ? `<span>🌐 ${profile.websiteUrl.replace('https://', '')}</span>` : ''}
                    </div>
                </div>

                <!-- Executive Summary -->
                ${profile.bio ? `
                    <div>
                        <h2 class="resume-section-title">Professional Summary</h2>
                        <p class="text-xs text-gray-700 leading-relaxed whitespace-pre-line">${profile.bio}</p>
                    </div>
                ` : ''}

                <!-- Technical Skills -->
                ${(coreLangs || frameworks || devTools) ? `
                    <div>
                        <h2 class="resume-section-title">Technical Skills</h2>
                        <div class="space-y-1 text-xs text-gray-800 font-mono">
                            ${coreLangs ? `<div><strong>Languages:</strong> ${coreLangs}</div>` : ''}
                            ${frameworks ? `<div><strong>Frameworks & Databases:</strong> ${frameworks}</div>` : ''}
                            ${devTools ? `<div><strong>Tools & Platforms:</strong> ${devTools}</div>` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Projects (Pulling Live from Tracker) -->
                <div>
                    <h2 class="resume-section-title">Technical Projects (${projects.length})</h2>
                    ${projects.length ? `
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
                    ` : `
                        <p class="text-xs text-gray-500 italic">No projects listed. Add projects in the Project Tracker module.</p>
                    `}
                </div>

                <!-- Work Experience -->
                ${profile.experience ? `
                    <div>
                        <h2 class="resume-section-title">Work Experience</h2>
                        <p class="text-xs text-gray-700 leading-relaxed whitespace-pre-line">${profile.experience}</p>
                    </div>
                ` : ''}

                <!-- Education & Credentials -->
                ${(profile.degree || profile.institution || profile.achievements || profile.certifications) ? `
                    <div>
                        <h2 class="resume-section-title">Education & Achievements</h2>
                        <div class="text-xs text-gray-800 space-y-2 font-mono">
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
                        </div>
                    </div>
                ` : ''}

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
}
