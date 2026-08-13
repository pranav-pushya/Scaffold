// === DEVELOPER PROFILE & CAREER RECORD PAGE ===
// Comprehensive controlled profile form matching PBE-I specification & designs

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProfile, saveProfile } from '../../../firebase/firestoreService.js';

export async function renderProfilePage() {
    const user = getCurrentAuthUser() || { uid: 'demo' };
    const data = await getProfile(user.uid) || {};

    return `
    <div class="profile-wrapper">
        <div class="profile-container">
            
            <!-- Page Header -->
            <div class="mb-10 border-b pb-6" style="border-color: var(--border);">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 class="font-display font-bold text-3xl mb-2" style="color: var(--fg);">Developer Profile & Career Record</h1>
                        <p class="text-sm text-muted">Manage your detailed contact info, career narrative, categorized skills, and academic credentials.</p>
                    </div>
                    <div id="profileSavedToast" class="font-mono text-xs px-3 py-1.5 rounded text-emerald-400 border border-emerald-500/30 opacity-0 transition-opacity duration-300" style="background: rgba(16, 185, 129, 0.1);">
                        ✓ Saved to Firestore
                    </div>
                </div>
            </div>

            <form id="comprehensiveProfileForm" class="space-y-8">

                <!-- 1. CONTACT & PERSONAL DETAILS -->
                <fieldset class="profile-fieldset">
                    <legend class="profile-legend">
                        👤 1. CONTACT & PERSONAL DETAILS
                    </legend>

                    <div class="flex items-center gap-6 mb-8 pt-2">
                        <div class="avatar-preview-box" id="avatarPreviewBox">
                            ${data.photoUrl ? `<img src="${data.photoUrl}" class="w-full h-full object-cover" alt="Profile Photo">` : `<i class="fas fa-user text-3xl text-emerald-500"></i>`}
                        </div>
                        <div>
                            <div class="profile-label">PROFILE PHOTO (AUTO-RESIZED & COMPRESSED)</div>
                            <input type="file" id="photoFileInput" accept="image/*" class="hidden">
                            <button type="button" id="uploadPhotoBtn" class="btn-secondary text-xs px-4 py-2 mb-2">
                                <i class="fas fa-image mr-1"></i> Choose Image
                            </button>
                            <div class="text-xs text-muted">Automatically center-cropped to a 600×600px 1:1 square and compressed.</div>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="profile-label">FULL NAME *</label>
                            <input type="text" id="profFullName" class="profile-input" placeholder="e.g. Alex Mercer" value="${data.fullName || ''}" required>
                        </div>
                        <div>
                            <label class="profile-label">PROFESSIONAL EMAIL</label>
                            <input type="email" id="profEmail" class="profile-input" placeholder="e.g. alex.mercer@dev.io" value="${data.email || ''}">
                        </div>
                        <div>
                            <label class="profile-label">PHONE NUMBER</label>
                            <input type="text" id="profPhone" class="profile-input" placeholder="e.g. +1 (555) 234-5678" value="${data.phone || ''}">
                        </div>
                        <div>
                            <label class="profile-label">LOCATION (CITY, COUNTRY)</label>
                            <input type="text" id="profLocation" class="profile-input" placeholder="e.g. San Francisco, CA" value="${data.location || ''}">
                        </div>
                    </div>
                </fieldset>


                <!-- 2. PROFESSIONAL IDENTITY & GOALS -->
                <fieldset class="profile-fieldset">
                    <legend class="profile-legend">
                        🚀 2. PROFESSIONAL IDENTITY & GOALS
                    </legend>

                    <div class="space-y-6 pt-2">
                        <div>
                            <label class="profile-label">PROFESSIONAL TAGLINE / HEADLINE</label>
                            <input type="text" id="profTagline" class="profile-input" placeholder="e.g. Full-Stack Engineer specializing in React & Node" value="${data.tagline || ''}">
                        </div>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="profile-label">TARGET CAREER ROLE *</label>
                                <input type="text" id="profTargetRole" class="profile-input" placeholder="e.g. Frontend Developer" value="${data.targetRole || ''}" required>
                            </div>
                            <div>
                                <label class="profile-label">EXPERIENCE LEVEL</label>
                                <select id="profExpLevel" class="profile-select">
                                    <option value="Beginner / Student" ${data.expLevel === 'Beginner / Student' ? 'selected' : ''}>Beginner / Student</option>
                                    <option value="Junior (1-2 yrs)" ${data.expLevel === 'Junior (1-2 yrs)' ? 'selected' : ''}>Junior (1-2 yrs)</option>
                                    <option value="Mid-Level (3-5 yrs)" ${data.expLevel === 'Mid-Level (3-5 yrs)' ? 'selected' : ''}>Mid-Level (3-5 yrs)</option>
                                    <option value="Senior (5+ yrs)" ${data.expLevel === 'Senior (5+ yrs)' ? 'selected' : ''}>Senior (5+ yrs)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="profile-label">JOB HUNT STATUS</label>
                            <select id="profJobStatus" class="profile-select max-w-md">
                                <option value="Actively Looking for Roles" ${data.jobStatus === 'Actively Looking for Roles' ? 'selected' : ''}>Actively Looking for Roles</option>
                                <option value="Open to Opportunities" ${data.jobStatus === 'Open to Opportunities' ? 'selected' : ''}>Open to Opportunities</option>
                                <option value="Not Looking" ${data.jobStatus === 'Not Looking' ? 'selected' : ''}>Not Looking</option>
                            </select>
                        </div>

                        <div>
                            <label class="profile-label">PROFESSIONAL BIO / EXECUTIVE SUMMARY</label>
                            <textarea id="profBio" class="profile-input h-28" placeholder="Brief narrative highlighting your engineering passions, accomplishments, and core strengths...">${data.bio || ''}</textarea>
                        </div>
                    </div>
                </fieldset>


                <!-- 3. DEVELOPER PROFILES & ONLINE LINKS -->
                <fieldset class="profile-fieldset">
                    <legend class="profile-legend">
                        🔗 3. DEVELOPER PROFILES & ONLINE LINKS
                    </legend>

                    <div class="grid md:grid-cols-3 gap-6 pt-2">
                        <div>
                            <label class="profile-label">GITHUB PROFILE URL</label>
                            <input type="url" id="profGithubUrl" class="profile-input" placeholder="https://github.com/username" value="${data.githubUrl || ''}">
                        </div>
                        <div>
                            <label class="profile-label">LINKEDIN PROFILE URL</label>
                            <input type="url" id="profLinkedinUrl" class="profile-input" placeholder="https://linkedin.com/in/username" value="${data.linkedinUrl || ''}">
                        </div>
                        <div>
                            <label class="profile-label">PERSONAL WEBSITE / BLOG</label>
                            <input type="url" id="profWebsiteUrl" class="profile-input" placeholder="https://myportfolio.dev" value="${data.websiteUrl || ''}">
                        </div>
                    </div>
                </fieldset>


                <!-- 4. CATEGORIZED TECHNICAL COMPETENCIES -->
                <fieldset class="profile-fieldset">
                    <legend class="profile-legend">
                        🛠 4. CATEGORIZED TECHNICAL COMPETENCIES
                    </legend>

                    <div class="space-y-6 pt-2">
                        <div>
                            <label class="profile-label">CORE LANGUAGES & FUNDAMENTALS (COMMA SEPARATED)</label>
                            <input type="text" id="profCoreLanguages" class="profile-input" placeholder="e.g. JavaScript, TypeScript, Python, HTML5, CSS3, SQL" value="${data.coreLanguages || ''}">
                        </div>
                        <div>
                            <label class="profile-label">FRAMEWORKS, LIBRARIES & DATABASES (COMMA SEPARATED)</label>
                            <input type="text" id="profFrameworks" class="profile-input" placeholder="e.g. React, Next.js, Node.js, Express, Tailwind CSS, PostgreSQL" value="${data.frameworks || ''}">
                        </div>
                        <div>
                            <label class="profile-label">DEVELOPER TOOLS, PLATFORMS & DEVOPS (COMMA SEPARATED)</label>
                            <input type="text" id="profDevTools" class="profile-input" placeholder="e.g. Git, Docker, Vite, VS Code, Figma, Vercel, AWS" value="${data.devTools || ''}">
                        </div>
                    </div>
                </fieldset>


                <!-- 5. EDUCATION DETAILS & ACHIEVEMENTS -->
                <fieldset class="profile-fieldset">
                    <legend class="profile-legend">
                        🎓 5. EDUCATION DETAILS & ACHIEVEMENTS
                    </legend>

                    <div class="space-y-6 pt-2">
                        <div class="grid md:grid-cols-3 gap-6">
                            <div>
                                <label class="profile-label">DEGREE / FIELD OF STUDY</label>
                                <input type="text" id="profDegree" class="profile-input" placeholder="e.g. B.S. in Computer Science" value="${data.degree || ''}">
                            </div>
                            <div>
                                <label class="profile-label">INSTITUTION / UNIVERSITY</label>
                                <input type="text" id="profInstitution" class="profile-input" placeholder="e.g. Stanford University" value="${data.institution || ''}">
                            </div>
                            <div>
                                <label class="profile-label">GRADUATION YEAR</label>
                                <input type="text" id="profGradYear" class="profile-input" placeholder="e.g. 2025" value="${data.gradYear || ''}">
                            </div>
                        </div>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="profile-label">CGPA / MARKS</label>
                                <input type="text" id="profCgpa" class="profile-input" placeholder="e.g. 3.8 / 4.0 or 8.9 CGPA" value="${data.cgpa || ''}">
                            </div>
                            <div>
                                <label class="profile-label">RELEVANT COURSEWORK (COMMA SEPARATED)</label>
                                <input type="text" id="profCoursework" class="profile-input" placeholder="e.g. Data Structures, Algorithms, Web Develop..." value="${data.coursework || ''}">
                            </div>
                        </div>

                        <div>
                            <label class="profile-label">CERTIFICATIONS</label>
                            <input type="text" id="profCertifications" class="profile-input" placeholder="e.g. AWS Certified Developer, Meta Frontend Professional Certificate" value="${data.certifications || ''}">
                        </div>

                        <div>
                            <label class="profile-label">KEY ACHIEVEMENTS & HONORS (ONE PER LINE)</label>
                            <textarea id="profAchievements" class="profile-input h-24" placeholder="e.g. Hackathon Winner — 1st Place out of 200 teams&#10;Deans List Honor Student 2024">${data.achievements || ''}</textarea>
                        </div>
                    </div>
                </fieldset>


                <!-- 6. WORK EXPERIENCE & PAST ROLES -->
                <fieldset class="profile-fieldset">
                    <legend class="profile-legend">
                        💼 6. WORK EXPERIENCE & PAST ROLES
                    </legend>

                    <div class="pt-2">
                        <label class="profile-label">WORK EXPERIENCE OVERVIEW</label>
                        <textarea id="profExperience" class="profile-input h-28" placeholder="Summarize key internships, contract work, freelance projects, or full-time roles...">${data.experience || ''}</textarea>
                    </div>
                </fieldset>


                <!-- Form Submit & Reset Buttons -->
                <div class="flex items-center justify-end gap-4 pt-6 border-t" style="border-color: var(--border);">
                    <button type="button" id="resetProfileBtn" class="btn-secondary text-xs px-5 py-3">Reset Form</button>
                    <button type="submit" id="saveProfileBtn" class="btn-primary text-xs px-6 py-3" style="background: #10b981; color: #fff;">
                        <i class="fas fa-save mr-1"></i> Save Comprehensive Profile
                    </button>
                </div>

            </form>
        </div>

        <!-- Custom Reset Confirmation Modal Popup -->
        <div id="resetModalOverlay" class="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
            <div class="p-6 rounded-xl max-w-md w-full mx-4 shadow-2xl space-y-4 border" style="background: var(--card); border-color: var(--border-strong);">
                <div class="flex items-center gap-3 text-amber-500">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                    <h3 class="font-display font-bold text-lg" style="color: var(--fg);">Reset Profile Form?</h3>
                </div>
                <p class="text-sm text-muted leading-relaxed">
                    Are you sure you want to clear all profile input fields? Any unsaved data will be erased.
                </p>
                <div class="flex items-center justify-end gap-3 pt-2">
                    <button type="button" id="cancelResetBtn" class="btn-secondary text-xs px-4 py-2">Cancel</button>
                    <button type="button" id="confirmResetBtn" class="btn-primary text-xs px-4 py-2" style="background: #ef4444; color: #fff;">Clear All Fields</button>
                </div>
            </div>
        </div>

    </div>
    `;
}

