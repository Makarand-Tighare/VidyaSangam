"use client";
import React, { useEffect } from 'react';

const PostForm = () => {
  const fetchUserId = async () => {
    // Function to get the value of a cookie by name
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    // Retrieve the access token from the cookie
    const accessToken = getCookie('access_token');

    if (!accessToken) {
      console.error('Access token not found in cookies.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/linkedin/userId', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Your LinkedIn User ID:', data.linkedInUserId);
      } else {
        const errorData = await response.json();
        console.error('Error fetching user ID:', errorData.error);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Use useEffect to call fetchUserId once the component mounts
  useEffect(() => {
    fetchUserId();
  }, []); // Empty dependency array ensures it runs only once on mount

  return (
    <div>
      <h1>Your LinkedIn User Information</h1>
      {/* You can add additional UI elements here */}
    </div>
  );
};

export default PostForm;
