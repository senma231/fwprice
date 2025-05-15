
'use client';

import PriceManagementTable from '@/components/admin/PriceManagementTable';
import ImportPricesForm from '@/components/admin/ImportPricesForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Locale } from '@/lib/dictionaries';

interface ManagePricesPageProps {
  params: { lang: Locale };
}

export default function ManagePricesPage({ params }: ManagePricesPageProps) {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [dict, setDict] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDict = async () => {
      setIsLoading(true);
      // Corrected relative path to the locales directory
      const messages = (await import(`../../../../../../locales/${params.lang}.json`)).default;
      setDict(messages.adminPages.priceManagement);
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
                <FilePlus2 className="h-8 w-8" /> {dict.title}
            </CardTitle>
            <CardDescription>
                {dict.description}
            </CardDescription>
        </CardHeader>
      </Card>

      <PriceManagementTable lang={params.lang} />
      <Separator className="my-12"/>
      <ImportPricesForm lang={params.lang} />
    </div>
  );
}
