export async function POST(req) {
    const { code, state } = await req.json();
  
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = 'http://127.0.0.1:3000/linkedin-callback'; // Ensure this matches LinkedIn settings
  
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  
    // Check for required parameters
    if (!code || !state) {
        return new Response(JSON.stringify({ error: 'Missing code or state' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
  
    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // Set the cookie with the access token
            const accessToken = data.access_token; // Get the access token from LinkedIn
            const cookieOptions = {
                maxAge: 60 * 60 * 24, // Set cookie expiration (1 day)
                path: '/', // Cookie path
                httpOnly: true, // Prevent JavaScript access
                secure: process.env.NODE_ENV === 'production', // Set to true in production
            };

            // Set the cookie in the response
            return new Response(JSON.stringify({ accessToken }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `access_token=${accessToken}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}; HttpOnly=${cookieOptions.httpOnly}; Secure=${cookieOptions.secure}`,
                },
            });
        } else {
            return new Response(JSON.stringify({ error: data.error_description || 'Unknown error' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        console.error('Error during token exchange:', error);
        return new Response(JSON.stringify({ error: 'Failed to exchange code for access token.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}