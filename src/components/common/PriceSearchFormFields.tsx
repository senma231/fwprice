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
  control: Control<any>; 
  isLoading?: boolean;
  dict: any; // From priceSearchFormFields namespace
  commonDict: any; // From common namespace
  searchButtonText: string;
  searchingButtonText: string;
}

const PriceSearchFormFields: React.FC<PriceSearchFormFieldsProps> = ({ control, isLoading, dict, commonDict, searchButtonText, searchingButtonText }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      <FormField
        control={control}
        name="origin"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center"><Building2 className="mr-2 h-4 w-4 text-muted-foreground" />{dict.originLabel}</FormLabel>
            <FormControl>
              <Input placeholder={dict.originPlaceholder} {...field} />
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
            <FormLabel className="flex items-center"><Globe className="mr-2 h-4 w-4 text-muted-foreground" />{dict.destinationLabel}</FormLabel>
            <FormControl>
              <Input placeholder={dict.destinationPlaceholder} {...field} />
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
            <FormLabel className="flex items-center"><Weight className="mr-2 h-4 w-4 text-muted-foreground" />{dict.weightLabel}</FormLabel>
            <FormControl>
              <Input type="number" placeholder={dict.weightPlaceholder} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
            <FormLabel className="flex items-center"><ArrowRightLeft className="mr-2 h-4 w-4 text-muted-foreground" />{dict.freightTypeLabel}</FormLabel>
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
      <Button type="submit" disabled={isLoading} className="w-full lg:w-auto">
        <Search className="mr-2 h-4 w-4" />
        {isLoading ? searchingButtonText : searchButtonText}
      </Button>
    </div>
  );
};

export default PriceSearchFormFields;
