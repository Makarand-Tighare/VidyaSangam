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
 * Clear all authentication tokens from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Check if the user is logged in (has an access token)
 * @returns {boolean} True if the user has an access token
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('authToken');
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
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
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
    
    console.log('Access token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    // If refresh failed, clear tokens and return null
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
  
  // Set up headers with the access token
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': options.headers?.['Content-Type'] || 'application/json'
  };
  
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
      response = await fetch(url, { ...options, headers });
    } else {
      // If token refresh failed, throw an error or handle as needed
      // This typically means the user needs to log in again
      throw new Error('Authentication failed. Please log in again.');
    }
  }
  
  return response;
}; 