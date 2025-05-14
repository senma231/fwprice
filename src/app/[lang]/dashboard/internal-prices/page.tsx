import InternalPriceSearch from '@/components/dashboard/InternalPriceSearch';
import { getDictionary, type Locale } from '@/lib/dictionaries';

export default async function InternalPricesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  return (
    <div>
      <InternalPriceSearch 
        lang={lang} 
        dict={dict.internalPriceSearch} 
        commonDict={dict.common}
        priceSearchFormDict={dict.priceSearchFormFields}
        priceResultsDisplayDict={dict.priceResultsDisplay}
      />
    </div>
  );
}
