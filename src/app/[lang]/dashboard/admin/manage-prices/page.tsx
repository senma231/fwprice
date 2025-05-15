
'use client';

import PriceManagementTable from '@/components/admin/PriceManagementTable';
import ImportPricesForm from '@/components/admin/ImportPricesForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react'; // Added use
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Locale } from '@/lib/dictionaries';

interface ManagePricesPageProps {
  params: Promise<{ lang: Locale }>; // Updated to Promise
}

export default function ManagePricesPage({ params }: ManagePricesPageProps) {
  const resolvedParams = use(params); // Unwrap the params Promise
  const { lang } = resolvedParams; // Destructure lang from resolvedParams

  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [dict, setDict] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDict = async () => {
      setIsLoading(true);
      // Use destructured lang
      const messages = (await import(`../../../../../../locales/${lang}.json`)).default;
      setDict(messages.adminPages.priceManagement);
      setIsLoading(false);
    };
    loadDict();
  }, [lang]); // Use destructured lang

  useEffect(() => {
    if (!authIsLoading && user?.role !== 'admin') {
      // Use destructured lang
      router.push(`/${lang}/dashboard`);
    }
  }, [user, authIsLoading, router, lang]); // Use destructured lang

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

      <PriceManagementTable lang={lang} /> {/* Use destructured lang */}
      <Separator className="my-12"/>
      <ImportPricesForm lang={lang} /> {/* Use destructured lang */}
    </div>
  );
}
