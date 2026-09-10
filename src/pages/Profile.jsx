import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile } from '../hooks/useProfile.js';
import { saveProfile } from '../firebase/firestoreService.js';
import './profile.css';

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  photoUrl: '',
  tagline: '',
  targetRole: '',
  expLevel: 'Beginner / Student',
  jobStatus: 'Actively Looking for Roles',
  bio: '',
  githubUrl: '',
  linkedinUrl: '',
  websiteUrl: '',
  coreLanguages: '',
  frameworks: '',
  devTools: '',
  degree: '',
  institution: '',
  gradYear: '',
  cgpa: '',
  coursework: '',
  certifications: '',
  achievements: '',
  experience: ''
};

export default function Profile() {
  const { currentUser } = useAuth();
  const { profile, loadProfile, saveProfileData } = useProfile();

  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState('✓ Saved to Firestore');
  const [showToast, setShowToast] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const fileInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Trigger toast with auto-hide
  const triggerToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 1. Fetch profile on mount / login
  useEffect(() => {
    const userId = currentUser?.uid;
    if (!userId) return;

    setStatusMessage({ type: 'loading', text: 'Syncing profile data from Firestore...' });

    const slowTimer = setTimeout(() => {
      setStatusMessage({ type: 'warning', text: 'Still loading, this may take a moment on slow connections...' });
    }, 3000);

    loadProfile(userId)
      .then((data) => {
        clearTimeout(slowTimer);
        setStatusMessage(null);
        if (data && Object.keys(data).length > 0) {
          setFormData((prev) => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch((err) => {
        clearTimeout(slowTimer);
        console.error('Profile fetch error:', err);
        setStatusMessage({
          type: 'warning',
          text: `⚠️ Firestore connection notice — ${err.message || err}. You can still enter and save profile info.`
        });
      });

    return () => {
      clearTimeout(slowTimer);
    };
  }, [currentUser?.uid, loadProfile]);

  // Sync with context profile updates
  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...profile
      }));
    }
  }, [profile]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
        triggerToast('✓ Photo updated! Remember to save profile.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Photo removal
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowAvatarModal(false);
    triggerToast('✓ Photo removed! Remember to save profile.');
  };

  // Reset form handler
  const handleConfirmReset = () => {
    setFormData(initialFormState);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowResetModal(false);
    triggerToast('Form reset. Remember to save to persist changes.');
  };

  // Form submit handler writing to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = currentUser?.uid;

    if (!userId) {
      alert('You must be logged in to save your profile.');
      return;
    }

    setIsSaving(true);
    try {
      // Save via firestoreService saveProfile and sync to ProfileContext
      await saveProfile(userId, formData);
      await saveProfileData(userId, formData);
      triggerToast('✓ Saved to Firestore');
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert(`Error saving profile: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        {/* Page Header */}
        <div className="mb-10 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--fg)' }}>
                Developer Profile &amp; Career Record
              </h1>
              <p className="text-sm text-muted">
                Manage your detailed contact info, career narrative, categorized skills, and academic credentials.
              </p>
            </div>
            <div
              id="profileSavedToast"
              className="font-mono text-xs px-3 py-1.5 rounded text-emerald-400 border border-emerald-500/30 transition-opacity duration-300"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                opacity: showToast ? 1 : 0
              }}
            >
              {toastMessage}
            </div>
          </div>

          {/* Async Loading / Status Indicator */}
          {statusMessage && (
            <div
              id="profileDataStatus"
              className="mt-4 p-3 rounded-lg border font-mono text-xs"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              {statusMessage.type === 'loading' ? (
                <span className="text-emerald-500">
                  <i className="fas fa-circle-notch fa-spin mr-1"></i> {statusMessage.text}
                </span>
              ) : (
                <span className="text-amber-400">
                  {statusMessage.text}
                </span>
              )}
            </div>
          )}
        </div>

        <form id="comprehensiveProfileForm" onSubmit={handleSubmit} className="space-y-8">
          {/* 1. CONTACT & PERSONAL DETAILS */}
          <fieldset className="profile-fieldset">
            <legend className="profile-legend">
              👤 1. CONTACT &amp; PERSONAL DETAILS
            </legend>

            <div className="flex items-center gap-6 mb-8 pt-2">
              <div
                className="avatar-preview-box"
                id="avatarPreviewBox"
                role="button"
                tabIndex={0}
                title="Click to view or edit profile photo"
                onClick={() => setShowAvatarModal(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowAvatarModal(true);
                  }
                }}
              >
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile Photo" />
                ) : (
                  <i className="fas fa-user text-3xl text-emerald-500"></i>
                )}
                <div className="avatar-hover-overlay">
                  <i className="fas fa-camera text-base mb-1"></i>
                  <span className="text-[10px] font-mono leading-none">View / Edit</span>
                </div>
              </div>

              <div>
                <div className="profile-label">PROFILE PHOTO (CLICK PHOTO TO VIEW &amp; ADJUST)</div>
                <input
                  type="file"
                  id="photoFileInput"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <button
                    type="button"
                    id="uploadPhotoBtn"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-xs px-3.5 py-2"
                  >
                    <i className="fas fa-cloud-upload-alt mr-1"></i> Choose Image
                  </button>
                  <button
                    type="button"
                    id="viewPhotoBtn"
                    onClick={() => setShowAvatarModal(true)}
                    className="btn-secondary text-xs px-3.5 py-2"
                  >
                    <i className="fas fa-expand mr-1"></i> View Photo
                  </button>
                </div>
                <div className="text-xs text-muted">
                  Click the picture to preview full size, crop, zoom, and rotate your avatar before saving.
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="profile-label">FULL NAME *</label>
                <input
                  type="text"
                  id="profFullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. Alex Mercer"
                  required
                />
              </div>
              <div>
                <label className="profile-label">PROFESSIONAL EMAIL</label>
                <input
                  type="email"
                  id="profEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. alex.mercer@dev.io"
                />
              </div>
              <div>
                <label className="profile-label">PHONE NUMBER</label>
                <input
                  type="text"
                  id="profPhone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. +1 (555) 234-5678"
                />
              </div>
              <div>
                <label className="profile-label">LOCATION (CITY, COUNTRY)</label>
                <input
                  type="text"
                  id="profLocation"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </div>
          </fieldset>

          {/* 2. PROFESSIONAL IDENTITY & GOALS */}
          <fieldset className="profile-fieldset">
            <legend className="profile-legend">
              🚀 2. PROFESSIONAL IDENTITY &amp; GOALS
            </legend>

            <div className="space-y-6 pt-2">
              <div>
                <label className="profile-label">PROFESSIONAL TAGLINE / HEADLINE</label>
                <input
                  type="text"
                  id="profTagline"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. Full-Stack Engineer specializing in React & Node"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="profile-label">TARGET CAREER ROLE *</label>
                  <input
                    type="text"
                    id="profTargetRole"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
                <div>
                  <label className="profile-label">EXPERIENCE LEVEL</label>
                  <select
                    id="profExpLevel"
                    name="expLevel"
                    value={formData.expLevel}
                    onChange={handleChange}
                    className="profile-select"
                  >
                    <option value="Beginner / Student">Beginner / Student</option>
                    <option value="Junior (1-2 yrs)">Junior (1-2 yrs)</option>
                    <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                    <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="profile-label">JOB HUNT STATUS</label>
                <select
                  id="profJobStatus"
                  name="jobStatus"
                  value={formData.jobStatus}
                  onChange={handleChange}
                  className="profile-select max-w-md"
                >
                  <option value="Actively Looking for Roles">Actively Looking for Roles</option>
                  <option value="Open to Opportunities">Open to Opportunities</option>
                  <option value="Not Looking">Not Looking</option>
                </select>
              </div>

              <div>
                <label className="profile-label">PROFESSIONAL BIO / EXECUTIVE SUMMARY</label>
                <textarea
                  id="profBio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="profile-input h-28"
                  placeholder="Brief narrative highlighting your engineering passions, accomplishments, and core strengths..."
                ></textarea>
              </div>
            </div>
          </fieldset>

          {/* 3. DEVELOPER PROFILES & ONLINE LINKS */}
          <fieldset className="profile-fieldset">
            <legend className="profile-legend">
              🔗 3. DEVELOPER PROFILES &amp; ONLINE LINKS
            </legend>

            <div className="grid md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="profile-label">GITHUB PROFILE URL</label>
                <input
                  type="url"
                  id="profGithubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="profile-label">LINKEDIN PROFILE URL</label>
                <input
                  type="url"
                  id="profLinkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="profile-label">PERSONAL WEBSITE / BLOG</label>
                <input
                  type="url"
                  id="profWebsiteUrl"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="https://myportfolio.dev"
                />
              </div>
            </div>
          </fieldset>

          {/* 4. CATEGORIZED TECHNICAL COMPETENCIES */}
          <fieldset className="profile-fieldset">
            <legend className="profile-legend">
              🛠 4. CATEGORIZED TECHNICAL COMPETENCIES
            </legend>

            <div className="space-y-6 pt-2">
              <div>
                <label className="profile-label">CORE LANGUAGES &amp; FUNDAMENTALS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  id="profCoreLanguages"
                  name="coreLanguages"
                  value={formData.coreLanguages}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. JavaScript, TypeScript, Python, HTML5, CSS3, SQL"
                />
              </div>
              <div>
                <label className="profile-label">FRAMEWORKS, LIBRARIES &amp; DATABASES (COMMA SEPARATED)</label>
                <input
                  type="text"
                  id="profFrameworks"
                  name="frameworks"
                  value={formData.frameworks}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. React, Next.js, Node.js, Express, Tailwind CSS, PostgreSQL"
                />
              </div>
              <div>
                <label className="profile-label">DEVELOPER TOOLS, PLATFORMS &amp; DEVOPS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  id="profDevTools"
                  name="devTools"
                  value={formData.devTools}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. Git, Docker, Vite, VS Code, Figma, Vercel, AWS"
                />
              </div>
            </div>
          </fieldset>

          {/* 5. EDUCATION DETAILS & ACHIEVEMENTS */}
          <fieldset className="profile-fieldset">
            <legend className="profile-legend">
              🎓 5. EDUCATION DETAILS &amp; ACHIEVEMENTS
            </legend>

            <div className="space-y-6 pt-2">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="profile-label">DEGREE / FIELD OF STUDY</label>
                  <input
                    type="text"
                    id="profDegree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="e.g. B.S. in Computer Science"
                  />
                </div>
                <div>
                  <label className="profile-label">INSTITUTION / UNIVERSITY</label>
                  <input
                    type="text"
                    id="profInstitution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="e.g. Stanford University"
                  />
                </div>
                <div>
                  <label className="profile-label">GRADUATION YEAR</label>
                  <input
                    type="text"
                    id="profGradYear"
                    name="gradYear"
                    value={formData.gradYear}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="e.g. 2025"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="profile-label">CGPA / MARKS</label>
                  <input
                    type="text"
                    id="profCgpa"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="e.g. 3.8 / 4.0 or 8.9 CGPA"
                  />
                </div>
                <div>
                  <label className="profile-label">RELEVANT COURSEWORK (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    id="profCoursework"
                    name="coursework"
                    value={formData.coursework}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="e.g. Data Structures, Algorithms, Web Development..."
                  />
                </div>
              </div>

              <div>
                <label className="profile-label">CERTIFICATIONS</label>
                <input
                  type="text"
                  id="profCertifications"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. AWS Certified Developer, Meta Frontend Professional Certificate"
                />
              </div>

              <div>
                <label className="profile-label">KEY ACHIEVEMENTS &amp; HONORS (ONE PER LINE)</label>
                <textarea
                  id="profAchievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  className="profile-input h-24"
                  placeholder="e.g. Hackathon Winner — 1st Place out of 200 teams&#10;Deans List Honor Student 2024"
                ></textarea>
              </div>
            </div>
          </fieldset>

          {/* 6. WORK EXPERIENCE & PAST ROLES */}
          <fieldset className="profile-fieldset">
            <legend className="profile-legend">
              💼 6. WORK EXPERIENCE &amp; PAST ROLES
            </legend>

            <div className="pt-2">
              <label className="profile-label">WORK EXPERIENCE OVERVIEW</label>
              <textarea
                id="profExperience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="profile-input h-28"
                placeholder="Summarize key internships, contract work, freelance projects, or full-time roles..."
              ></textarea>
            </div>
          </fieldset>

          {/* Form Submit & Reset Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              id="resetProfileBtn"
              onClick={() => setShowResetModal(true)}
              className="btn-secondary text-xs px-5 py-3"
            >
              Reset Form
            </button>
            <button
              type="submit"
              id="saveProfileBtn"
              disabled={isSaving}
              className="btn-primary text-xs px-6 py-3"
              style={{ background: '#10b981', color: '#fff' }}
            >
              <i className="fas fa-save mr-1"></i> {isSaving ? 'Saving...' : 'Save Comprehensive Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Reset Confirmation Modal Popup */}
      {showResetModal && (
        <div
          id="resetModalOverlay"
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="p-6 rounded-xl max-w-md w-full mx-4 shadow-2xl space-y-4 border"
            style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-500">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--fg)' }}>
                Reset Profile Form?
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Are you sure you want to clear all profile input fields? Any unsaved data will be erased.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="cancelResetBtn"
                onClick={() => setShowResetModal(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirmResetBtn"
                onClick={handleConfirmReset}
                className="btn-primary text-xs px-4 py-2"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                Clear All Fields
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar View / Lightbox Modal */}
      {showAvatarModal && (
        <div
          id="avatarViewModal"
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md transition-all duration-300"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl border text-center relative space-y-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              id="closeAvatarViewBtn"
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-white transition-colors text-lg"
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="flex items-center gap-2 justify-center text-emerald-400 font-mono text-xs">
              <i className="fas fa-id-badge"></i>
              <span className="uppercase tracking-wider">Profile Photo</span>
            </div>

            <div className="flex justify-center my-2">
              <div
                id="avatarViewImageContainer"
                className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl flex items-center justify-center bg-black/40"
              >
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile Photo" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted p-4">
                    <i className="fas fa-user-circle text-6xl text-emerald-500/40 mb-2"></i>
                    <span className="font-mono text-xs">No profile photo set</span>
                  </div>
                )}
              </div>
            </div>

            <div id="avatarViewMeta" className="text-xs text-muted font-mono">
              {formData.photoUrl ? (
                <span className="text-emerald-400 font-mono">
                  <i className="fas fa-check-circle mr-1"></i> Active profile photo
                </span>
              ) : (
                'Upload a photo to personalize your profile'
              )}
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
              <button
                type="button"
                id="viewChangePhotoBtn"
                onClick={() => {
                  setShowAvatarModal(false);
                  fileInputRef.current?.click();
                }}
                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 font-mono"
              >
                <i className="fas fa-upload"></i> Upload New
              </button>
              {formData.photoUrl && (
                <button
                  type="button"
                  id="viewRemovePhotoBtn"
                  onClick={handleRemovePhoto}
                  className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-mono text-red-400 hover:text-red-300"
                >
                  <i className="fas fa-trash-alt"></i> Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
