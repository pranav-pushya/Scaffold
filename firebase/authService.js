// === FIREBASE AUTH SERVICE ===
// Manages Signup, Login, Google OAuth, and Logout operations

import { currentUser, setCurrentUser } from './firebaseConfig.js';

export async function loginWithEmail(email, password) {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    // Simulate authentication
    const user = {
        uid: 'user_' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString()
    };
    setCurrentUser(user);
    return user;
}

export async function signUpWithEmail(email, password, name) {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    const user = {
        uid: 'user_' + Date.now(),
        email: email,
        displayName: name || email.split('@')[0],
        createdAt: new Date().toISOString()
    };
    setCurrentUser(user);
    return user;
}

export async function loginWithGoogle() {
    const user = {
        uid: 'google_user_' + Date.now(),
        email: 'developer@google.com',
        displayName: 'Google Developer',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pranav',
        createdAt: new Date().toISOString()
    };
    setCurrentUser(user);
    return user;
}

export async function logoutUser() {
    setCurrentUser(null);
    window.location.hash = '#login';
}

export function getCurrentAuthUser() {
    return currentUser;
}
