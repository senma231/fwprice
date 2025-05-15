
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
import { createAnnouncement, updateAnnouncement } from '@/lib/dataService'; // Updated import
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Locale } from '@/lib/dictionaries';
import { useEffect, useState } from 'react';

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  onSuccess: () => void;
  existingAnnouncement?: Announcement | null;
  lang: Locale;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ onSuccess, existingAnnouncement, lang }) => {
  const { user } = useAuth();
  const [dict, setDict] = useState<any>(null);
  const [commonDict, setCommonDict] = useState<any>(null);
  
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

  useEffect(() => {
    const loadDict = async () => {
      const messages = (await import(`../../../locales/${lang}.json`)).default;
      setDict(messages.forms.announcement);
      setCommonDict(messages.common);
    };
    loadDict();
  }, [lang]);

  const { formState: {isSubmitting} } = form;

  const onSubmit = async (data: AnnouncementFormData) => {
    if (!user || !dict) {
      toast({ title: dict?.authError || "Authentication Error", description: dict?.authErrorDesc || "You must be logged in.", variant: "destructive"});
      return;
    }
    
    const announcementData = { 
      ...data, 
      authorId: user.id, 
      authorName: user.name || user.email || 'System'
    };

    try {
      if (existingAnnouncement) {
        await updateAnnouncement(existingAnnouncement.id, announcementData);
        toast({ title: dict.updatedMsg, description: dict.updatedDesc});
      } else {
        await createAnnouncement(announcementData);
        toast({ title: dict.createdMsg, description: dict.createdDesc});
      }
      onSuccess();
    } catch (error) {
      toast({ title: existingAnnouncement ? dict.updateFailed : dict.creationFailed, description: dict.genericError, variant: "destructive"});
    }
  };
  
  if (!dict || !commonDict) return <div>{commonDict?.loading || "Loading..."}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.titleLabel}</FormLabel>
              <FormControl>
                <Input placeholder={dict.titlePlaceholder} {...field} />
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
              <FormLabel>{dict.contentLabel}</FormLabel>
              <FormControl>
                <Textarea placeholder={dict.contentPlaceholder} {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
            <DialogClose asChild>
             <Button type="button" variant="outline" disabled={isSubmitting}>{commonDict.cancel}</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (existingAnnouncement ? dict.updatingButton : dict.publishingButton) : (existingAnnouncement ? dict.saveButton : dict.publishButton)}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AnnouncementForm;
