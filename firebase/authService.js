// === FIREBASE AUTH SERVICE ===
// Manages Signup, Login, Google OAuth, and Logout using Firebase Auth SDK

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from 'firebase/auth';
import { auth } from './firebaseConfig.js';

let currentUser = null;

// Listen to auth state changes to keep track of current user
onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

export async function loginWithEmail(email, password) {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    return userCredential.user;
}

export async function signUpWithEmail(email, password, name) {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
    }
    currentUser = userCredential.user;
    return userCredential.user;
}

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    return result.user;
}

export async function logoutUser() {
    await signOut(auth);
    currentUser = null;
    window.location.hash = '#login';
}

export function getCurrentAuthUser() {
    return currentUser || auth.currentUser;
}
