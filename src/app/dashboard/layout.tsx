'use client'; // This layout needs to be a client component for auth checks & sidebar interactivity

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'; // Using the provided custom sidebar
import { Skeleton } from '@/components/ui/skeleton';
import Logo from '@/components/Logo';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen> {/* Ensures sidebar is open by default on desktop */}
      <DashboardSidebar />
      <SidebarInset className="p-0"> {/* Remove default padding from SidebarInset */}
        <div className="flex flex-col h-full">
          {/* This header is for mobile view, the main AppNavbar handles desktop */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 lg:hidden">
            <SidebarTrigger className="md:hidden" />
            {/* Re-add Logo here specifically for mobile dashboard header, or use a simpler title */}
            <div className="flex-1">
              <Logo size="sm" />
            </div>
            {/* <h1 className="text-lg font-semibold">Dashboard</h1> */}
          </header>
          {/* Adjust main content area to account for AppNavbar height */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
