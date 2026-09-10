import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig.js';
import { 
  loginWithEmail as authLoginWithEmail, 
  signUpWithEmail as authSignUpWithEmail, 
  loginWithGoogle as authLoginWithGoogle, 
  logoutUser as authLogoutUser,
  getCurrentAuthUser as authGetCurrentAuthUser
} from '../firebase/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__MOCK_AUTH__) {
      setCurrentUser(window.__MOCK_AUTH__);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    return await authLoginWithEmail(email, password);
  }, []);

  const signUpWithEmail = useCallback(async (email, password, name) => {
    return await authSignUpWithEmail(email, password, name);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    return await authLoginWithGoogle();
  }, []);

  const logoutUser = useCallback(async () => {
    if (typeof window !== 'undefined' && window.__MOCK_AUTH__) {
      delete window.__MOCK_AUTH__;
    }
    try {
      await authLogoutUser();
    } finally {
      setCurrentUser(null);
    }
  }, []);

  const getCurrentUser = useCallback(() => {
    return authGetCurrentAuthUser();
  }, []);

  const value = useMemo(() => ({
    currentUser,
    loading,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    logoutUser,
    getCurrentUser
  }), [currentUser, loading, loginWithEmail, signUpWithEmail, loginWithGoogle, logoutUser, getCurrentUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
