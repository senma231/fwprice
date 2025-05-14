'use client';

import InternalAnnouncements from '@/components/dashboard/InternalAnnouncements';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useAuth();

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
              Welcome back, {user?.name || user?.email}!
            </h1>
            <p className="text-lg text-slate-200 mt-1">
              Here's your FreightWise dashboard overview.
            </p>
          </div>
        </div>
      </Card>
      
      <InternalAnnouncements />
    </div>
  );
}
