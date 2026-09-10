import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebaseConfig.js';

let currentUser = null;

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

export async function resetPassword(email) {
    if (!email || !email.trim()) {
        throw new Error('Please enter your email address to reset password.');
    }
    await sendPasswordResetEmail(auth, email.trim());
    return true;
}

