'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Announcement } from '@/types/announcement';
import { createAnnouncement, updateAnnouncement } from '@/lib/mockData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";
import { DialogFooter, DialogClose } from '@/components/ui/dialog';

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  onSuccess: () => void;
  existingAnnouncement?: Announcement | null;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ onSuccess, existingAnnouncement }) => {
  const { user } = useAuth();
  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: existingAnnouncement ? {
      title: existingAnnouncement.title,
      content: existingAnnouncement.content,
    } : {
      title: '',
      content: '',
    },
  });

  const { formState: {isSubmitting} } = form;

  const onSubmit = async (data: AnnouncementFormData) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to perform this action.", variant: "destructive"});
      return;
    }
    
    const announcementData = { 
      ...data, 
      authorId: user.id, 
      authorName: user.name || user.email 
    };

    try {
      if (existingAnnouncement) {
        await updateAnnouncement(existingAnnouncement.id, announcementData);
        toast({ title: "Announcement Updated", description: "The announcement has been successfully updated."});
      } else {
        await createAnnouncement(announcementData);
        toast({ title: "Announcement Created", description: "The new announcement has been published."});
      }
      onSuccess();
    } catch (error) {
      toast({ title: existingAnnouncement ? "Update Failed" : "Creation Failed", description: "An error occurred. Please try again.", variant: "destructive"});
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter announcement title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter announcement details..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
            <DialogClose asChild>
             <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (existingAnnouncement ? 'Updating...' : 'Publishing...') : (existingAnnouncement ? 'Save Changes' : 'Publish Announcement')}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AnnouncementForm;
