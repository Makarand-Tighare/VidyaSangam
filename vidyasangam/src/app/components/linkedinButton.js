"use client"; // Ensure you're in client-side rendering mode

import React from 'react';

const LinkedInButton = () => {
  const handleLinkedInLogin = () => {
    const clientId = '77zdkh8uihgm40'; // Replace with your LinkedIn Client ID
    const redirectUri = 'http://localhost:3000/linkedin-callback'; // Your local redirect URI
    const state = 'xyz123abc456'; // A random string to maintain state
    const scope = 'w_member_social r_basicprofile'; // Define the permissions you need

    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    
    window.location.href = url; // Redirect to LinkedIn for authentication
  };

  return (
    <button 
      onClick={handleLinkedInLogin} 
      className="bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      Login with LinkedIn
    </button>
  );
};

export default LinkedInButton;
