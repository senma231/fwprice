'use client';

import { useState, useEffect } from 'react';
import type { Announcement } from '@/types/announcement';
import { fetchAnnouncements, deleteAnnouncement as apiDeleteAnnouncement } from '@/lib/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import AnnouncementForm from './AnnouncementForm';
import { Pencil, Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import type { Locale } from '@/lib/dictionaries';

interface AnnouncementManagementTableProps {
  lang: Locale;
}

const AnnouncementManagementTable = ({ lang }: AnnouncementManagementTableProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [dict, setDict] = useState<any>(null);
  const [commonDict, setCommonDict] = useState<any>(null);
  const [toastDict, setToastDict] = useState<any>(null);


  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true);
      try {
        // Corrected relative path
        const localeDict = (await import(`../../../locales/${lang}.json`)).default;
        setDict(localeDict.adminPages.announcementManagement);
        setCommonDict(localeDict.common);
        setToastDict(localeDict.toasts);

        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to load resources", error);
        // Fallback to English if dictionary loading fails
        // Corrected relative path for fallback
        const enDict = (await import(`../../../locales/en.json`)).default;
        setDict(enDict.adminPages.announcementManagement);
        setCommonDict(enDict.common);
        setToastDict(enDict.toasts);
      }
      setIsLoading(false);
    };
    loadResources();
  }, [lang]);

  const loadAnnouncements = async () => {
    setIsLoading(true); // Keep this to show loading for announcement list specifically
    const data = await fetchAnnouncements();
    setAnnouncements(data);
    setIsLoading(false);
  };


  const handleAnnouncementCreatedOrUpdated = () => {
    loadAnnouncements();
    setIsCreateModalOpen(false);
    setEditingAnnouncement(null);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsCreateModalOpen(true);
  };
  
  const openDeleteConfirm = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
  };

  const handleDeleteAnnouncement = async () => {
    if (!announcementToDelete || !toastDict) return;
    try {
      await apiDeleteAnnouncement(announcementToDelete.id);
      toast({ 
        title: toastDict.announcementDeleted, 
        description: toastDict.announcementDeletedDesc.replace('{title}', announcementToDelete.title)
      });
      setAnnouncementToDelete(null);
      loadAnnouncements();
    } catch (error) {
      toast({ 
        title: toastDict.errorDeletingAnnouncement, 
        description: toastDict.couldNotDeleteAnnouncement, 
        variant: "destructive" 
      });
    }
  };

  if (isLoading || !dict || !commonDict) {
    return (
        <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded-md bg-muted"></div>
            <div className="h-40 w-full animate-pulse rounded-md bg-muted"></div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{dict.manageTitle}</h2>
        <Button onClick={() => { setEditingAnnouncement(null); setIsCreateModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> {dict.createButton}
        </Button>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={(isOpen) => {
        setIsCreateModalOpen(isOpen);
        if (!isOpen) setEditingAnnouncement(null);
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? dict.editModalTitle : dict.createModalTitle}</DialogTitle>
            <DialogDescription>
              {editingAnnouncement ? dict.editModalDesc : dict.createModalDesc}
            </DialogDescription>
          </DialogHeader>
          <AnnouncementForm 
            lang={lang}
            onSuccess={handleAnnouncementCreatedOrUpdated} 
            existingAnnouncement={editingAnnouncement}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!announcementToDelete} onOpenChange={(isOpen) => !isOpen && setAnnouncementToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>{dict.deleteConfirmTitle}</DialogTitle>
            <DialogDescription>
               {dict.deleteConfirmDesc.replace('{title}', announcementToDelete?.title || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{commonDict.cancel}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteAnnouncement}>{commonDict.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.tableTitle}</TableHead>
              <TableHead>{dict.tableAuthor}</TableHead>
              <TableHead>{dict.tableCreatedAt}</TableHead>
              <TableHead>{commonDict.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {dict.noAnnouncementsFound}
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell className="font-medium max-w-xs truncate" title={ann.title}>{ann.title}</TableCell>
                  <TableCell>{ann.authorName || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(ann.createdAt), 'dd MMM yyyy, HH:mm')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                       <Button variant="outline" size="icon" onClick={() => openEditModal(ann)} title={commonDict.edit}>
                        <Pencil className="h-4 w-4" />
                         <span className="sr-only">{commonDict.edit}</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => openDeleteConfirm(ann)} title={commonDict.delete}>
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">{commonDict.delete}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AnnouncementManagementTable;
