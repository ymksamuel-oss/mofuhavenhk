import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...[
        "/collections/supplies",
        "/collections/gear",
        "/collections/outdoor-gear",
        "/categories/supplies",
        "/categories/pet-supplies",
        "/categories/lifestyle",
        "/categories/outdoor",
      ].map((source) => ({ source, destination: "/products", permanent: true })),
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "mofuhavenhk.com" }],
        destination: "https://www.mofuhavenhk.com/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/en/pet-guide", destination: "/pet-guide" },
      ],
    };
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/jlzllo8s/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "mofuhavenhk.com",
      },
      {
        protocol: "https",
        hostname: "files.stripe.com",
      },
      {
        protocol: "https",
        hostname: "files.manuscdn.com",
      },
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "hkuxxgduymkztkmyhhot.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "storage.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "izqhlo06ahamwwho.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
