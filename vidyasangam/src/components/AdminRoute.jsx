"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin, isLoggedIn } from '@/app/lib/auth';

export default function AdminRoute({ children }) {
  const router = useRouter();
  
  useEffect(() => {
    // Check authentication and admin status
    if (!isLoggedIn()) {
      // Redirect to login if not logged in
      router.push('/login');
    } else if (!isAdmin()) {
      // Redirect to home if logged in but not admin
      router.push('/');
    }
  }, [router]);
  
  return children;
} 