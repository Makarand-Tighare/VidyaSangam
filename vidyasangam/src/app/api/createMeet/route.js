// app/api/createMeet/route.js

import fetch from 'node-fetch'; // Import fetch if you're using node.js runtime (if needed)

// The handler function for the POST request
export async function POST(req) {
    // Your Django backend URL
    const djangoApiUrl = 'http://127.0.0.1:8000/api/createMeet/'; // Adjust as needed

    try {
        // Parse the JSON body from the incoming request
        const requestBody = await req.json();

        // Send the POST request to the Django backend
        const response = await fetch(djangoApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        // Check if the response from Django backend is okay
        if (!response.ok) {
            // Return a 500 error if the response from Django failed
            return new Response(JSON.stringify({ message: data.message || 'Something went wrong' }), { status: 500 });
        }

        // Return the successful response with status 200
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        // Catch and return any error during the process
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}

// Support for other methods
export async function GET() {
    return new Response('Method GET Not Allowed', { status: 405 });
}

export async function DELETE() {
    return new Response('Method DELETE Not Allowed', { status: 405 });
}