'use client';

import PriceManagementTable from '@/components/admin/PriceManagementTable';
import ImportPricesForm from '@/components/admin/ImportPricesForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';


export default function ManagePricesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/dashboard'); // Redirect if not admin
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'admin') {
    return <div className="text-center py-10">Loading or unauthorized...</div>;
  }
  
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                <FilePlus2 className="h-8 w-8" /> Price Administration
            </CardTitle>
            <CardDescription>
                Oversee and manage all public and internal freight prices. Add new rates or import bulk data.
            </CardDescription>
        </CardHeader>
      </Card>

      <PriceManagementTable />
      <Separator className="my-12"/>
      <ImportPricesForm />
    </div>
  );
}