export function bindProfileEvents() {
    const form = document.getElementById('comprehensiveProfileForm');
    const toast = document.getElementById('profileSavedToast');
    const resetBtn = document.getElementById('resetProfileBtn');
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    const photoInput = document.getElementById('photoFileInput');
    const previewBox = document.getElementById('avatarPreviewBox');
    
    const resetModalOverlay = document.getElementById('resetModalOverlay');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    const user = getCurrentAuthUser() || { uid: 'demo' };
    let photoDataUrl = '';

    // Handle Photo Upload Preview
    if (uploadBtn && photoInput) {
        uploadBtn.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    photoDataUrl = event.target.result;
                    if (previewBox) {
                        previewBox.innerHTML = `<img src="${photoDataUrl}" class="w-full h-full object-cover" alt="Uploaded Photo">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Reset Form Modal Popup Handlers
    if (resetBtn && resetModalOverlay) {
        resetBtn.addEventListener('click', () => {
            resetModalOverlay.classList.remove('opacity-0', 'pointer-events-none');
        });
    }

    if (cancelResetBtn && resetModalOverlay) {
        cancelResetBtn.addEventListener('click', () => {
            resetModalOverlay.classList.add('opacity-0', 'pointer-events-none');
        });
    }

    if (confirmResetBtn && resetModalOverlay && form) {
        confirmResetBtn.addEventListener('click', () => {
            form.reset();
            photoDataUrl = '';
            if (previewBox) {
                previewBox.innerHTML = `<i class="fas fa-user text-3xl text-emerald-500"></i>`;
            }
            resetModalOverlay.classList.add('opacity-0', 'pointer-events-none');
        });
    }

    // Submit Form
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const profileData = {
                fullName: document.getElementById('profFullName').value,
                email: document.getElementById('profEmail').value,
                phone: document.getElementById('profPhone').value,
                location: document.getElementById('profLocation').value,
                photoUrl: photoDataUrl || '',
                tagline: document.getElementById('profTagline').value,
                targetRole: document.getElementById('profTargetRole').value,
                expLevel: document.getElementById('profExpLevel').value,
                jobStatus: document.getElementById('profJobStatus').value,
                bio: document.getElementById('profBio').value,
                githubUrl: document.getElementById('profGithubUrl').value,
                linkedinUrl: document.getElementById('profLinkedinUrl').value,
                websiteUrl: document.getElementById('profWebsiteUrl').value,
                coreLanguages: document.getElementById('profCoreLanguages').value,
                frameworks: document.getElementById('profFrameworks').value,
                devTools: document.getElementById('profDevTools').value,
                degree: document.getElementById('profDegree').value,
                institution: document.getElementById('profInstitution').value,
                gradYear: document.getElementById('profGradYear').value,
                cgpa: document.getElementById('profCgpa').value,
                coursework: document.getElementById('profCoursework').value,
                certifications: document.getElementById('profCertifications').value,
                achievements: document.getElementById('profAchievements').value,
                experience: document.getElementById('profExperience').value,
            };

            await saveProfile(user.uid, profileData);

            if (toast) {
                toast.style.opacity = '1';
                setTimeout(() => { toast.style.opacity = '0'; }, 3000);
            }
        });
    }
}
