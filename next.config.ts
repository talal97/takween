import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const imagePatterns: { protocol: "https"; hostname: string }[] = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "res.cloudinary.com" },
];
if (process.env.NEXT_PUBLIC_IMAGE_HOST) {
  imagePatterns.push({ protocol: "https", hostname: process.env.NEXT_PUBLIC_IMAGE_HOST });
}

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: imagePatterns,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: www.googletagmanager.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' https: data: blob:; " +
              "font-src 'self' data:; " +
              "connect-src 'self' www.googletagmanager.com; " +
              "worker-src 'self' blob:; " +
              "frame-ancestors 'self'; " +
              "base-uri 'self'; " +
              "form-action 'self'",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);