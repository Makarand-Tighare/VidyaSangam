'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, logout as logoutApi, isLoggedIn, refreshAccessToken } from './auth';

// Create auth context
const AuthContext = createContext(null);

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
          const newToken = await refreshAccessToken();
          if (newToken) {
            // If we have a valid token, consider the user logged in
            // We could fetch user data here if needed
            setUser({ isLoggedIn: true });
          } else {
            // If refresh failed, user needs to log in again
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check error:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

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
            // Even if refresh fails, we'll still try to render the component
            // since the existing token might still be valid
            await refreshAccessToken();
          } catch (error) {
            console.warn('Token refresh failed:', error);
            // Continue anyway - the component's API calls will 
            // handle auth errors if the token is truly invalid
          }
          
          // If we got here, user has a token
          setIsAuthorized(true);
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