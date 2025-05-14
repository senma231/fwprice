'use client'; 

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'; 
import Logo from '@/components/Logo';
import type { Locale } from '@/lib/dictionaries'; // Assuming getDictionary is not used directly here but lang is passed

// For client components, dictionary is typically passed as prop
// Or a client-side i18n provider is used. Here, we'll assume relevant dict parts are passed to children if needed.

export default function DashboardLayout({ 
  children,
  params 
}: { 
  children: ReactNode,
  params: { lang: Locale }
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Returns path without locale, e.g. /dashboard

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${params.lang}/login`);
    }
  }, [user, isLoading, router, params.lang]);

  // Dictionary for this layout's own text (e.g. "Loading dashboard...") would ideally come from props
  // For now, let's use hardcoded or assume a parent passes it.
  // This layout primarily structures, children pages will load their full dicts.
  // Let's assume a small dict part for "Loading dashboard..." and "Dashboard" could be passed or fetched by a parent.
  // For simplicity, will keep static text or pass if crucial.

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {/* This text should be from a dictionary if this component were server-rendered with one */}
            <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen> 
      <DashboardSidebar lang={params.lang} /> {/* Pass lang to sidebar for link generation and potentially its own dict */}
      <SidebarInset className="p-0"> 
        <div className="flex flex-col h-full">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 lg:hidden">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <Logo lang={params.lang} size="sm" />
            </div>
            {/* <h1 className="text-lg font-semibold">Dashboard</h1> Use dict if available */}
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
