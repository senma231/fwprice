'use client';

import AnnouncementManagementTable from '@/components/admin/AnnouncementManagementTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export default function AnnouncementManagementPage() {
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
                <Megaphone className="h-8 w-8" /> Announcement Management
            </CardTitle>
            <CardDescription>
                Create, edit, and publish internal announcements for FreightWise agents.
            </CardDescription>
        </CardHeader>
      </Card>
      <AnnouncementManagementTable />
    </div>
  );
}
