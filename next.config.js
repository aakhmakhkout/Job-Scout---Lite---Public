/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static-generation friendly; jobs data is fetched from /api/jobs/cache (a static JSON file)
  // rather than server-rendered on every request, to stay within Vercel's free tier.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  }
};

module.exports = nextConfig;
