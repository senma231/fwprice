'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types/auth';
import * as authService from '@/lib/authService'; // Using mock service
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import CreateUserForm from './CreateUserForm';
import { Pencil, Trash2, UserPlus2, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const UserManagementTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await authService.getAllUsers();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUserCreatedOrUpdated = () => {
    loadUsers();
    setIsCreateModalOpen(false);
    setEditingUser(null);
  };
  
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsCreateModalOpen(true);
  };

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await authService.deleteUser(userToDelete.id);
      toast({ title: "User Deleted", description: `User ${userToDelete.name} (${userToDelete.email}) has been deleted.`});
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      toast({ title: "Error Deleting User", description: "Could not delete the user. Please try again.", variant: "destructive" });
    }
  };


  if (isLoading) {
     return (
        <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
            <div className="h-40 w-full animate-pulse rounded-md bg-muted"></div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Users</h2>
        <Button onClick={() => { setEditingUser(null); setIsCreateModalOpen(true); }}>
          <UserPlus2 className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={(isOpen) => {
        setIsCreateModalOpen(isOpen);
        if(!isOpen) setEditingUser(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user details.' : 'Add a new internal user to the system.'}
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm 
            onSuccess={handleUserCreatedOrUpdated}
            existingUser={editingUser}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    No users found.
                    </TableCell>
                </TableRow>
            ) : (
                users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    </TableCell>
                    <TableCell>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEditModal(user)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => openDeleteConfirm(user)}>
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

export default UserManagementTable;
