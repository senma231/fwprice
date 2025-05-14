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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { submitRfq, type RfqInput } from '@/ai/flows/submit-rfq-flow';
import { Send } from 'lucide-react';

const rfqFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  company: z.string().optional(),
  origin: z.string().min(2, 'Origin must be at least 2 characters.'),
  destination: z.string().min(2, 'Destination must be at least 2 characters.'),
  weight: z.coerce.number().positive('Weight must be a positive number.').optional().or(z.literal('')),
  freightType: z.enum(['sea', 'air', 'land', '']).optional(),
  message: z.string().max(500, 'Message cannot exceed 500 characters.').optional(),
});

type RfqFormData = z.infer<typeof rfqFormSchema>;

interface RfqFormProps {
  lang: string;
  dict: any; // from rfqForm namespace
  commonDict: any; // from common namespace
}

export default function RfqForm({ lang, dict, commonDict }: RfqFormProps) {
  const form = useForm<RfqFormData>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      origin: '',
      destination: '',
      weight: '',
      freightType: '',
      message: '',
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: RfqFormData) => {
    try {
      const rfqInput: RfqInput = {
        ...data,
        weight: data.weight ? Number(data.weight) : undefined,
        freightType: data.freightType as RfqInput['freightType'],
      };
      const result = await submitRfq(rfqInput); // AI message likely still in default language
      toast({
        title: dict.inquirySentTitle,
        description: result.message, // This part comes from AI, may not be translated unless AI flow is updated
      });
      form.reset();
    } catch (error) {
      console.error('RFQ submission error:', error);
      toast({
        title: dict.submissionFailedTitle,
        description: dict.submissionFailedDesc,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.nameLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={dict.namePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.emailLabel}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={dict.emailPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.companyLabel}</FormLabel>
              <FormControl>
                <Input placeholder={dict.companyPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.originLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={dict.originPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.destinationLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={dict.destinationPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.weightLabel}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder={dict.weightPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="freightType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.freightTypeLabel}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={commonDict.selectType} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sea">{commonDict.seaFreight}</SelectItem>
                    <SelectItem value="air">{commonDict.airFreight}</SelectItem>
                    <SelectItem value="land">{commonDict.landFreight}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.messageLabel}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={dict.messagePlaceholder}
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            <Send className="mr-2 h-5 w-5" />
            {isSubmitting ? dict.submittingButton : dict.submitButton}
          </Button>
        </div>
      </form>
    </Form>
  );
}
