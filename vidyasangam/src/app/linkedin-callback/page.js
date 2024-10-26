'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function LinkedInCallback() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const exchangeAuthorizationCode = async () => {
      if (code && state) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/user/linkedin-auth/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ authorization_code: code, state: state }),
          });

          const data = await response.json();

          if (response.status === 200) {
            setLoading(false);
            setSuccess(true);
            router.push('/'); // Navigate to the homepage
          } else {
            setError(data.error || 'An error occurred while processing your request.');
          }
        } catch (err) {
          setError('Failed to connect to the server.');
        } finally {
          setLoading(false);
        }
      }
    };

    exchangeAuthorizationCode();
  }, [code, state, router]);

  return (
    <div>
      {loading && <p>Processing LinkedIn authentication...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Authentication successful!</p>}
    </div>
  );
}

export default function SuspenseLinkedInCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LinkedInCallback />
    </Suspense>
  );
}
