/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages deploys the generated static site from /out.
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
