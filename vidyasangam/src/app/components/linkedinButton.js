"use client";

import React from 'react';

const LinkedInButton = () => {
  const handleLinkedInLogin = () => {
    const clientId = '77zdkh8uihgm40'; 
    const redirectUri = 'http://54.166.190.24:3000/linkedin-callback';
    const state = Math.random().toString(36).substring(7); 
    const scope = encodeURIComponent('w_member_social r_basicprofile');
  
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
  
    window.location.href = url;
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
