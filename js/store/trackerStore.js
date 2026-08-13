// === TRACKER STORE ===
// Local cache layer mirroring Firestore Job & Project Tracker Kanban data

class TrackerStore {
    constructor() {
        this.STORAGE_KEY = 'scaffold_tracker_store';
    }

    getAll(userId) {
        try {
            const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    add(userId, project) {
        const projects = this.getAll(userId);
        const newProj = {
            id: 'proj_' + Date.now(),
            ...project,
            createdAt: new Date().toISOString()
        };
        projects.unshift(newProj);
        localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(projects));
        return newProj;
    }

    update(userId, updatedProject) {
        let projects = this.getAll(userId);
        projects = projects.map(p => p.id === updatedProject.id ? { ...p, ...updatedProject } : p);
        localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(projects));
        return true;
    }

    delete(userId, projectId) {
        let projects = this.getAll(userId);
        projects = projects.filter(p => p.id !== projectId);
        localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(projects));
        return true;
    }
}

export const trackerStore = new TrackerStore();
