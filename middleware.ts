import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

let locales = ['en', 'zh'];
let defaultLocale = 'zh'; // Default locale set to Chinese

// Get the preferred locale
function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);
  
  try {
    return match(languages, locales, defaultLocale);
  } catch (e) {
    // If match throws an error (e.g., no suitable match), fallback to defaultLocale
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    let newPath;
    if (pathname === '/') {
      newPath = `/${locale}`; // Redirect to /locale (no trailing slash)
    } else {
      // Ensures that if pathname is already /foo, it becomes /locale/foo
      newPath = `/${locale}${pathname}`;
    }
    
    // Normalize slashes (e.g. ///foo -> /foo) and ensure a single leading slash
    const normalizedPath = ('/' + newPath).replace(/\/+/g, '/');
    
    return NextResponse.redirect(
      new URL(normalizedPath, request.url)
    );
  }

  // If a locale is already present in the pathname, continue to the requested path
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, favicon.ico, images)
    '/((?!_next|api|favicon.ico|images).*)',
  ],
};
