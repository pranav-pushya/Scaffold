// === DEVELOPER PROFILE & CAREER RECORD PAGE ===
// Comprehensive controlled profile form matching PBE-I specification with non-blocking initial rendering

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProfile, saveProfile, fetchWithTimeout } from '../../../firebase/firestoreService.js';

export function renderProfilePage() {
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
                
                <!-- Async Loading / Connection Error Status Indicator -->
                <div id="profileDataStatus" class="mt-4 p-3 rounded-lg border font-mono text-xs hidden" style="background: var(--card); border-color: var(--border);">
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
                            <i class="fas fa-user text-3xl text-emerald-500"></i>
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
                            <input type="text" id="profFullName" class="profile-input" placeholder="e.g. Alex Mercer" required>
                        </div>
                        <div>
                            <label class="profile-label">PROFESSIONAL EMAIL</label>
                            <input type="email" id="profEmail" class="profile-input" placeholder="e.g. alex.mercer@dev.io">
                        </div>
                        <div>
                            <label class="profile-label">PHONE NUMBER</label>
                            <input type="text" id="profPhone" class="profile-input" placeholder="e.g. +1 (555) 234-5678">
                        </div>
                        <div>
                            <label class="profile-label">LOCATION (CITY, COUNTRY)</label>
                            <input type="text" id="profLocation" class="profile-input" placeholder="e.g. San Francisco, CA">
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
                            <input type="text" id="profTagline" class="profile-input" placeholder="e.g. Full-Stack Engineer specializing in React & Node">
                        </div>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="profile-label">TARGET CAREER ROLE *</label>
                                <input type="text" id="profTargetRole" class="profile-input" placeholder="e.g. Frontend Developer" required>
                            </div>
                            <div>
                                <label class="profile-label">EXPERIENCE LEVEL</label>
                                <select id="profExpLevel" class="profile-select">
                                    <option value="Beginner / Student">Beginner / Student</option>
                                    <option value="Junior (1-2 yrs)">Junior (1-2 yrs)</option>
                                    <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                                    <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="profile-label">JOB HUNT STATUS</label>
                            <select id="profJobStatus" class="profile-select max-w-md">
                                <option value="Actively Looking for Roles">Actively Looking for Roles</option>
                                <option value="Open to Opportunities">Open to Opportunities</option>
                                <option value="Not Looking">Not Looking</option>
                            </select>
                        </div>

                        <div>
                            <label class="profile-label">PROFESSIONAL BIO / EXECUTIVE SUMMARY</label>
                            <textarea id="profBio" class="profile-input h-28" placeholder="Brief narrative highlighting your engineering passions, accomplishments, and core strengths..."></textarea>
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
                            <input type="url" id="profGithubUrl" class="profile-input" placeholder="https://github.com/username">
                        </div>
                        <div>
                            <label class="profile-label">LINKEDIN PROFILE URL</label>
                            <input type="url" id="profLinkedinUrl" class="profile-input" placeholder="https://linkedin.com/in/username">
                        </div>
                        <div>
                            <label class="profile-label">PERSONAL WEBSITE / BLOG</label>
                            <input type="url" id="profWebsiteUrl" class="profile-input" placeholder="https://myportfolio.dev">
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
                            <input type="text" id="profCoreLanguages" class="profile-input" placeholder="e.g. JavaScript, TypeScript, Python, HTML5, CSS3, SQL">
                        </div>
                        <div>
                            <label class="profile-label">FRAMEWORKS, LIBRARIES & DATABASES (COMMA SEPARATED)</label>
                            <input type="text" id="profFrameworks" class="profile-input" placeholder="e.g. React, Next.js, Node.js, Express, Tailwind CSS, PostgreSQL">
                        </div>
                        <div>
                            <label class="profile-label">DEVELOPER TOOLS, PLATFORMS & DEVOPS (COMMA SEPARATED)</label>
                            <input type="text" id="profDevTools" class="profile-input" placeholder="e.g. Git, Docker, Vite, VS Code, Figma, Vercel, AWS">
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
                                <input type="text" id="profDegree" class="profile-input" placeholder="e.g. B.S. in Computer Science">
                            </div>
                            <div>
                                <label class="profile-label">INSTITUTION / UNIVERSITY</label>
                                <input type="text" id="profInstitution" class="profile-input" placeholder="e.g. Stanford University">
                            </div>
                            <div>
                                <label class="profile-label">GRADUATION YEAR</label>
                                <input type="text" id="profGradYear" class="profile-input" placeholder="e.g. 2025">
                            </div>
                        </div>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="profile-label">CGPA / MARKS</label>
                                <input type="text" id="profCgpa" class="profile-input" placeholder="e.g. 3.8 / 4.0 or 8.9 CGPA">
                            </div>
                            <div>
                                <label class="profile-label">RELEVANT COURSEWORK (COMMA SEPARATED)</label>
                                <input type="text" id="profCoursework" class="profile-input" placeholder="e.g. Data Structures, Algorithms, Web Develop...">
                            </div>
                        </div>

                        <div>
                            <label class="profile-label">CERTIFICATIONS</label>
                            <input type="text" id="profCertifications" class="profile-input" placeholder="e.g. AWS Certified Developer, Meta Frontend Professional Certificate">
                        </div>

                        <div>
                            <label class="profile-label">KEY ACHIEVEMENTS & HONORS (ONE PER LINE)</label>
                            <textarea id="profAchievements" class="profile-input h-24" placeholder="e.g. Hackathon Winner — 1st Place out of 200 teams&#10;Deans List Honor Student 2024"></textarea>
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
                        <textarea id="profExperience" class="profile-input h-28" placeholder="Summarize key internships, contract work, freelance projects, or full-time roles..."></textarea>
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
    const statusBox = document.getElementById('profileDataStatus');
    
    const resetModalOverlay = document.getElementById('resetModalOverlay');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    const user = getCurrentAuthUser() || { uid: 'demo' };
    let photoDataUrl = '';

    // Asynchronously fetch profile data AFTER page skeleton has rendered into the DOM
    if (statusBox) {
        statusBox.classList.remove('hidden');
        statusBox.innerHTML = `<span class="text-emerald-500"><i class="fas fa-circle-notch fa-spin mr-1"></i> Syncing profile data from Firestore...</span>`;
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
            statusBox.innerHTML = `<span class="text-amber-400"><i class="fas fa-circle-notch fa-spin mr-1"></i> Still establishing Firestore connection... You can fill out and save profile info in the meantime.</span>`;
        }
    }, 20000);

    // Fetch data safely with 20s timeout margin
    fetchWithTimeout(getProfile(user.uid), 20000)
        .then((data) => {
            clearTimeout(slowTimer);
            clearTimeout(softTimeoutTimer);
            if (!data) data = {};

            // Clear/hide status banner as soon as real data is in hand
            if (statusBox) statusBox.classList.add('hidden');

            if (data.photoUrl) {
                photoDataUrl = data.photoUrl;
                if (previewBox) previewBox.innerHTML = `<img src="${data.photoUrl}" class="w-full h-full object-cover" alt="Profile Photo">`;
            }

            setVal('profFullName', data.fullName);
            setVal('profEmail', data.email);
            setVal('profPhone', data.phone);
            setVal('profLocation', data.location);
            setVal('profTagline', data.tagline);
            setVal('profTargetRole', data.targetRole);
            setVal('profExpLevel', data.expLevel || 'Beginner / Student');
            setVal('profJobStatus', data.jobStatus || 'Actively Looking for Roles');
            setVal('profBio', data.bio);
            setVal('profGithubUrl', data.githubUrl);
            setVal('profLinkedinUrl', data.linkedinUrl);
            setVal('profWebsiteUrl', data.websiteUrl);
            setVal('profCoreLanguages', data.coreLanguages);
            setVal('profFrameworks', data.frameworks);
            setVal('profDevTools', data.devTools);
            setVal('profDegree', data.degree);
            setVal('profInstitution', data.institution);
            setVal('profGradYear', data.gradYear);
            setVal('profCgpa', data.cgpa);
            setVal('profCoursework', data.coursework);
            setVal('profCertifications', data.certifications);
            setVal('profAchievements', data.achievements);
            setVal('profExperience', data.experience);
        })
        .catch((err) => {
            clearTimeout(slowTimer);
            clearTimeout(softTimeoutTimer);
            console.error('Profile fetch ACTUAL REJECTION:', err);
            // Only show hard error if real data was not loaded and promise rejected
            if (statusBox) {
                statusBox.classList.remove('hidden');
                statusBox.innerHTML = `<span class="text-amber-400">⚠️ Firestore connection notice — ${err.message || err}. You can still enter and save profile info.</span>`;
            }
        });

    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) {
            el.value = val;
        }
    }

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
