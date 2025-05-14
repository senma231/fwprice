'use client';

import { useEffect, useState } from 'react';
import type { Announcement } from '@/types/announcement';
import { fetchAnnouncements } from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Megaphone } from 'lucide-react';

const InternalAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      setIsLoading(true);
      const data = await fetchAnnouncements();
      setAnnouncements(data);
      setIsLoading(false);
    };
    loadAnnouncements();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-6 w-6 text-primary" /> Latest Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-6 w-6 text-primary" /> Latest Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No announcements at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl"><Megaphone className="h-7 w-7 text-primary" /> Latest Announcements</CardTitle>
        <CardDescription>Stay updated with the latest news and updates for agents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {announcements.map((ann) => (
          <div key={ann.id} className="p-4 border bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-primary">{ann.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Posted by {ann.authorName || 'Admin'} on {format(new Date(ann.createdAt), 'MMMM d, yyyy HH:mm')}
            </p>
            <p className="text-foreground/90 whitespace-pre-line">{ann.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InternalAnnouncements;
