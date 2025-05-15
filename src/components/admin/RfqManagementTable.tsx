
'use client';

import { useState, useEffect } from 'react';
import type { RfqSubmission } from '@/types/rfq';
import { fetchRfqs, updateRfqStatus } from '@/lib/dataService'; // Updated import
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, CheckCircle, Mail, Building, MapPin, WeightIcon, Package } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Locale } from '@/lib/dictionaries'; // For potential future use

interface RfqManagementTableProps {
  lang?: Locale; // Optional lang prop if dictionary keys are needed here directly
}

const RfqManagementTable = ({ lang }: RfqManagementTableProps) => {
  const [rfqs, setRfqs] = useState<RfqSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState<RfqSubmission | null>(null);

  const loadRfqs = async () => {
    setIsLoading(true);
    const data = await fetchRfqs();
    setRfqs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRfqs();
  }, []);

  const handleViewDetails = (rfq: RfqSubmission) => {
    setSelectedRfq(rfq);
  };

  const handleMarkAsContacted = async (rfqId: string) => {
    try {
      await updateRfqStatus(rfqId, 'Contacted');
      toast({ title: "RFQ Status Updated", description: "RFQ marked as contacted."});
      loadRfqs(); 
    } catch (error) {
      toast({ title: "Error Updating Status", description: "Could not update RFQ status.", variant: "destructive" });
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
      <h2 className="text-2xl font-semibold mb-6">Received RFQs</h2>

      <Dialog open={!!selectedRfq} onOpenChange={(isOpen) => !isOpen && setSelectedRfq(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>RFQ Details - ID: {selectedRfq?.submissionId}</DialogTitle>
            <DialogDescription>
              Submitted on {selectedRfq?.submittedAt ? format(new Date(selectedRfq.submittedAt), 'dd MMM yyyy, HH:mm') : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          {selectedRfq && (
            <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-4 py-4 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="flex items-center gap-1"><Mail className="w-4 h-4 text-primary" /> Name:</strong> {selectedRfq.name}</div>
                <div><strong className="flex items-center gap-1"><Mail className="w-4 h-4 text-primary" /> Email:</strong> {selectedRfq.email}</div>
                {selectedRfq.company && <div><strong className="flex items-center gap-1"><Building className="w-4 h-4 text-primary" /> Company:</strong> {selectedRfq.company}</div>}
              </div>
              <hr/>
              <h4 className="font-semibold text-lg mt-2">Shipment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> Origin:</strong> {selectedRfq.origin}</div>
                <div><strong className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> Destination:</strong> {selectedRfq.destination}</div>
                {selectedRfq.weight && <div><strong className="flex items-center gap-1"><WeightIcon className="w-4 h-4 text-primary" /> Weight:</strong> {selectedRfq.weight} kg</div>}
                {selectedRfq.freightType && <div><strong className="flex items-center gap-1"><Package className="w-4 h-4 text-primary" /> Freight Type:</strong> {selectedRfq.freightType}</div>}
              </div>
               {selectedRfq.message && (
                <>
                  <hr/>
                  <div>
                    <strong className="block mb-1">Additional Message:</strong>
                    <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{selectedRfq.message}</p>
                  </div>
                </>
              )}
            </div>
            </ScrollArea>
          )}
          <div className="flex justify-end pt-4">
            <Button onClick={() => setSelectedRfq(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No RFQs found.
                </TableCell>
              </TableRow>
            ) : (
              rfqs.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell className="font-mono text-xs">{rfq.submissionId?.split('-')[1] || rfq.id}</TableCell>
                  <TableCell className="font-medium max-w-[150px] truncate" title={rfq.name}>{rfq.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={rfq.email}>{rfq.email}</TableCell>
                  <TableCell>{rfq.origin}</TableCell>
                  <TableCell>{rfq.destination}</TableCell>
                  <TableCell>{format(new Date(rfq.submittedAt), 'dd MMM yy, HH:mm')}</TableCell>
                  <TableCell>
                    <Badge variant={rfq.status === 'New' ? 'destructive' : 'secondary'}>
                      {rfq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                       <Button variant="outline" size="icon" onClick={() => handleViewDetails(rfq)} title="View Details">
                        <Eye className="h-4 w-4" />
                         <span className="sr-only">View</span>
                      </Button>
                      {rfq.status === 'New' && (
                        <Button variant="default" size="icon" onClick={() => handleMarkAsContacted(rfq.id)} title="Mark as Contacted">
                          <CheckCircle className="h-4 w-4" />
                           <span className="sr-only">Mark Contacted</span>
                        </Button>
                      )}
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

export default RfqManagementTable;
