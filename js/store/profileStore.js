// === PROFILE STORE ===
// Local cache layer mirroring Firestore User Profile data

class ProfileStore {
    constructor() {
        this.STORAGE_KEY = 'scaffold_profile_store';
    }

    get(userId) {
        try {
            const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    set(userId, profileData) {
        try {
            localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(profileData));
            return true;
        } catch (e) {
            return false;
        }
    }
}

export const profileStore = new ProfileStore();
