'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyTokenValidity, clearTokens } from './auth';
import { toast } from 'sonner';

/**
 * Hook that validates the token when page focus changes or device wakes from sleep
 * Redirects to login if token is invalid
 */
export const useTokenValidator = () => {
  const router = useRouter();
  
  useEffect(() => {
    let tabHiddenTime = null;
    
    // Function to validate token and handle invalid tokens
    const validateToken = async () => {
      // If user is not logged in, don't do anything
      if (!localStorage.getItem('authToken')) return;
      
      // Verify token validity
      const isTokenValid = await verifyTokenValidity();
      
      if (!isTokenValid) {
        // Token is invalid, clear tokens and redirect to login
        clearTokens();
        
        toast.error('Your session has expired. Please log in again.', {
          duration: 5000,
        });
        
        router.push('/login');
        return false;
      }
      
      return true;
    };
    
    // Check token validity on page load
    validateToken();
    
    // Event handlers for visibility change and focus change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, record the time
        tabHiddenTime = Date.now();
      } else if (tabHiddenTime !== null) {
        // Tab is visible again, check how long it was hidden
        const hiddenDuration = Date.now() - tabHiddenTime;
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        // If tab was hidden for more than 5 minutes, validate token
        if (hiddenDuration > FIVE_MINUTES) {
          validateToken();
        }
        
        tabHiddenTime = null;
      }
    };
    
    const handleFocus = () => {
      // Validate token when window regains focus
      validateToken();
    };
    
    // Add event listeners for visibility and focus changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);
  
  return null;
};

/**
 * Component wrapper for token validation functionality
 */
export const TokenValidatorProvider = ({ children }) => {
  useTokenValidator();
  return children;
};

export default useTokenValidator; 