'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from './auth';
import { toast } from 'sonner';

// Timeout duration in milliseconds (60 minutes = 3,600,000 ms)
const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

// Warning before timeout (5 minutes before logout = 300,000 ms)
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000;

// Events to track for user activity
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click'
];

export const useAutoLogout = () => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Function to update last activity timestamp
    const updateActivity = () => {
      setLastActivity(Date.now());
      setWarningShown(false); // Reset warning when user is active
    };

    // Add event listeners for user activity
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Check for inactivity every minute
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivity;

      // Show warning 5 minutes before logout
      if (inactiveTime >= INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT && !warningShown) {
        toast.warning(
          'You will be logged out in 5 minutes due to inactivity. Move your mouse or press a key to stay logged in.',
          {
            duration: 10000, // Show for 10 seconds
            id: 'inactivity-warning', // Prevent duplicate warnings
          }
        );
        setWarningShown(true);
      }

      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        // User has been inactive for too long, log them out
        console.log('Auto-logout due to inactivity');
        toast.error('You have been logged out due to inactivity.', {
          duration: 5000,
        });
        logout();
        router.push('/login');
      }
    }, 60000); // Check every minute

    // Cleanup event listeners and interval on unmount
    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(intervalId);
    };
  }, [lastActivity, router, warningShown]);

  return null; // This hook doesn't return anything
};

// Component wrapper for auto-logout functionality
export const AutoLogoutProvider = ({ children }) => {
  useAutoLogout();
  return children;
}; 