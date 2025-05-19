'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Hook to handle navigation when session expires
 * Listens for the auth:sessionExpired event and navigates to login
 */
export const useAuthNavigation = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Handler for session expired event
    const handleSessionExpired = () => {
      toast.error('Your session has expired. Please log in again.', {
        duration: 5000,
        id: 'session-expired', // Use ID to prevent duplicate toasts
      });
      
      // Navigate to login page
      router.push('/login');
    };
    
    // Listen for the session expired event
    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, [router]);
  
  return null;
};

/**
 * Component wrapper for auth navigation
 */
export const AuthNavigationProvider = ({ children }) => {
  useAuthNavigation();
  return children;
};

export default useAuthNavigation; 