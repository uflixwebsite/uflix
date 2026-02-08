'use client';

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { getCurrentUser } from '@/services/authService';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: any | null;
  userRole: string | null;
  isAdmin: boolean;
  isLoaded: boolean;
}

/**
 * Three-state auth hook that prevents navigation during hydration.
 * 
 * States:
 * - loading: Auth is still hydrating, DO NOT redirect or navigate
 * - authenticated: User is signed in and data is loaded
 * - unauthenticated: User is definitely not signed in
 * 
 * Usage:
 * const { status, user, userRole, isAdmin } = useAuthState();
 * 
 * if (status === 'loading') return <LoadingSpinner />;
 * if (status === 'unauthenticated') router.push('/sign-in');
 */
export function useAuthState(): AuthState {
  const { isSignedIn, user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    user: null,
    userRole: null,
    isAdmin: false,
    isLoaded: false,
  });

  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!clerkLoaded) {
      return;
    }

    // If not signed in, immediately set unauthenticated
    if (!isSignedIn || !clerkUser) {
      setAuthState({
        status: 'unauthenticated',
        user: null,
        userRole: null,
        isAdmin: false,
        isLoaded: true,
      });
      return;
    }

    // User is signed in, fetch backend data
    const fetchUserData = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setAuthState({
            status: 'unauthenticated',
            user: null,
            userRole: null,
            isAdmin: false,
            isLoaded: true,
          });
          return;
        }

        const userData = await getCurrentUser();
        const role = userData.data?.role || 'user';
        
        setAuthState({
          status: 'authenticated',
          user: userData.data,
          userRole: role,
          isAdmin: role === 'admin',
          isLoaded: true,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        // On error, still mark as authenticated but with limited data
        setAuthState({
          status: 'authenticated',
          user: {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            name: clerkUser.fullName,
          },
          userRole: 'user',
          isAdmin: false,
          isLoaded: true,
        });
      }
    };

    fetchUserData();
  }, [clerkLoaded, isSignedIn, clerkUser, getToken]);

  return authState;
}
