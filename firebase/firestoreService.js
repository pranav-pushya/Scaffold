// === FIREBASE FIRESTORE SERVICE ===
// Manages Firestore CRUD operations for Profile & Project Tracker

import { profileStore } from '../js/store/profileStore.js';
import { trackerStore } from '../js/store/trackerStore.js';

export async function saveProfile(userId, profileData) {
    const data = {
        ...profileData,
        updatedAt: new Date().toISOString()
    };
    profileStore.set(userId, data);
    return data;
}

export async function getProfile(userId) {
    return profileStore.get(userId) || {};
}

export async function saveProject(userId, projectData) {
    return trackerStore.add(userId, projectData);
}

export async function getProjects(userId) {
    return trackerStore.getAll(userId);
}

export async function deleteProject(userId, projectId) {
    return trackerStore.delete(userId, projectId);
}

export async function updateProject(userId, projectData) {
    return trackerStore.update(userId, projectData);
}
