'use client';

import UserManagementTable from '@/components/admin/UserManagementTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2 } from 'lucide-react';
import type { Locale } from '@/lib/dictionaries';

interface UserManagementPageProps {
  params: { lang: Locale };
}

export default function UserManagementPage({ params }: UserManagementPageProps) {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [dict, setDict] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDict = async () => {
      setIsLoading(true);
      const messages = (await import(`@/locales/${params.lang}.json`)).default;
      setDict(messages.adminPages.userManagement);
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
                <Users2 className="h-8 w-8" /> {dict.title}
            </CardTitle>
            <CardDescription>
                {dict.description}
            </CardDescription>
        </CardHeader>
      </Card>
      <UserManagementTable lang={params.lang} />
    </div>
  );
}
