'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileText } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const importSchema = z.object({
  priceFile: z.custom<FileList>()
    .refine((files) => files && files.length > 0, "Price file is required.")
    .refine((files) => files && files[0]?.type === "text/csv", "Only CSV files are accepted."), // Example: CSV only
});

type ImportFormData = z.infer<typeof importSchema>;

const ImportPricesForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
  });

  const onSubmit = async (data: ImportFormData) => {
    setIsLoading(true);
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Importing file:', data.priceFile[0].name);
    toast({ title: "Import Started", description: `Processing ${data.priceFile[0].name}. This is a mock action.` });
    setIsLoading(false);
    form.reset(); // Reset form after mock submission
  };

  return (
    <Card className="mt-8 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2"><UploadCloud className="h-6 w-6 text-primary"/>Import Prices</CardTitle>
        <CardDescription>Upload a CSV file with price data to import into the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="priceFile"
              render={({ field: { onChange, value, ...rest } }) => ( // eslint-disable-line @typescript-eslint/no-unused-vars
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground" /> Price File (CSV)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => onChange(e.target.files)} 
                      {...rest} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Importing...' : 'Import Prices'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ImportPricesForm;
