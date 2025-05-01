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

// Protected route wrapper
export const withAuth = (Component) => {
  const AuthenticatedComponent = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null; // Will redirect to login
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};

export default useAuth; 