import { useState, useEffect } from 'react';
import type { Scouter } from '../lib/dexieDB';
import { getOrCreateScouterByName } from '../lib/scouterGameUtils';

export const useCurrentScouter = () => {
  const [currentScouter, setCurrentScouter] = useState<Scouter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Watch for changes in localStorage currentScouter (from nav-user sidebar)
  useEffect(() => {
    const loadCurrentScouter = async () => {
      try {
        const currentScouterName = localStorage.getItem('currentScouter') || localStorage.getItem('scouterInitials');
        if (currentScouterName) {
          const scouter = await getOrCreateScouterByName(currentScouterName);
          setCurrentScouter(scouter);
        }
      } catch (error) {
        console.error('Error loading current scouter:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentScouter();

    // Listen for storage changes (when scouter is changed in nav-user)
    const handleStorageChange = () => {
      loadCurrentScouter();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events in case of same-tab updates
    window.addEventListener('scouterChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scouterChanged', handleStorageChange);
    };
  }, []);

  const refreshScouter = async () => {
    if (currentScouter) {
      try {
        const { getScouter } = await import('../lib/dexieDB');
        const updatedScouter = await getScouter(currentScouter.name);
        if (updatedScouter) {
          setCurrentScouter(updatedScouter);
        }
      } catch (error) {
        console.error('Error refreshing scouter:', error);
      }
    }
  };

  return {
    currentScouter,
    isLoading,
    refreshScouter
  };
};
