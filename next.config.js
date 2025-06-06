/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['sdenqmymvspjhzipmvyn.supabase.co'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  webpack: (config, { dev, isServer }) => {
    // Otimizações para desenvolvimento
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
      }
    }
    
    // Resolver problema do punycode
    config.resolve.fallback = {
      ...config.resolve.fallback,
      punycode: false,
    }
    
    return config
  },
  // Configurações de redirecionamento
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/medical-office',
        destination: '/consulting-room',
        permanent: true,
      },
    ]
  },
  trailingSlash: true
}

module.exports = nextConfig 