"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function LinkedInCallback() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (code && state) {
      fetch('/api/linkedin/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        if (data.accessToken) {
          console.log('Access Token:', data.accessToken);
          setSuccess(true);
        } else {
          setError(data.error || 'Unknown error occurred');
        }
      })
      .catch(err => {
        setLoading(false);
        setError('Failed to fetch access token: ' + err.message);
      });
    } else {
      setLoading(false);
      setError('Invalid authentication parameters');
    }
  }, [code, state]);

  return (
    <div>
      {loading && <p>Processing LinkedIn authentication...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Authentication successful!</p>}
    </div>
  );
}

export default LinkedInCallback;
