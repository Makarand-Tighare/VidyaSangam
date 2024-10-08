// src/app/api/linkedin/post.js

export async function POST(req) {
  const { accessToken, content } = await req.json(); // Parse the incoming JSON body

  const url = 'https://api.linkedin.com/v2/ugcPosts';

  const body = {
    author: `urn:li:person:llLvbUNCpu`, // Replace with your LinkedIn user ID
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content, // The text of your post
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC', // Set visibility as per your requirement
    },
  };

  // Function to perform fetch with timeout
  const fetchWithTimeout = (url, options, timeout = 5000) => {
      return Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timed out')), timeout)
          )
      ]);
  };

  try {
      const response = await fetchWithTimeout(url, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
      });

      if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify({ message: 'Post created successfully!', data }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
          });
      } else {
          const error = await response.json();
          return new Response(JSON.stringify({ error: error.message }), {
              status: response.status,
              headers: { 'Content-Type': 'application/json' },
          });
      }
  } catch (err) {
      return new Response(JSON.stringify({ error: 'Request failed.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
      });
  }
}
