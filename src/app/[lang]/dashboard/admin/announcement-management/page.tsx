
'use client';

import AnnouncementManagementTable from '@/components/admin/AnnouncementManagementTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import type { Locale } from '@/lib/dictionaries';

interface AnnouncementManagementPageProps {
  params: { lang: Locale };
}

export default function AnnouncementManagementPage({ params }: AnnouncementManagementPageProps) {
  const { lang } = params; // Destructure lang from params
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [dict, setDict] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDict = async () => {
      setIsLoading(true);
      // Corrected relative path
      const messages = (await import(`../../../../../../locales/${lang}.json`)).default;
      setDict(messages.adminPages.announcementManagement);
      setIsLoading(false);
    };
    loadDict();
  }, [lang]); // Use destructured lang in dependency array

  useEffect(() => {
    if (!authIsLoading && user?.role !== 'admin') {
      router.push(`/${lang}/dashboard`);
    }
  }, [user, authIsLoading, router, lang]); // Use destructured lang in dependency array

  if (authIsLoading || isLoading || !dict || user?.role !== 'admin') {
    return <div className="text-center py-10">Loading or unauthorized...</div>;
  }
  
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                <Megaphone className="h-8 w-8" /> {dict.title}
            </CardTitle>
            <CardDescription>
                {dict.description}
            </CardDescription>
        </CardHeader>
      </Card>
      <AnnouncementManagementTable lang={lang} /> {/* Use destructured lang */}
    </div>
  );
}
