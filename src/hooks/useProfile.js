import { useContext } from 'react';
import { ProfileContext } from '../context/ProfileContext.jsx';

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export default useProfile;
