// Authentication utilities

/**
 * Store authentication tokens in localStorage
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem('authToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Get the current authentication tokens from localStorage
 * @returns {Object} Object containing access and refresh tokens
 */
export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('authToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

/**
 * Decode a JWT token to get its payload
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    return true; // If we can't decode or no exp claim, consider it expired
  }
  
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get token expiration time in milliseconds
 * @param {string} token - JWT token to check
 * @returns {number|null} Milliseconds until expiration or null if invalid
 */
export const getTokenExpirationTime = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  // Convert to milliseconds and get difference
  return (decoded.exp * 1000) - Date.now();
};

/**
 * Clear all authentication tokens from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('isLoggedIn');
};

/**
 * Check if the user is logged in (has a valid access token)
 * @returns {boolean} True if the user has a valid access token
 */
export const isLoggedIn = () => {
  const authToken = localStorage.getItem('authToken');
  const isLoggedInFlag = localStorage.getItem('isLoggedIn');
  
  // First check if we have a token and the isLoggedIn flag
  if (!authToken || isLoggedInFlag !== 'true') {
    return false;
  }
  
  // Then check if the token is expired
  if (isTokenExpired(authToken)) {
    // Token is expired, but we might be able to refresh it
    // We'll return true and let the refresh mechanism handle it
    return true;
  }
  
  // Token exists, flag is set, and token is not expired
  return true;
};

/**
 * Check if the current user is an admin
 * @returns {boolean} True if the user is an admin
 */
export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};

/**
 * Login function to authenticate a user and store tokens
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Login result object
 */
export const login = async (email, password) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/user/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Login failed');
    }

    const data = await response.json();
    
    if (data.token && data.token.access && data.token.refresh) {
      // Store both tokens
      storeTokens(data.token.access, data.token.refresh);
      
      // Set admin status (defaulting to false for regular login)
      localStorage.setItem('isAdmin', data.isAdmin === true ? 'true' : 'false');
      
      // Always set isLoggedIn flag
      localStorage.setItem('isLoggedIn', 'true');
      
      return { success: true, message: data.msg || 'Login successful' };
    } else {
      throw new Error('Invalid token data received');
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Admin login function
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Login result object
 */
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/admin/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Admin login failed');
    }

    const data = await response.json();
    
    if (data.token) {
      // Store token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isLoggedIn', 'true');
      
      return { success: true, message: 'Admin login successful' };
    } else {
      throw new Error('Invalid token data received');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Logout function to clear tokens and perform any cleanup
 */
export const logout = () => {
  clearTokens();
  // You can add other cleanup logic here if needed
  // Such as redirecting to login page
};

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<string|null>} New access token or null if refresh failed
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const currentToken = localStorage.getItem('authToken');
    
    if (!refreshToken) {
      console.warn('No refresh token available');
      return currentToken; // Return current token if no refresh token
    }
    
    // Check if current token is still valid and not close to expiration
    if (currentToken && !isTokenExpired(currentToken)) {
      const expirationTime = getTokenExpirationTime(currentToken);
      
      // If token is valid for more than 10 minutes, don't refresh yet
      if (expirationTime && expirationTime > 10 * 60 * 1000) {
        console.log('Token still valid, no need to refresh yet');
        return currentToken;
      }
    }
    
    // If we're here, we need to refresh the token
    console.log('Refreshing access token');
    
    const response = await fetch('http://127.0.0.1:8000/api/user/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    const newAccessToken = data.access;
    
    // Store the new access token
    localStorage.setItem('authToken', newAccessToken);
    
    // Make sure isLoggedIn flag is set
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('Access token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    // If refresh failed but we still have an auth token, don't clear everything
    if (localStorage.getItem('authToken')) {
      console.log('Keeping existing auth token');
      return localStorage.getItem('authToken');
    }
    
    // Only if we have no tokens at all, clear everything
    clearTokens();
    return null;
  }
};

/**
 * Authenticated fetch function that handles token refreshing
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  // Get the current access token
  let accessToken = localStorage.getItem('authToken');
  
  if (!accessToken) {
    console.error('No auth token available for API request');
    throw new Error('Authentication required');
  }
  
  // Set up headers with the access token
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': options.headers?.['Content-Type'] || 'application/json'
  };
  
  try {
    // Make the initial request
    let response = await fetch(url, { ...options, headers });
    
    // If we get a 401 Unauthorized, try to refresh the token
    if (response.status === 401) {
      console.log('Token expired, attempting to refresh...');
      
      // Try to refresh the token
      const newToken = await refreshAccessToken();
      
      // If token refresh was successful, retry the request with the new token
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
      } else {
        // Clear tokens on auth failure
        clearTokens();
        throw new Error('Authentication failed. Please log in again.');
      }
    }
    
    // New code to check content type and handle HTML responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML response instead of JSON:', url);
      const htmlText = await response.text();
      console.error('HTML response preview:', htmlText.substring(0, 200));
      throw new Error('Received HTML instead of JSON. API endpoint may be down or returning an error page.');
    }
    
    return response;
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('API request failed:', error);
    
    // If this is a token error (e.g., "Authentication required"),
    // we might want to clear tokens and redirect
    if (error.message.includes('Authentication')) {
      clearTokens();
    }
    
    throw error;
  }
}; 