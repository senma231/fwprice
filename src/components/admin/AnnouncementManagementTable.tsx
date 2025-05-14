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

const AnnouncementManagementTable = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);


  const loadAnnouncements = async () => {
    setIsLoading(true);
    const data = await fetchAnnouncements();
    setAnnouncements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

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
    if (!announcementToDelete) return;
    try {
      await apiDeleteAnnouncement(announcementToDelete.id);
      toast({ title: "Announcement Deleted", description: `Announcement "${announcementToDelete.title}" has been deleted.`});
      setAnnouncementToDelete(null);
      loadAnnouncements();
    } catch (error) {
      toast({ title: "Error Deleting Announcement", description: "Could not delete the announcement. Please try again.", variant: "destructive" });
    }
  };

  if (isLoading) {
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
        <h2 className="text-2xl font-semibold">Manage Announcements</h2>
        <Button onClick={() => { setEditingAnnouncement(null); setIsCreateModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Announcement
        </Button>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={(isOpen) => {
        setIsCreateModalOpen(isOpen);
        if (!isOpen) setEditingAnnouncement(null);
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
            <DialogDescription>
              {editingAnnouncement ? 'Update the details for this announcement.' : 'Compose a new internal announcement.'}
            </DialogDescription>
          </DialogHeader>
          <AnnouncementForm 
            onSuccess={handleAnnouncementCreatedOrUpdated} 
            existingAnnouncement={editingAnnouncement}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!announcementToDelete} onOpenChange={(isOpen) => !isOpen && setAnnouncementToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the announcement: <strong>"{announcementToDelete?.title}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteAnnouncement}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No announcements found. Create one!
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
                       <Button variant="outline" size="icon" onClick={() => openEditModal(ann)}>
                        <Pencil className="h-4 w-4" />
                         <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => openDeleteConfirm(ann)}>
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete</span>
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
