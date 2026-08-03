import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeStyle } from "@/components/site/theme-style";
import { siteUrl } from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const baseUrl = siteUrl();

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <ThemeStyle />
        {children}
      </body>
    </html>
  );
}