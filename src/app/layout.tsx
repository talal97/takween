import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeStyle } from "@/components/site/theme-style";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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