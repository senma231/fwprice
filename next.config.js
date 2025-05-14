import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // The i18n object below is for the Pages Router.
  // For App Router with [lang] segment and middleware, it's not required
  // and can sometimes cause conflicts.
  // i18n: {
  //   locales: ['en', 'zh'],
  //   defaultLocale: 'en',
  // },
};

export default nextConfig;
