import InternalPriceSearch from '@/components/dashboard/InternalPriceSearch';
import LatestInternalPricesDisplay from '@/components/dashboard/LatestInternalPricesDisplay';
import { Separator } from '@/components/ui/separator';
import { getDictionary, type Locale } from '@/lib/dictionaries';

export default async function InternalPricesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  return (
    <div className="space-y-8">
      <InternalPriceSearch 
        lang={lang} 
        dict={dict.internalPriceSearch} 
        commonDict={dict.common}
        priceSearchFormDict={dict.priceSearchFormFields}
        priceResultsDisplayDict={dict.priceResultsDisplay}
      />
      <Separator />
      <LatestInternalPricesDisplay
        lang={lang}
        dict={dict.internalPriceSearch} 
        commonDict={dict.common}
        priceResultsDisplayDict={dict.priceResultsDisplay}
      />
    </div>
  );
}

    