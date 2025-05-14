import PublicPriceSearch from '@/components/public/PublicPriceSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-br from-primary/10 via-background to-background rounded-lg shadow-md">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl md:text-7xl">
          FreightWise
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-foreground/80">
          Instant freight quotes, transparent pricing. Your global logistics partner.
        </p>
      </section>
      
      <PublicPriceSearch />

      <section className="grid md:grid-cols-3 gap-8 my-12">
        <Card>
          <CardHeader>
            <Image src="https://picsum.photos/seed/global/400/200" alt="Global Network" width={400} height={200} className="rounded-t-lg object-cover" data-ai-hint="global network" />
            <CardTitle className="mt-4">Global Network</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Access competitive rates across our extensive global network of carriers.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Image src="https://picsum.photos/seed/transparent/400/200" alt="Transparent Pricing" width={400} height={200} className="rounded-t-lg object-cover" data-ai-hint="transparent pricing" />
            <CardTitle className="mt-4">Transparent Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>No hidden fees. Get clear, upfront pricing for all your shipments.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <Image src="https://picsum.photos/seed/easybooking/400/200" alt="Easy Booking" width={400} height={200} className="rounded-t-lg object-cover" data-ai-hint="easy booking"/>
            <CardTitle className="mt-4">Easy to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Our intuitive platform makes finding and comparing freight quotes simple and fast.</CardDescription>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
