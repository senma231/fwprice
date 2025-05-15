
'use client'; // Keep as client component due to useAuth hook

import InternalAnnouncements from '@/components/dashboard/InternalAnnouncements';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { useEffect, useState, use } from 'react'; // Added use
import type { Locale } from '@/lib/dictionaries';

interface DashboardPageProps {
  params: Promise<{ lang: Locale }>; // Updated to Promise
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = use(params); // Unwrap the params Promise
  const { lang } = resolvedParams; // Destructure lang from resolvedParams

  const { user } = useAuth();
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    const loadDict = async () => {
      // Corrected path: from src/app/[lang]/dashboard/page.tsx to root/locales/
      const messages = (await import(`../../../../locales/${lang}.json`)).default; // Use destructured lang
      setDict(messages.dashboardPage);
    };
    loadDict();
  }, [lang]); // Use destructured lang in dependency array

  if (!dict) {
    return <div className="text-center py-10">Loading...</div>; // Or a skeleton
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg">
        <div className="relative h-48 md:h-64 w-full">
          <Image 
            src="https://picsum.photos/seed/dashboard/1200/400" 
            alt="Dashboard Welcome Banner" 
            layout="fill" 
            objectFit="cover"
            priority
            data-ai-hint="office city"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {dict.welcomeBack.replace('{name}', user?.name || user?.email || 'User')}
            </h1>
            <p className="text-lg text-slate-200 mt-1">
              {dict.dashboardOverview}
            </p>
          </div>
        </div>
      </Card>
      
      <InternalAnnouncements lang={lang} /> {/* Use destructured lang */}
    </div>
  );
}
