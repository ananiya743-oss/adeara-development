import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ADEARA DEVELOPMENT — Build Your Online Presence",
    template: "%s | ADEARA DEVELOPMENT",
  },
  description:
    "ADEARA DEVELOPMENT is an Ethiopian technology company building modern websites, mobile apps, and digital marketing solutions. Turning ideas into digital excellence.",
  keywords: [
    "Ethiopia web development",
    "mobile app development Ethiopia",
    "digital marketing Addis Ababa",
    "ADEARA DEVELOPMENT",
    "website design Ethiopia",
    "SEO Ethiopia",
  ],
  authors: [{ name: "ADEARA DEVELOPMENT" }],
  metadataBase: new URL("https://adeara.dev"),
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
  openGraph: {
    title: "ADEARA DEVELOPMENT",
    description:
      "Build Your Online Presence with ADEARA. — professional websites, mobile apps, and digital marketing in Ethiopia.",
    siteName: "ADEARA DEVELOPMENT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ADEARA DEVELOPMENT",
    description: "Website, mobile apps, and digital marketing in Ethiopia.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${interTight.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
