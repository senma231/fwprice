import PublicPriceSearch from '@/components/public/PublicPriceSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import RfqForm from '@/components/public/RfqForm';
import { Separator } from '@/components/ui/separator';
import { MailQuestion } from 'lucide-react';
import { getDictionary, type Locale } from '@/lib/dictionaries';

export default async function HomePage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const homeDict = dict.home;
  const commonDict = dict.common;

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-br from-primary/10 via-background to-background rounded-lg shadow-md">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl md:text-7xl">
          {homeDict.title}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-foreground/80">
          {homeDict.subtitle}
        </p>
      </section>
      
      <PublicPriceSearch lang={lang} dict={homeDict} commonDict={commonDict} priceSearchFormDict={dict.priceSearchFormFields} priceResultsDisplayDict={dict.priceResultsDisplay} />

      <Separator className="my-16" />

      <section className="space-y-8 py-8">
        <div className="text-center">
          <MailQuestion className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {homeDict.customQuoteTitle}
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
            {homeDict.customQuoteDescription}
          </p>
        </div>
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardContent className="pt-6">
            <RfqForm lang={lang} dict={dict.rfqForm} commonDict={commonDict} />
          </CardContent>
        </Card>
      </section>

      <Separator className="my-16" />

      <section className="grid md:grid-cols-3 gap-8 my-12">
        <Card>
          <CardHeader>
            <Image src="https://picsum.photos/seed/global/400/200" alt="Global Network" width={400} height={200} className="rounded-t-lg object-cover" data-ai-hint="global network" />
            <CardTitle className="mt-4">{homeDict.featureGlobalNetwork}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{homeDict.featureGlobalNetworkDesc}</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Image src="https://picsum.photos/seed/transparent/400/200" alt="Transparent Pricing" width={400} height={200} className="rounded-t-lg object-cover" data-ai-hint="transparent pricing" />
            <CardTitle className="mt-4">{homeDict.featureTransparentPricing}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{homeDict.featureTransparentPricingDesc}</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <Image src="https://picsum.photos/seed/easybooking/400/200" alt="Easy Booking" width={400} height={200} className="rounded-t-lg object-cover" data-ai-hint="easy booking"/>
            <CardTitle className="mt-4">{homeDict.featureEasyToUse}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{homeDict.featureEasyToUseDesc}</CardDescription>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
