'use client';

import RfqManagementTable from '@/components/admin/RfqManagementTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import type { Locale } from '@/lib/dictionaries';

interface RfqManagementPageProps {
  params: { lang: Locale };
}

export default function RfqManagementPage({ params }: RfqManagementPageProps) {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [dict, setDict] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDict = async () => {
      setIsLoading(true);
      const messages = (await import(`@/locales/${params.lang}.json`)).default;
      setDict(messages.adminPages.rfqManagement);
      setIsLoading(false);
    };
    loadDict();
  }, [params.lang]);

  useEffect(() => {
    if (!authIsLoading && user?.role !== 'admin') {
      router.push(`/${params.lang}/dashboard`);
    }
  }, [user, authIsLoading, router, params.lang]);

  if (authIsLoading || isLoading || !dict || user?.role !== 'admin') {
    return <div className="text-center py-10">Loading or unauthorized...</div>;
  }
  
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                <ClipboardList className="h-8 w-8" /> {dict.title}
            </CardTitle>
            <CardDescription>
                {dict.description}
            </CardDescription>
        </CardHeader>
      </Card>
      <RfqManagementTable lang={params.lang} />
    </div>
  );
}
