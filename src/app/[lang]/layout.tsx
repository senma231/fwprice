import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css'; // Adjusted path
import { AuthProvider } from '@/contexts/AuthContext';
import AppNavbar from '@/components/layout/AppNavbar';
import AppFooter from '@/components/layout/AppFooter';
import { Toaster } from "@/components/ui/toaster";
import { getDictionary, type Locale } from '@/lib/dictionaries';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return {
    title: `${dict.common.appName} - Smart Freight Quoting`,
    description: dict.home.subtitle,
  };
}

export async function generateStaticParams() {
  // Ensure both 'en' and 'zh' are generated if not already covered by default locale logic
  return [{ lang: 'en' }, { lang: 'zh' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <AppNavbar lang={params.lang} dict={dict.appNavbar} commonDict={dict.common} toastDict={dict.toasts} />
          <main className="flex-grow container py-8">
            {children}
          </main>
          <AppFooter lang={params.lang} dict={dict.appFooter} commonDict={dict.common} />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
