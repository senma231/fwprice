import type { Price } from '@/types/freight';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CalendarDays, DollarSign, Info, Truck, Plane, ShipIcon } from 'lucide-react';
import { format } from 'date-fns';

interface PriceResultsDisplayProps {
  prices: Price[];
  isLoading?: boolean;
  searchPerformed?: boolean;
}

const PriceResultsDisplay: React.FC<PriceResultsDisplayProps> = ({ prices, isLoading, searchPerformed }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </CardContent>
            <CardFooter>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!searchPerformed) {
    return null; // Don't show anything if no search has been performed yet
  }
  
  if (prices.length === 0) {
    return (
      <Card className="mt-8 text-center py-12">
        <CardContent>
          <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No Prices Found</p>
          <p className="text-muted-foreground">Try adjusting your search criteria.</p>
        </CardContent>
      </Card>
    );
  }
  
  const getCarrierIcon = (carrier?: string) => {
    if (!carrier) return <ShipIcon className="h-5 w-5 text-muted-foreground" />; // Default
    if (carrier.toLowerCase().includes('sea') || carrier.toLowerCase().includes('ocean')) return <ShipIcon className="h-5 w-5 text-blue-500" />;
    if (carrier.toLowerCase().includes('air')) return <Plane className="h-5 w-5 text-sky-500" />;
    if (carrier.toLowerCase().includes('land') || carrier.toLowerCase().includes('truck')) return <Truck className="h-5 w-5 text-green-500" />;
    return <ShipIcon className="h-5 w-5 text-muted-foreground" />;
  };


  return (
    <div className="mt-8">
       <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((price) => (
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
                    <CalendarDays className="h-3 w-3"/> 
                    {format(new Date(price.validFrom), 'MMM d, yyyy')} - {format(new Date(price.validTo), 'MMM d, yyyy')}
                  </div>
                ) : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={price.type === 'public' ? 'secondary' : 'default'}>
                  {price.type === 'public' ? 'Public' : 'Internal'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PriceResultsDisplay;
