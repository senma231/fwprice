'use client';

import { useState, useEffect } from 'react';
import type { Price } from '@/types/freight';
import { fetchAllPrices, deletePrice as apiDeletePrice } from '@/lib/mockData';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import CreatePriceForm from './CreatePriceForm'; // We'll create this next
import { Pencil, Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";

const PriceManagementTable = () => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [priceToDelete, setPriceToDelete] = useState<Price | null>(null);


  const loadPrices = async () => {
    setIsLoading(true);
    const data = await fetchAllPrices();
    setPrices(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPrices();
  }, []);

  const handlePriceCreatedOrUpdated = () => {
    loadPrices();
    setIsCreateModalOpen(false);
    setEditingPrice(null);
  };

  const openEditModal = (price: Price) => {
    setEditingPrice(price);
    setIsCreateModalOpen(true);
  };
  
  const openDeleteConfirm = (price: Price) => {
    setPriceToDelete(price);
  };

  const handleDeletePrice = async () => {
    if (!priceToDelete) return;
    try {
      await apiDeletePrice(priceToDelete.id);
      toast({ title: "Price Deleted", description: `Price from ${priceToDelete.origin} to ${priceToDelete.destination} has been deleted.`});
      setPriceToDelete(null);
      loadPrices();
    } catch (error) {
      toast({ title: "Error Deleting Price", description: "Could not delete the price. Please try again.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
            <div className="h-64 w-full animate-pulse rounded-md bg-muted"></div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Prices</h2>
        <Button onClick={() => { setEditingPrice(null); setIsCreateModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Price
        </Button>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={(isOpen) => {
          setIsCreateModalOpen(isOpen);
          if (!isOpen) setEditingPrice(null); // Reset editing state when closing
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingPrice ? 'Edit Price' : 'Create New Price'}</DialogTitle>
            <DialogDescription>
              {editingPrice ? 'Update the details for this price.' : 'Fill in the details to add a new freight price.'}
            </DialogDescription>
          </DialogHeader>
          <CreatePriceForm 
            onSuccess={handlePriceCreatedOrUpdated} 
            existingPrice={editingPrice}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!priceToDelete} onOpenChange={(isOpen) => !isOpen && setPriceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the price from <strong>{priceToDelete?.origin}</strong> to <strong>{priceToDelete?.destination}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeletePrice}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No prices found. Add some!
                </TableCell>
              </TableRow>
            ) : (
              prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">{price.origin}</TableCell>
                  <TableCell>{price.destination}</TableCell>
                  <TableCell>{price.amount.toLocaleString(undefined, { style: 'currency', currency: price.currency })}</TableCell>
                  <TableCell>
                    <Badge variant={price.type === 'public' ? 'secondary' : 'default'}>
                      {price.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {price.validFrom ? format(new Date(price.validFrom), 'dd MMM yy') : 'N/A'} - {price.validTo ? format(new Date(price.validTo), 'dd MMM yy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditModal(price)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => openDeleteConfirm(price)}>
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

export default PriceManagementTable;
