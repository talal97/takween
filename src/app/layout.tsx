import { Geist, Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";
import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeStyle } from "@/components/site/theme-style";
import { siteUrl } from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const baseUrl = siteUrl();

// <ThemeStyle /> reads theme colors from the database on every render, so
// this layout (and pages like the global not-found page) can't be
// statically prerendered at Docker build time — no DB is reachable there.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Takween | Professional Training Courses",
    template: "%s | Takween",
  },
  description:
    "Professional training courses delivered in cities worldwide. Accredited, practical programmes led by expert trainers.",
  keywords: ["training", "courses", "certification", "professional development", "Dubai"],
  openGraph: {
    type: "website",
    title: "Takween | Professional Training Courses",
    description: "Professional training courses delivered in cities worldwide.",
    url: baseUrl,
    siteName: "Takween",
  },
  twitter: {
    card: "summary_large_image",
    title: "Takween | Professional Training Courses",
    description: "Professional training courses delivered in cities worldwide.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoKufiArabic.variable} antialiased font-sans`}>
        <ThemeStyle />
        {children}
      </body>
    </html>
  );
}