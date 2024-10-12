// pages/sessions/createmeet.js

export const createMeet = async () => {
    const response = await fetch('/api/createMeet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ /* Your data here */ }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to create Google Meet');
    }
  
    return await response.json();
  };
  