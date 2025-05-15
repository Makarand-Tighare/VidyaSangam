'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

function LinkedInCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const hasFetched = useRef(false);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const response = await fetch('https://vidyasangam.duckdns.org/api/user/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user data');

      const data = await response.json();
      return data.email || null; // Return the email address
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const exchangeAuthorizationCode = async () => {
      if (code && state && !hasFetched.current) {
        hasFetched.current = true; // Set flag to prevent duplicate requests
        try {
          // Fetch the user's email before sending the LinkedIn authorization request
          const email = await fetchUserData();
          if (!email) {
            setError('User email not found.');
            setLoading(false);
            return;
          }

          const response = await fetch('https://vidyasangam.duckdns.org/api/utility/linkedin-auth/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              authorization_code: code,
              state: state,
              email: email,
            }),
          });

          const data = await response.json();

          if (response.status === 200) {
            setLoading(false);
            setSuccess(true);
            // Add a small delay before redirecting to ensure the token is saved
            setTimeout(() => {
              router.push('/profile');
            }, 1000);
          } else {
            setError(data.error || data.details || 'An error occurred while processing your request.');
          }
        } catch (err) {
          console.error('LinkedIn auth error:', err);
          setError('Failed to connect to the server. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    exchangeAuthorizationCode();
  }, [code, state, router]);

  useEffect(() => {
    let timer;
    if (success || error) {
      timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            router.push('/');
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success, error, router]);

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Processing LinkedIn authentication...</p>
            </div>
          )}
          {error && (
            <div className="text-center">
              <p className="text-red-500 text-lg">{error}</p>
              <p className="mt-2">Redirecting to home in {countdown} seconds...</p>
            </div>
          )}
          {success && (
            <div className="text-center">
              <p className="text-green-500 text-lg">Authentication successful!</p>
              <p className="mt-2">Redirecting to home in {countdown} seconds...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={handleClose}>
            Close and return to home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main exported function for the page
export default function LinkedInCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LinkedInCallback />
    </Suspense>
  );
}