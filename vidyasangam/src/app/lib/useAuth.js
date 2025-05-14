'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, logout as logoutApi, isLoggedIn, refreshAccessToken } from './auth';

// Create auth context
const AuthContext = createContext(null);

// Token refresh interval (50 minutes in milliseconds)
// We refresh 10 minutes before the 60-minute expiration
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoggedIn()) {
        // Try to refresh the token if it exists
        try {
          const token = await refreshAccessToken();
          if (token) {
            // If we have a valid token, consider the user logged in
            setUser({ 
              isLoggedIn: true,
              isAdmin: localStorage.getItem('isAdmin') === 'true',
              isDepartmentAdmin: localStorage.getItem('isDepartmentAdmin') === 'true'
            });
          } else {
            // If refresh failed and we have no token, user needs to log in again
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check error:', error);
          // Even if refresh fails, don't clear user if we still have a token
          if (localStorage.getItem('authToken')) {
            setUser({ 
              isLoggedIn: true,
              isAdmin: localStorage.getItem('isAdmin') === 'true',
              isDepartmentAdmin: localStorage.getItem('isDepartmentAdmin') === 'true'
            });
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Set up periodic token refresh
  useEffect(() => {
    // Only set up refresh interval if user is logged in
    if (!user?.isLoggedIn) return;

    // Function to refresh the token
    const refreshToken = async () => {
      console.log('Attempting periodic token refresh');
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Periodic token refresh failed:', error);
      }
    };

    // Set up interval to refresh token
    const intervalId = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);

    // Clean up interval on unmount or when user logs out
    return () => clearInterval(intervalId);
  }, [user?.isLoggedIn]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await loginApi(email, password);
      if (result.success) {
        setUser({ isLoggedIn: true });
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    logoutApi();
    setUser(null);
    router.push('/login');
  };

  // Auth context value
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Improved protected route wrapper with better loading handling
export const withAuth = (Component) => {
  const AuthenticatedComponent = (props) => {
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // This runs once on component mount
      const checkAuthentication = async () => {
        setIsLoading(true);
        
        try {
          // Check if auth token exists
          if (!isLoggedIn()) {
            // If not logged in, redirect to login page
            router.push('/login');
            return;
          }
          
          // Try to refresh the token if needed
          try {
            const token = await refreshAccessToken();
            if (token) {
              // If token refresh works, we're good
              setIsAuthorized(true);
            } else if (localStorage.getItem('authToken')) {
              // Even if refresh fails, if we still have a token, try to continue
              setIsAuthorized(true);
            } else {
              // No token at all, go to login
              router.push('/login');
              return;
            }
          } catch (error) {
            console.warn('Token refresh failed:', error);
            // If we still have an auth token, continue anyway
            if (localStorage.getItem('authToken') && localStorage.getItem('isLoggedIn') === 'true') {
              setIsAuthorized(true);
            } else {
              router.push('/login');
              return;
            }
          }
        } catch (error) {
          console.error('Authentication check error:', error);
          // On critical errors, redirect to login
          router.push('/login');
        } finally {
          setIsAuthChecked(true);
          setIsLoading(false);
        }
      };

      checkAuthentication();
    }, [router]);

    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-blue-500">Checking authentication...</span>
        </div>
      );
    }

    // Only render the component if authorized
    return isAuthChecked && isAuthorized ? <Component {...props} /> : null;
  };

  return AuthenticatedComponent;
};

export default useAuth; 