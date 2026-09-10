import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { getProfile as fetchFirestoreProfile, saveProfile as saveFirestoreProfile, fetchWithTimeout } from '../firebase/firestoreService.js';

const STORAGE_KEY = 'scaffold_profile_store';

const initialProfileState = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  photoUrl: '',
  tagline: '',
  targetRole: '',
  expLevel: 'Beginner / Student',
  jobStatus: 'Actively Looking',
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

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(initialProfileState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Controlled-state field updater
  const updateField = useCallback((fieldName, value) => {
    setProfile((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  // Update multiple fields or full profile state
  const setProfileData = useCallback((data) => {
    setProfile((prev) => ({
      ...prev,
      ...(typeof data === 'function' ? data(prev) : data)
    }));
  }, []);

  // Fetch / get profile for user (Firestore with localStorage cache fallback)
  const loadProfile = useCallback(async (userId) => {
    if (!userId) return null;
    setLoading(true);
    setError(null);

    // Check localStorage cache first for fast paint
    try {
      const cached = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Could not read cached profile from localStorage:', e);
    }

    try {
      const remoteData = await fetchWithTimeout(fetchFirestoreProfile(userId), 15000);
      if (remoteData && Object.keys(remoteData).length > 0) {
        setProfile((prev) => {
          const merged = { ...prev, ...remoteData };
          try {
            localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(merged));
          } catch (e) {
            console.warn('Could not cache profile to localStorage:', e);
          }
          return merged;
        });
        return remoteData;
      }
    } catch (err) {
      console.error('Failed to load profile from Firestore:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // Save profile to Firestore and sync with localStorage
  const saveProfileData = useCallback(async (userId, dataToSave) => {
    if (!userId) throw new Error('User ID is required to save profile');
    setLoading(true);
    setError(null);

    const payload = dataToSave || profileRef.current;

    try {
      // Optimistic cache update
      try {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(payload));
      } catch (e) {
        console.warn('Could not write profile to localStorage:', e);
      }

      const saved = await saveFirestoreProfile(userId, payload);
      setProfile((prev) => ({ ...prev, ...saved }));
      return saved;
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset profile to default empty structure
  const resetProfile = useCallback(() => {
    setProfile(initialProfileState);
    setError(null);
  }, []);

  // Backwards-compatible methods mirroring old profileStore.js API
  const get = useCallback((userId) => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      return data ? JSON.parse(data) : profileRef.current;
    } catch (e) {
      return profileRef.current;
    }
  }, []);

  const set = useCallback((userId, profileData) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(profileData));
      setProfile((prev) => ({ ...prev, ...profileData }));
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    profile,
    loading,
    error,
    updateField,
    setProfileData,
    loadProfile,
    saveProfileData,
    resetProfile,
    get,
    set
  }), [profile, loading, error, updateField, setProfileData, loadProfile, saveProfileData, resetProfile, get, set]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export default ProfileContext;
