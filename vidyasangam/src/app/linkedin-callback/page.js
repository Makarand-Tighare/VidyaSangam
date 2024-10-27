'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function LinkedInCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (code && state && !hasFetched.current) {
      console.log('Fetching LinkedIn access token...');
      hasFetched.current = true;

      fetch('/api/linkedin/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      })
        .then((response) => response.json())
        .then((data) => {
          setLoading(false);
          if (data.accessToken) {
            console.log('Access Token:', data.accessToken);
            setSuccess(true);
          } else {
            setError(data.error || 'Unknown error occurred');
          }
        })
        .catch((err) => {
          setLoading(false);
          setError('Failed to fetch access token: ' + err.message);
        });
    } else if (!code || !state) {
      setLoading(false);
      setError('Invalid authentication parameters');
    }
  }, [code, state]);

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
