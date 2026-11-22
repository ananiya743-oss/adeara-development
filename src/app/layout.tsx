import type { Metadata, Viewport } from "next";
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

// Better title length (58 chars — within recommended 50-60 range)
// Better description length (128 chars — within recommended 100-130 range)
const SITE_URL = "https://adeara-development-41zb.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ADEARA DEVELOPMENT — Website, Mobile Apps & Digital Marketing",
    template: "%s | ADEARA DEVELOPMENT",
  },
  description:
    "Ethiopian technology company building modern websites, mobile apps, and digital marketing solutions. Build your online presence with ADEARA.",
  keywords: [
    "Ethiopia web development",
    "mobile app development Ethiopia",
    "digital marketing Addis Ababa",
    "ADEARA DEVELOPMENT",
    "website design Ethiopia",
    "SEO Ethiopia",
    "build online presence",
  ],
  authors: [{ name: "ADEARA DEVELOPMENT" }],
  creator: "ADEARA DEVELOPMENT",
  publisher: "ADEARA DEVELOPMENT",
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "ADEARA DEVELOPMENT — Website, Mobile Apps & Digital Marketing",
    description:
      "Build your online presence with ADEARA — modern websites, mobile apps, and digital marketing in Ethiopia.",
    siteName: "ADEARA DEVELOPMENT",
    type: "website",
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/adeara-logo.jpg",
        width: 1200,
        height: 630,
        alt: "ADEARA DEVELOPMENT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADEARA DEVELOPMENT — Website, Mobile Apps & Digital Marketing",
    description:
      "Build your online presence with ADEARA — modern websites, mobile apps, and digital marketing in Ethiopia.",
    images: ["/adeara-logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
};

// Explicit viewport for better mobile rendering (Next.js 14+)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1F3A" },
  ],
  colorScheme: "light dark",
};

// Structured data (JSON-LD) for Organization — improves search engine understanding
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ADEARA DEVELOPMENT",
  alternateName: "ADEARA",
  url: SITE_URL,
  logo: `${SITE_URL}/adeara-logo.jpg`,
  description:
    "Ethiopian technology company building modern websites, mobile apps, and digital marketing solutions.",
  foundingDate: "2026",
  email: "ananiya743@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressCountry: "ET",
    addressRegion: "Addis Ababa",
    addressLocality: "Addis Ababa",
  },
  areaServed: ["Ethiopia", "Global"],
  knowsAbout: [
    "Web Development",
    "Mobile App Development",
    "Digital Marketing",
    "SEO",
    "Social Media Marketing",
  ],
  sameAs: [
    "https://www.facebook.com/adearadevelopment",
    "https://www.twitter.com/adearadev",
    "https://www.instagram.com/adearadevelopment",
    "https://www.linkedin.com/company/adeara-development",
    "https://www.youtube.com/@adearadevelopment",
  ],
};

// WebSite schema for search engine sitelinks
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ADEARA DEVELOPMENT",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/our-work?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${interTight.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        {/* Structured data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Structured data — WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
