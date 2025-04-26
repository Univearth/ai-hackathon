/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pub-7444760b0415482ba8f55298c08a442b.r2.dev'],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  missingSuspenseWithCSRBailout: false,
}

module.exports = nextConfig