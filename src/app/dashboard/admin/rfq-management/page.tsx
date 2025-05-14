'use client';

import RfqManagementTable from '@/components/admin/RfqManagementTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function RfqManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/dashboard');
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
                <ClipboardList className="h-8 w-8" /> RFQ Management
            </CardTitle>
            <CardDescription>
                Review and manage incoming Requests for Quotation (RFQs) from potential customers.
            </CardDescription>
        </CardHeader>
      </Card>
      <RfqManagementTable />
    </div>
  );
}
