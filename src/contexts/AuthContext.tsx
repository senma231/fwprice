'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as authService from '@/lib/authService';
import type { User, AuthState } from '@/types/auth';
// Toaster and useToast are removed from here, will be handled by components using auth actions.

export const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // usePathname returns path without locale

  const getCurrentLocaleFromPath = () => {
    // Pathname does not include locale, so we need to extract it from window.location if client side
    // Or rely on it being passed if server side (not applicable here as it's a client context)
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/');
      if (pathSegments.length > 1 && (pathSegments[1] === 'en' || pathSegments[1] === 'zh')) {
        return pathSegments[1];
      }
    }
    return 'en'; // Fallback default locale
  };


  const initializeAuth = useCallback(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const lang = getCurrentLocaleFromPath();
    if (!isLoading && !user && !pathname.startsWith('/login') && pathname !== '/') {
      // Pathname is like /dashboard, so we need to prefix with lang for redirect
      router.push(`/${lang}/login`);
    }
  }, [user, isLoading, router, pathname]);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(email, pass);
      setUser(loggedInUser); // Set user whether login is successful or not (null if failed)
      if (loggedInUser) {
        const lang = getCurrentLocaleFromPath();
        router.push(`/${lang}/dashboard`);
        return loggedInUser;
      }
      return null; // Explicitly return null for failed login (invalid creds)
    } catch (error) {
      console.error("Login error:", error);
      setUser(null); // Ensure user is null on error
      // For other errors (network, server), we re-throw or return null
      // The component calling login can then show a generic error toast
      throw error; // Re-throw for the component to handle specific error display if needed
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsLoading(false);
    const lang = getCurrentLocaleFromPath();
    router.push(`/${lang}/login`);
    // Toast is handled by the component initiating logout (e.g., AppNavbar)
  };

  const contextValue: AuthState = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {/* Toaster component is now in RootLayout to ensure it's available globally */}
    </AuthContext.Provider>
  );
};
