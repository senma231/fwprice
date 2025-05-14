'use client';

import type { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Building2, Globe, Weight, ArrowRightLeft } from 'lucide-react';

interface PriceSearchFormFieldsProps {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  isLoading?: boolean;
}

const PriceSearchFormFields: React.FC<PriceSearchFormFieldsProps> = ({ control, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      <FormField
        control={control}
        name="origin"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center"><Building2 className="mr-2 h-4 w-4 text-muted-foreground" />Origin</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Shanghai, CN" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="destination"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center"><Globe className="mr-2 h-4 w-4 text-muted-foreground" />Destination</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Los Angeles, US" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center"><Weight className="mr-2 h-4 w-4 text-muted-foreground" />Weight (kg)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="freightType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center"><ArrowRightLeft className="mr-2 h-4 w-4 text-muted-foreground" />Freight Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="sea">Sea Freight</SelectItem>
                <SelectItem value="air">Air Freight</SelectItem>
                <SelectItem value="land">Land Freight</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" disabled={isLoading} className="w-full lg:w-auto">
        <Search className="mr-2 h-4 w-4" />
        {isLoading ? 'Searching...' : 'Search Prices'}
      </Button>
    </div>
  );
};

export default PriceSearchFormFields;
