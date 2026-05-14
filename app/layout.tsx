// app/layout.tsx
import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "@/components/ui/toaster";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuddhaSangam — Buddhist Matrimony Platform",
    template: "%s | BuddhaSangam",
  },
  description:
    "Find your Dhamma companion on BuddhaSangam — India's dedicated Buddhist matrimony platform for Theravada, Mahayana, Vajrayana and Navayana communities.",
  keywords: ["Buddhist matrimony", "Buddhist marriage", "Navayana matrimony", "Ambedkarite matrimony", "Buddhist bride groom"],
  authors: [{ name: "BuddhaSangam" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "BuddhaSangam",
    title: "BuddhaSangam — Buddhist Matrimony Platform",
    description: "Find your Dhamma companion — dedicated Buddhist matrimony platform.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuddhaSangam",
    description: "Find your Dhamma companion.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${josefin.variable}`}>
      <body className="min-h-screen bg-ivory font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
