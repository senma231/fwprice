'use client';

import { useState, useEffect } from 'react';
import type { Price } from '@/types/freight';
import { fetchAllPrices } from '@/lib/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plane, ShipIcon, Truck, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Locale } from '@/lib/dictionaries';

interface LatestInternalPricesDisplayProps {
  lang: Locale;
  dict: any; // from internalPriceSearch namespace
  commonDict: any; // from common namespace
  priceResultsDisplayDict: any; // from priceResultsDisplay namespace
}

const LatestInternalPricesDisplay: React.FC<LatestInternalPricesDisplayProps> = ({ lang, dict, commonDict, priceResultsDisplayDict }) => {
  const [latestPrices, setLatestPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLatestPrices = async () => {
      setIsLoading(true);
      try {
        const allPrices = await fetchAllPrices();
        const internalPrices = allPrices
          .filter(p => p.type === 'internal')
          .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Sort by ID descending
          .slice(0, 10);
        setLatestPrices(internalPrices);
      } catch (error) {
        console.error("Failed to load latest internal prices", error);
      }
      setIsLoading(false);
    };

    loadLatestPrices();
  }, [lang]); // Re-fetch if lang changes, though data itself is not lang-specific

  const getCarrierIcon = (carrier?: string) => {
    if (!carrier) return <ShipIcon className="h-5 w-5 text-muted-foreground" />;
    if (carrier.toLowerCase().includes('sea') || carrier.toLowerCase().includes('ocean')) return <ShipIcon className="h-5 w-5 text-blue-500" />;
    if (carrier.toLowerCase().includes('air')) return <Plane className="h-5 w-5 text-sky-500" />;
    if (carrier.toLowerCase().includes('land') || carrier.toLowerCase().includes('truck')) return <Truck className="h-5 w-5 text-green-500" />;
    return <ShipIcon className="h-5 w-5 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict.latestInternalPricesTitle || 'Loading Latest Prices...'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-md bg-muted"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (latestPrices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict.latestInternalPricesTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">{priceResultsDisplayDict.noPricesFound}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{dict.latestInternalPricesTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{commonDict.origin}</TableHead>
                <TableHead>{commonDict.destination}</TableHead>
                <TableHead>{priceResultsDisplayDict.carrier}</TableHead>
                <TableHead>{priceResultsDisplayDict.price}</TableHead>
                <TableHead>{priceResultsDisplayDict.validity}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestPrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">{price.origin}</TableCell>
                  <TableCell className="font-medium">{price.destination}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getCarrierIcon(price.carrier)}
                    {price.carrier || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-lg text-primary">
                      {price.amount.toLocaleString(undefined, { style: 'currency', currency: price.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {price.validFrom && price.validTo ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {format(new Date(price.validFrom), 'MMM d, yyyy')} - {format(new Date(price.validTo), 'MMM d, yyyy')}
                      </div>
                    ) : price.validFrom ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                         <CalendarDays className="h-3 w-3" /> {format(new Date(price.validFrom), 'MMM d, yyyy')}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestInternalPricesDisplay;

    