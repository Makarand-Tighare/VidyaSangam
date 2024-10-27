export async function POST(req) {
    const { code, state } = await req.json();

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';

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
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const accessToken = data.access_token;
            const cookieOptions = {
                maxAge: 60 * 60 * 24,
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            };

            return new Response(JSON.stringify({ accessToken }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `access_token=${accessToken}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}; HttpOnly=${cookieOptions.httpOnly}; Secure=${cookieOptions.secure}`,
                },
            });
        } else {
            console.error('LinkedIn error:', data);
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
