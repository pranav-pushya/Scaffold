// === FIREBASE CONFIG & INITIALIZATION ===
// Replace with your actual Firebase project config credentials

export const firebaseConfig = {
    apiKey: "AIzaSy_YOUR_API_KEY",
    authDomain: "scaffold-devlog.firebaseapp.com",
    projectId: "scaffold-devlog",
    storageBucket: "scaffold-devlog.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:000000000000"
};

// State placeholder for current user session
export let currentUser = JSON.parse(localStorage.getItem('scaffold_user') || 'null');

export function setCurrentUser(user) {
    currentUser = user;
    if (user) {
        localStorage.setItem('scaffold_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('scaffold_user');
    }
}
