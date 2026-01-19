import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: '*.replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io', // UploadThing - permanent storage
      },
    ],
    // Note: DALL-E images are temporary (expire in 2 hours) but are automatically
    // uploaded to permanent UploadThing storage when user submits the form
    minimumCacheTTL: 60, // Short cache for temporary DALL-E preview URLs
  },
}

export default nextConfig
