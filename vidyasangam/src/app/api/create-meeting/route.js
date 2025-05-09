import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Check if the user is authorized
    const authCheckResponse = await axios.get('http://127.0.0.1:8000/api/utility/check-auth', { withCredentials: true });

    if (authCheckResponse.data.is_authorized) {
      // If authorized, create the meeting
      const response = await axios.post('http://127.0.0.1:8000/api/utility/create-meet', {}, { withCredentials: true });
      const meetLink = response.data.meet_link;

      return NextResponse.json({ meet_link: meetLink });
    } else {
      // If not authorized, get the authorization URL
      const authResponse = await axios.get('http://127.0.0.1:8000/api/utility/authorize', { withCredentials: true });
      const authUrl = authResponse.request.responseURL; // This should contain the authorization URL

      return NextResponse.json({ redirect: authUrl });
    }
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}