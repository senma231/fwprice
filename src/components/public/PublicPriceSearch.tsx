'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import PriceSearchFormFields from '@/components/common/PriceSearchFormFields';
import PriceResultsDisplay from '@/components/common/PriceResultsDisplay';
import type { Price } from '@/types/freight';
import { fetchPublicPrices } from '@/lib/mockData'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const priceSearchSchema = z.object({
  origin: z.string().min(2, { message: "Origin must be at least 2 characters." }),
  destination: z.string().min(2, { message: "Destination must be at least 2 characters." }),
  weight: z.number().optional(),
  freightType: z.enum(["sea", "air", "land"]).optional(),
});

type PriceSearchFormData = z.infer<typeof priceSearchSchema>;

interface PublicPriceSearchProps {
  lang: string;
  dict: any; // from home namespace
  commonDict: any;
  priceSearchFormDict: any;
  priceResultsDisplayDict: any;
}

const PublicPriceSearch = ({ lang, dict, commonDict, priceSearchFormDict, priceResultsDisplayDict }: PublicPriceSearchProps) => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const form = useForm<PriceSearchFormData>({
    resolver: zodResolver(priceSearchSchema),
    defaultValues: {
      origin: '',
      destination: '',
    },
  });

  const onSubmit = async (data: PriceSearchFormData) => {
    setIsLoading(true);
    setSearchPerformed(true);
    const fetchedPrices = await fetchPublicPrices(data);
    setPrices(fetchedPrices);
    setIsLoading(false);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">{dict.findPriceTitle}</CardTitle>
        <CardDescription>{dict.findPriceDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PriceSearchFormFields 
              control={form.control} 
              isLoading={isLoading} 
              dict={priceSearchFormDict}
              commonDict={commonDict}
              searchButtonText={commonDict.search} // Example: "Search"
              searchingButtonText={commonDict.loading} // Example: "Searching..."
            />
          </form>
        </Form>
        {searchPerformed && (
          <>
            <Separator className="my-8" />
            <PriceResultsDisplay 
              prices={prices} 
              isLoading={isLoading} 
              searchPerformed={searchPerformed}
              dict={priceResultsDisplayDict}
              commonDict={commonDict}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PublicPriceSearch;
