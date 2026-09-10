import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  getProjects as fetchFirestoreProjects, 
  saveProject as saveFirestoreProject, 
  updateProject as updateFirestoreProject, 
  deleteProject as deleteFirestoreProject, 
  fetchWithTimeout 
} from '../firebase/firestoreService.js';

const STORAGE_KEY = 'scaffold_tracker_store';

const initialState = {
  projects: [],
  loading: false,
  error: null
};

function trackerReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, loading: true, error: null };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false, error: null };
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [action.payload, ...state.projects.filter((p) => p.id !== action.payload.id)], 
        loading: false 
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) => 
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
        loading: false
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        loading: false
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export const TrackerContext = createContext(null);

export function TrackerProvider({ children }) {
  const [state, dispatch] = useReducer(trackerReducer, initialState);
  const projectsRef = useRef(state.projects);

  useEffect(() => {
    projectsRef.current = state.projects;
  }, [state.projects]);

  // Helper to persist current projects to localStorage
  const syncLocalStorage = useCallback((userId, projects) => {
    if (!userId) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(projects));
    } catch (e) {
      console.warn('Could not persist projects to localStorage:', e);
    }
  }, []);

  // Read all projects from localStorage cache
  const getAll = useCallback((userId) => {
    if (!userId) return projectsRef.current;
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      return data ? JSON.parse(data) : projectsRef.current;
    } catch (e) {
      return projectsRef.current;
    }
  }, []);

  // Load projects from Firestore (with localStorage fallback)
  const loadProjects = useCallback(async (userId) => {
    if (!userId) return [];
    dispatch({ type: 'FETCH_INIT' });

    // Try reading local cache first for fast display
    try {
      const cached = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (cached) {
        dispatch({ type: 'SET_PROJECTS', payload: JSON.parse(cached) });
      }
    } catch (e) {
      console.warn('Could not read cached tracker projects:', e);
    }

    try {
      const remoteProjects = await fetchWithTimeout(fetchFirestoreProjects(userId), 15000);
      dispatch({ type: 'SET_PROJECTS', payload: remoteProjects });
      syncLocalStorage(userId, remoteProjects);
      return remoteProjects;
    } catch (err) {
      console.error('Failed to fetch projects from Firestore:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return projectsRef.current;
    }
  }, [syncLocalStorage]);

  // Add a new project (Create)
  const addProject = useCallback(async (userId, projectData) => {
    dispatch({ type: 'FETCH_INIT' });

    const localProject = {
      id: 'proj_' + Date.now(),
      ...projectData,
      createdAt: new Date().toISOString()
    };

    try {
      let savedProject = localProject;
      if (userId) {
        const firestoreResult = await saveFirestoreProject(userId, projectData);
        if (firestoreResult) {
          savedProject = firestoreResult;
        }
      }

      dispatch({ type: 'ADD_PROJECT', payload: savedProject });
      const currentList = getAll(userId);
      syncLocalStorage(userId, [savedProject, ...currentList.filter(p => p.id !== savedProject.id)]);
      return savedProject;
    } catch (err) {
      console.error('Failed to add project to Firestore, storing locally:', err);
      dispatch({ type: 'ADD_PROJECT', payload: localProject });
      const currentList = getAll(userId);
      syncLocalStorage(userId, [localProject, ...currentList]);
      return localProject;
    }
  }, [getAll, syncLocalStorage]);

  // Update an existing project (Update)
  const updateProject = useCallback(async (userId, updatedProject) => {
    if (!updatedProject || !updatedProject.id) return false;

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });

    // Update local cache
    const currentList = getAll(userId);
    const updatedList = currentList.map((p) => 
      p.id === updatedProject.id ? { ...p, ...updatedProject } : p
    );
    syncLocalStorage(userId, updatedList);

    try {
      if (userId) {
        await updateFirestoreProject(userId, updatedProject);
      }
      return true;
    } catch (err) {
      console.error('Failed to update project in Firestore:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return true; // Still true locally
    }
  }, [getAll, syncLocalStorage]);

  // Delete a project (Delete)
  const deleteProject = useCallback(async (userId, projectId) => {
    if (!projectId) return false;

    dispatch({ type: 'DELETE_PROJECT', payload: projectId });

    // Update local cache
    const currentList = getAll(userId);
    const updatedList = currentList.filter((p) => p.id !== projectId);
    syncLocalStorage(userId, updatedList);

    try {
      if (userId) {
        await deleteFirestoreProject(userId, projectId);
      }
      return true;
    } catch (err) {
      console.error('Failed to delete project from Firestore:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return true;
    }
  }, [getAll, syncLocalStorage]);

  const value = useMemo(() => ({
    projects: state.projects,
    loading: state.loading,
    error: state.error,
    loadProjects,
    addProject,
    updateProject,
    deleteProject,
    // Method aliases matching trackerStore.js API
    getAll,
    add: addProject,
    update: updateProject,
    delete: deleteProject
  }), [state.projects, state.loading, state.error, loadProjects, addProject, updateProject, deleteProject, getAll]);

  return (
    <TrackerContext.Provider value={value}>
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
}

export default TrackerContext;
