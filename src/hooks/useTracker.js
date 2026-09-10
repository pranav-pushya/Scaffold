import { useContext } from 'react';
import { TrackerContext } from '../context/TrackerContext.jsx';

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
}

export default useTracker;
