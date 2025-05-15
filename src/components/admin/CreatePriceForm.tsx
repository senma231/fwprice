
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form
} from '@/components/ui/form';
import PriceFormFields from './PriceFormFields'; 
import type { Price } from '@/types/freight';
import { createPrice, updatePrice } from '@/lib/dataService'; // Updated import
import { toast } from "@/hooks/use-toast";
import { DialogFooter, DialogClose } from '@/components/ui/dialog';


const priceFormSchema = z.object({
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().min(3, "Currency code is required (e.g., USD)").max(3),
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
  type: z.enum(["public", "internal"], { required_error: "Price type is required" }),
  carrier: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
    if (data.validFrom && data.validTo) {
        return data.validTo >= data.validFrom;
    }
    return true;
}, {
    message: "Valid To date must be after or same as Valid From date.",
    path: ["validTo"],
});


type PriceFormData = z.infer<typeof priceFormSchema>;

interface CreatePriceFormProps {
  onSuccess: () => void;
  existingPrice?: Price | null;
}

const CreatePriceForm: React.FC<CreatePriceFormProps> = ({ onSuccess, existingPrice }) => {
  const form = useForm<PriceFormData>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: existingPrice ? {
      ...existingPrice,
      amount: Number(existingPrice.amount), 
      validFrom: existingPrice.validFrom ? new Date(existingPrice.validFrom) : undefined,
      validTo: existingPrice.validTo ? new Date(existingPrice.validTo) : undefined,
    } : {
      origin: '',
      destination: '',
      amount: 0,
      currency: 'USD',
      type: 'public',
      carrier: '',
      notes: '',
    },
  });

  const {formState: {isSubmitting}} = form;

  const onSubmit = async (data: PriceFormData) => {
    try {
      const pricePayload = {
          ...data,
          // Ensure optional date fields are null if not provided, or correct Date object
          validFrom: data.validFrom || undefined,
          validTo: data.validTo || undefined,
      };
      if (existingPrice) {
        await updatePrice(existingPrice.id, pricePayload);
        toast({ title: "Price Updated", description: "The price details have been successfully updated." });
      } else {
        await createPrice(pricePayload);
        toast({ title: "Price Created", description: "The new price has been successfully added." });
      }
      onSuccess();
    } catch (error) {
       toast({ title: existingPrice ? "Update Failed" : "Creation Failed", description: "An error occurred. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PriceFormFields control={form.control} />
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (existingPrice ? 'Updating...' : 'Creating...') : (existingPrice ? 'Save Changes' : 'Create Price')}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CreatePriceForm;
