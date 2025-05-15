
'use client'; 

import type { ReactNode } from 'react';
import { useEffect, use } from 'react'; // Added use
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'; 
import Logo from '@/components/Logo';
import type { Locale } from '@/lib/dictionaries';

export default function DashboardLayout({ 
  children,
  params // params might be a Promise here
}: { 
  children: ReactNode,
  params: Promise<{ lang: Locale }> // Updated to reflect it can be a Promise
}) {
  const resolvedParams = use(params); // Unwrap the params Promise
  const { lang } = resolvedParams; // Destructure lang from resolvedParams
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Returns path without locale, e.g. /dashboard

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${lang}/login`); // Use destructured lang
    }
  }, [user, isLoading, router, lang]); // Use destructured lang in dependency array

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
    <SidebarProvider defaultOpen> 
      <DashboardSidebar lang={lang} /> {/* Pass destructured lang */}
      <SidebarInset className="p-0"> 
        <div className="flex flex-col h-full">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 lg:hidden">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <Logo lang={lang} size="sm" /> {/* Pass destructured lang */}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
