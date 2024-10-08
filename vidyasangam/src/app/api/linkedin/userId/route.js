// src/app/api/linkedin/userId/route.js
export async function GET(req) {
  // Extract the access token from the Authorization header
  const authorizationHeader = req.headers.get('Authorization');
  const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null;
  console.log('Access Token:', accessToken);
  
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = 'https://api.linkedin.com/v2/me'; // LinkedIn API to get user profile

  try {
    const response = await Promise.race([
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 5000)), // 5 seconds timeout
    ]);

    if (response.ok) {
      const data = await response.json();
      // Return user id or any other info you need
      return new Response(JSON.stringify({ linkedInUserId: data.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const errorData = await response.json();
      console.error('Error fetching user data:', errorData); // Log the error details
      return new Response(JSON.stringify({ error: errorData.message }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error fetching LinkedIn user data:', error); // Log the error for debugging
    return new Response(JSON.stringify({ error: 'Failed to fetch user data from LinkedIn' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
