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
                        <div class="avatar-preview-box" id="avatarPreviewBox" role="button" tabindex="0" title="Click to view or edit profile photo">
                            <i class="fas fa-user text-3xl text-emerald-500"></i>
                            <div class="avatar-hover-overlay">
                                <i class="fas fa-camera text-base mb-1"></i>
                                <span class="text-[10px] font-mono leading-none">View / Edit</span>
                            </div>
                        </div>
                        <div>
                            <div class="profile-label">PROFILE PHOTO (CLICK PHOTO TO VIEW & ADJUST)</div>
                            <input type="file" id="photoFileInput" accept="image/*" class="hidden">
                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                <button type="button" id="uploadPhotoBtn" class="btn-secondary text-xs px-3.5 py-2">
                                    <i class="fas fa-cloud-upload-alt mr-1"></i> Choose Image
                                </button>
                                <button type="button" id="viewPhotoBtn" class="btn-secondary text-xs px-3.5 py-2">
                                    <i class="fas fa-expand mr-1"></i> View Photo
                                </button>
                            </div>
                            <div class="text-xs text-muted">Click the picture to preview full size, crop, zoom, and rotate your avatar before saving.</div>
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

        <!-- Avatar View / Lightbox Modal -->
        <div id="avatarViewModal" class="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md opacity-0 pointer-events-none transition-all duration-300">
            <div class="p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl border text-center relative space-y-4" style="background: var(--card); border-color: var(--border-strong);">
                <button type="button" id="closeAvatarViewBtn" class="absolute top-4 right-4 text-muted hover:text-white transition-colors text-lg" title="Close">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="flex items-center gap-2 justify-center text-emerald-400 font-mono text-xs">
                    <i class="fas fa-id-badge"></i>
                    <span class="uppercase tracking-wider">Profile Photo</span>
                </div>

                <div class="flex justify-center my-2">
                    <div id="avatarViewImageContainer" class="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl flex items-center justify-center bg-black/40">
                        <i class="fas fa-user text-5xl text-emerald-500/50"></i>
                    </div>
                </div>

                <div id="avatarViewMeta" class="text-xs text-muted font-mono">
                    Active profile picture
                </div>

                <div class="flex items-center justify-center gap-2 flex-wrap pt-2">
                    <button type="button" id="viewEditPhotoBtn" class="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 font-mono">
                        <i class="fas fa-crop-alt"></i> Adjust Photo
                    </button>
                    <button type="button" id="viewChangePhotoBtn" class="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 font-mono">
                        <i class="fas fa-upload"></i> Upload New
                    </button>
                    <button type="button" id="viewRemovePhotoBtn" class="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-mono text-red-400 hover:text-red-300">
                        <i class="fas fa-trash-alt"></i> Remove
                    </button>
                </div>
            </div>
        </div>

        <!-- Avatar Crop & Adjuster Modal -->
        <div id="avatarCropModal" class="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md opacity-0 pointer-events-none transition-all duration-300">
            <div class="p-5 sm:p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl border space-y-4 relative" style="background: var(--card); border-color: var(--border-strong);">
                <div class="flex items-center justify-between pb-2 border-b" style="border-color: var(--border);">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-crop-alt text-emerald-400"></i>
                        <h3 class="font-display font-bold text-base sm:text-lg" style="color: var(--fg);">Adjust Profile Photo</h3>
                    </div>
                    <button type="button" id="closeCropModalBtn" class="text-muted hover:text-white transition-colors" title="Cancel">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>

                <!-- Crop Canvas Viewport -->
                <div class="flex justify-center">
                    <div class="crop-canvas-viewport relative" id="cropCanvasViewport">
                        <canvas id="cropCanvas" width="320" height="320" class="block"></canvas>
                    </div>
                </div>

                <!-- Guidance note -->
                <div class="text-center font-mono text-[11px] text-muted flex items-center justify-center gap-3">
                    <span><i class="fas fa-arrows-alt text-emerald-500 mr-1"></i> Drag to pan</span>
                    <span><i class="fas fa-search-plus text-cyan-500 mr-1"></i> Scroll to zoom</span>
                </div>

                <!-- Controls: Zoom -->
                <div class="space-y-1">
                    <div class="flex items-center justify-between text-xs font-mono text-muted">
                        <span>Zoom</span>
                        <span id="zoomPercentLabel">100%</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button type="button" id="cropZoomOutBtn" class="crop-toolbar-btn px-2.5 py-1" title="Zoom Out"><i class="fas fa-minus"></i></button>
                        <input type="range" id="cropZoomRange" min="50" max="350" value="100" class="crop-slider flex-1">
                        <button type="button" id="cropZoomInBtn" class="crop-toolbar-btn px-2.5 py-1" title="Zoom In"><i class="fas fa-plus"></i></button>
                    </div>
                </div>

                <!-- Controls: Rotation, Flip, Shape, Reset Toolbar -->
                <div class="flex items-center justify-center gap-2 flex-wrap pt-1">
                    <button type="button" id="cropRotateCCWBtn" class="crop-toolbar-btn" title="Rotate 90° Counter-Clockwise">
                        <i class="fas fa-undo"></i> -90°
                    </button>
                    <button type="button" id="cropRotateCWBtn" class="crop-toolbar-btn" title="Rotate 90° Clockwise">
                        <i class="fas fa-redo"></i> +90°
                    </button>
                    <button type="button" id="cropFlipHBtn" class="crop-toolbar-btn" title="Flip Horizontally">
                        <i class="fas fa-arrows-alt-h"></i> Flip
                    </button>
                    <button type="button" id="cropShapeToggleBtn" class="crop-toolbar-btn" title="Toggle circular or rounded frame preview">
                        <i class="fas fa-circle" id="cropShapeIcon"></i> <span id="cropShapeLabel">Circle</span>
                    </button>
                    <button type="button" id="cropResetBtn" class="crop-toolbar-btn text-muted hover:text-amber-400" title="Reset adjustments">
                        <i class="fas fa-sync-alt"></i> Reset
                    </button>
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-end gap-3 pt-3 border-t" style="border-color: var(--border);">
                    <button type="button" id="cancelCropBtn" class="btn-secondary text-xs px-4 py-2">
                        Cancel
                    </button>
                    <button type="button" id="applyCropBtn" class="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 font-bold" style="background: #10b981; color: #fff;">
                        <i class="fas fa-check"></i> Apply Photo
                    </button>
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
                updatePreviewBox(data.photoUrl);
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

    function updatePreviewBox(url) {
        if (!previewBox) return;
        if (url) {
            previewBox.innerHTML = `
                <img src="${url}" class="w-full h-full object-cover" alt="Profile Photo">
                <div class="avatar-hover-overlay">
                    <i class="fas fa-camera text-base mb-1"></i>
                    <span class="text-[10px] font-mono leading-none">View / Edit</span>
                </div>
            `;
        } else {
            previewBox.innerHTML = `
                <i class="fas fa-user text-3xl text-emerald-500"></i>
                <div class="avatar-hover-overlay">
                    <i class="fas fa-upload text-base mb-1"></i>
                    <span class="text-[10px] font-mono leading-none">Upload</span>
                </div>
            `;
        }
    }

    // Avatar View Modal Elements
    const avatarViewModal = document.getElementById('avatarViewModal');
    const closeAvatarViewBtn = document.getElementById('closeAvatarViewBtn');
    const viewPhotoBtn = document.getElementById('viewPhotoBtn');
    const viewImageContainer = document.getElementById('avatarViewImageContainer');
    const viewMeta = document.getElementById('avatarViewMeta');
    const viewEditPhotoBtn = document.getElementById('viewEditPhotoBtn');
    const viewChangePhotoBtn = document.getElementById('viewChangePhotoBtn');
    const viewRemovePhotoBtn = document.getElementById('viewRemovePhotoBtn');

    function openAvatarViewModal() {
        if (!avatarViewModal) return;
        if (photoDataUrl) {
            if (viewImageContainer) {
                viewImageContainer.innerHTML = `<img src="${photoDataUrl}" class="w-full h-full object-cover" alt="Profile Photo">`;
            }
            if (viewMeta) {
                viewMeta.innerHTML = `<span class="text-emerald-400 font-mono"><i class="fas fa-check-circle mr-1"></i> Active profile photo</span>`;
            }
            if (viewEditPhotoBtn) viewEditPhotoBtn.classList.remove('hidden');
            if (viewRemovePhotoBtn) viewRemovePhotoBtn.classList.remove('hidden');
        } else {
            if (viewImageContainer) {
                viewImageContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center text-muted p-4">
                        <i class="fas fa-user-circle text-6xl text-emerald-500/40 mb-2"></i>
                        <span class="font-mono text-xs">No profile photo set</span>
                    </div>
                `;
            }
            if (viewMeta) {
                viewMeta.innerHTML = `<span class="text-muted font-mono">Upload a photo to personalize your profile</span>`;
            }
            if (viewEditPhotoBtn) viewEditPhotoBtn.classList.add('hidden');
            if (viewRemovePhotoBtn) viewRemovePhotoBtn.classList.add('hidden');
        }
        avatarViewModal.classList.remove('opacity-0', 'pointer-events-none');
    }

    function closeAvatarViewModal() {
        if (avatarViewModal) avatarViewModal.classList.add('opacity-0', 'pointer-events-none');
    }

    if (previewBox) {
        previewBox.addEventListener('click', openAvatarViewModal);
        previewBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openAvatarViewModal();
            }
        });
    }

    if (viewPhotoBtn) viewPhotoBtn.addEventListener('click', openAvatarViewModal);
    if (closeAvatarViewBtn) closeAvatarViewBtn.addEventListener('click', closeAvatarViewModal);
    if (avatarViewModal) {
        avatarViewModal.addEventListener('click', (e) => {
            if (e.target === avatarViewModal) closeAvatarViewModal();
        });
    }

    if (viewChangePhotoBtn && photoInput) {
        viewChangePhotoBtn.addEventListener('click', () => {
            closeAvatarViewModal();
            photoInput.click();
        });
    }

    if (viewRemovePhotoBtn) {
        viewRemovePhotoBtn.addEventListener('click', () => {
            photoDataUrl = '';
            if (photoInput) photoInput.value = '';
            updatePreviewBox('');
            closeAvatarViewModal();
            if (toast) {
                toast.innerHTML = '✓ Photo removed! Remember to save profile.';
                toast.style.opacity = '1';
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.innerHTML = '✓ Saved to Firestore';
                }, 3000);
            }
        });
    }

    // Avatar Cropper & Adjuster Engine
    const cropModal = document.getElementById('avatarCropModal');
    const closeCropModalBtn = document.getElementById('closeCropModalBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    const applyCropBtn = document.getElementById('applyCropBtn');
    const cropCanvas = document.getElementById('cropCanvas');
    const cropZoomRange = document.getElementById('cropZoomRange');
    const cropZoomInBtn = document.getElementById('cropZoomInBtn');
    const cropZoomOutBtn = document.getElementById('cropZoomOutBtn');
    const zoomPercentLabel = document.getElementById('zoomPercentLabel');
    const cropRotateCCWBtn = document.getElementById('cropRotateCCWBtn');
    const cropRotateCWBtn = document.getElementById('cropRotateCWBtn');
    const cropFlipHBtn = document.getElementById('cropFlipHBtn');
    const cropShapeToggleBtn = document.getElementById('cropShapeToggleBtn');
    const cropShapeIcon = document.getElementById('cropShapeIcon');
    const cropShapeLabel = document.getElementById('cropShapeLabel');
    const cropResetBtn = document.getElementById('cropResetBtn');

    let currentCropImg = null;
    let baseScale = 1;
    let cropScale = 1;
    let panX = 0;
    let panY = 0;
    let rotation = 0;
    let flipH = 1;
    let cropShape = 'circle';
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastTouchDist = 0;

    const CROP_BOX_SIZE = 280;

    function renderCropCanvas() {
        if (!cropCanvas || !currentCropImg) return;
        const ctx = cropCanvas.getContext('2d');
        const w = cropCanvas.width;
        const h = cropCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const cropX = (w - CROP_BOX_SIZE) / 2;
        const cropY = (h - CROP_BOX_SIZE) / 2;
        const cropRadius = CROP_BOX_SIZE / 2;

        ctx.clearRect(0, 0, w, h);

        // 1. Draw Image with Transformations
        ctx.save();
        ctx.translate(cx + panX, cy + panY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(cropScale * flipH, cropScale);
        ctx.drawImage(currentCropImg, -currentCropImg.width / 2, -currentCropImg.height / 2);
        ctx.restore();

        // 2. Draw Dark Overlay Outside Cutout
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        if (cropShape === 'circle') {
            ctx.arc(cx, cy, cropRadius, 0, Math.PI * 2, true);
        } else {
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(cropX, cropY, CROP_BOX_SIZE, CROP_BOX_SIZE, 20);
            } else {
                ctx.rect(cropX, cropY, CROP_BOX_SIZE, CROP_BOX_SIZE);
            }
        }
        ctx.fill('evenodd');

        // 3. Draw Crop Border
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (cropShape === 'circle') {
            ctx.arc(cx, cy, cropRadius, 0, Math.PI * 2);
        } else {
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(cropX, cropY, CROP_BOX_SIZE, CROP_BOX_SIZE, 20);
            } else {
                ctx.rect(cropX, cropY, CROP_BOX_SIZE, CROP_BOX_SIZE);
            }
        }
        ctx.stroke();

        // 4. Subtle Grid Lines (Rule of thirds)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        const third = CROP_BOX_SIZE / 3;
        ctx.beginPath();
        ctx.moveTo(cropX + third, cropY);
        ctx.lineTo(cropX + third, cropY + CROP_BOX_SIZE);
        ctx.moveTo(cropX + 2 * third, cropY);
        ctx.lineTo(cropX + 2 * third, cropY + CROP_BOX_SIZE);
        ctx.moveTo(cropX, cropY + third);
        ctx.lineTo(cropX + CROP_BOX_SIZE, cropY + third);
        ctx.moveTo(cropX, cropY + 2 * third);
        ctx.lineTo(cropX + CROP_BOX_SIZE, cropY + 2 * third);
        ctx.stroke();
        ctx.setLineDash([]);

        // 5. Center Target Crosshair
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy);
        ctx.lineTo(cx + 8, cy);
        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx, cy + 8);
        ctx.stroke();

        ctx.restore();
    }

    function initCropper(img) {
        currentCropImg = img;
        baseScale = Math.max(CROP_BOX_SIZE / img.width, CROP_BOX_SIZE / img.height);
        cropScale = baseScale;
        panX = 0;
        panY = 0;
        rotation = 0;
        flipH = 1;
        if (cropZoomRange) cropZoomRange.value = 100;
        if (zoomPercentLabel) zoomPercentLabel.textContent = '100%';
        if (cropModal) cropModal.classList.remove('opacity-0', 'pointer-events-none');
        renderCropCanvas();
    }

    function closeCropModal() {
        if (cropModal) cropModal.classList.add('opacity-0', 'pointer-events-none');
        if (photoInput) photoInput.value = '';
    }

    if (viewEditPhotoBtn) {
        viewEditPhotoBtn.addEventListener('click', () => {
            if (!photoDataUrl) return;
            const img = new Image();
            img.onload = () => {
                closeAvatarViewModal();
                initCropper(img);
            };
            img.src = photoDataUrl;
        });
    }

    // Handle Photo Upload Button & File Input -> Open Cropper Directly
    if (uploadBtn && photoInput) {
        uploadBtn.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        initCropper(img);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function updateZoom(val) {
        val = Math.min(350, Math.max(50, Math.round(val)));
        if (cropZoomRange) cropZoomRange.value = val;
        cropScale = baseScale * (val / 100);
        if (zoomPercentLabel) zoomPercentLabel.textContent = `${val}%`;
        renderCropCanvas();
    }

    if (cropZoomRange) {
        cropZoomRange.addEventListener('input', (e) => {
            updateZoom(Number(e.target.value));
        });
    }

    if (cropZoomInBtn) {
        cropZoomInBtn.addEventListener('click', () => {
            updateZoom(Number(cropZoomRange.value) + 15);
        });
    }

    if (cropZoomOutBtn) {
        cropZoomOutBtn.addEventListener('click', () => {
            updateZoom(Number(cropZoomRange.value) - 15);
        });
    }

    if (cropCanvas) {
        cropCanvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 10 : -10;
            updateZoom(Number(cropZoomRange.value) + delta);
        }, { passive: false });

        cropCanvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStartX = e.clientX - panX;
            dragStartY = e.clientY - panY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panX = e.clientX - dragStartX;
            panY = e.clientY - dragStartY;
            renderCropCanvas();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch Drag & Pinch Zoom support
        cropCanvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                dragStartX = e.touches[0].clientX - panX;
                dragStartY = e.touches[0].clientY - panY;
            } else if (e.touches.length === 2) {
                isDragging = false;
                lastTouchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        }, { passive: false });

        cropCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (isDragging && e.touches.length === 1) {
                panX = e.touches[0].clientX - dragStartX;
                panY = e.touches[0].clientY - dragStartY;
                renderCropCanvas();
            } else if (e.touches.length === 2 && lastTouchDist > 0) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const factor = dist / lastTouchDist;
                let newVal = Number(cropZoomRange.value) * factor;
                updateZoom(newVal);
                lastTouchDist = dist;
            }
        }, { passive: false });

        cropCanvas.addEventListener('touchend', () => {
            isDragging = false;
            lastTouchDist = 0;
        });
    }

    if (cropRotateCWBtn) {
        cropRotateCWBtn.addEventListener('click', () => {
            rotation = (rotation + 90) % 360;
            renderCropCanvas();
        });
    }

    if (cropRotateCCWBtn) {
        cropRotateCCWBtn.addEventListener('click', () => {
            rotation = (rotation - 90 + 360) % 360;
            renderCropCanvas();
        });
    }

    if (cropFlipHBtn) {
        cropFlipHBtn.addEventListener('click', () => {
            flipH = -flipH;
            renderCropCanvas();
        });
    }

    if (cropShapeToggleBtn) {
        cropShapeToggleBtn.addEventListener('click', () => {
            cropShape = cropShape === 'circle' ? 'square' : 'circle';
            if (cropShapeIcon) {
                cropShapeIcon.className = cropShape === 'circle' ? 'fas fa-circle' : 'fas fa-square';
            }
            if (cropShapeLabel) {
                cropShapeLabel.textContent = cropShape === 'circle' ? 'Circle' : 'Square';
            }
            renderCropCanvas();
        });
    }

    if (cropResetBtn) {
        cropResetBtn.addEventListener('click', () => {
            panX = 0;
            panY = 0;
            rotation = 0;
            flipH = 1;
            updateZoom(100);
        });
    }

    if (closeCropModalBtn) closeCropModalBtn.addEventListener('click', closeCropModal);
    if (cancelCropBtn) cancelCropBtn.addEventListener('click', closeCropModal);
    if (cropModal) {
        cropModal.addEventListener('click', (e) => {
            if (e.target === cropModal) closeCropModal();
        });
    }

    // Apply & Save Cropped Image
    if (applyCropBtn) {
        applyCropBtn.addEventListener('click', () => {
            if (!currentCropImg) return;
            const exportSize = 600;
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = exportSize;
            exportCanvas.height = exportSize;
            const expCtx = exportCanvas.getContext('2d');

            const ratio = exportSize / CROP_BOX_SIZE;

            expCtx.save();
            expCtx.fillStyle = '#ffffff';
            expCtx.fillRect(0, 0, exportSize, exportSize);

            expCtx.translate(exportSize / 2 + panX * ratio, exportSize / 2 + panY * ratio);
            expCtx.rotate((rotation * Math.PI) / 180);
            expCtx.scale(cropScale * flipH * ratio, cropScale * ratio);
            expCtx.drawImage(currentCropImg, -currentCropImg.width / 2, -currentCropImg.height / 2);
            expCtx.restore();

            photoDataUrl = exportCanvas.toDataURL('image/jpeg', 0.9);
            updatePreviewBox(photoDataUrl);
            closeCropModal();
            closeAvatarViewModal();

            if (toast) {
                toast.innerHTML = '✓ Photo adjusted & applied! Remember to save profile.';
                toast.style.opacity = '1';
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.innerHTML = '✓ Saved to Firestore';
                }, 4000);
            }
        });
    }

    // Global Esc Key handler for modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCropModal();
            closeAvatarViewModal();
            if (resetModalOverlay) resetModalOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
    });

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
            updatePreviewBox('');
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
