'use client';

import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useAuthState } from '@/hooks/useAuthState';
import api from '@/services/api';

export default function UserSync() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { status } = useAuthState();
  const syncedRef = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      // Wait for auth to finish loading
      if (status === 'loading' || !isLoaded || !isSignedIn || !user || syncedRef.current) {
        return;
      }

      try {
        syncedRef.current = true;
        
        // Get token using Clerk's useAuth hook
        const token = await getToken();
        console.log('Token retrieved:', token ? 'Yes' : 'No');
        
        await api.post('/auth/sync');
        console.log('User synced to MongoDB');
      } catch (error: any) {
        console.error('Failed to sync user:', error);
        console.error('Error details:', error.response?.data);
        syncedRef.current = false;
      }
    };

    syncUser();
  }, [status, isSignedIn, user, isLoaded, getToken]);

  return null;
}
