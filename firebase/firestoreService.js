// === FIREBASE FIRESTORE SERVICE ===
// Manages Firestore CRUD operations for Profile & Project Tracker using real Firestore SDK with offline safety

import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc 
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';

export function fetchWithTimeout(promise, ms = 20000) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('Data fetch timed out after 20000ms — Firestore request took too long to resolve.'));
        }, ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function saveProfile(userId, profileData) {
    if (!userId) return null;
    try {
        const docRef = doc(db, 'profiles', userId);
        const data = {
            ...profileData,
            updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, data, { merge: true });
        return data;
    } catch (err) {
        console.error('Firestore saveProfile RAW ERROR:', err);
        throw err;
    }
}

export async function getProfile(userId) {
    if (!userId) return {};
    try {
        const docRef = doc(db, 'profiles', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
    } catch (err) {
        console.error('Firestore getProfile RAW ERROR:', err, 'Code:', err.code, 'Message:', err.message);
        throw err; // Re-throw so caller/fetchWithTimeout catches the actual error
    }
    return {};
}

export async function saveProject(userId, projectData) {
    if (!userId) return null;
    try {
        const colRef = collection(db, 'profiles', userId, 'projects');
        const data = {
            ...projectData,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(colRef, data);
        return { id: docRef.id, ...data };
    } catch (err) {
        console.error('Firestore saveProject RAW ERROR:', err);
        throw err;
    }
}

export async function getProjects(userId) {
    if (!userId) return [];
    try {
        const colRef = collection(db, 'profiles', userId, 'projects');
        const snapshot = await getDocs(colRef);
        const projects = [];
        snapshot.forEach(docSnap => {
            projects.push({ id: docSnap.id, ...docSnap.data() });
        });
        return projects;
    } catch (err) {
        console.error('Firestore getProjects RAW ERROR:', err, 'Code:', err.code, 'Message:', err.message);
        throw err; // Re-throw so caller/fetchWithTimeout catches the actual error
    }
}

export async function updateProject(userId, projectData) {
    if (!userId || !projectData.id) return null;
    try {
        const docRef = doc(db, 'profiles', userId, 'projects', projectData.id);
        const { id, ...dataToUpdate } = projectData;
        await updateDoc(docRef, dataToUpdate);
        return { id, ...dataToUpdate };
    } catch (err) {
        console.error('Firestore updateProject RAW ERROR:', err);
        throw err;
    }
}

export async function deleteProject(userId, projectId) {
    if (!userId || !projectId) return false;
    try {
        const docRef = doc(db, 'profiles', userId, 'projects', projectId);
        await deleteDoc(docRef);
        return true;
    } catch (err) {
        console.error('Firestore deleteProject RAW ERROR:', err);
        throw err;
    }
}
