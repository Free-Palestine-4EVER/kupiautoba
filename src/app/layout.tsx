import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kupiauto.ba'),
  title: "KupiAuto.ba - Pronadi svoj auto iz snova",
  description:
    "Najveci online marketplace za kupovinu i prodaju automobila u Bosni i Hercegovini. Pregledajte hiljade oglasa novih i polovnih vozila.",
  keywords: [
    "auto oglasi",
    "kupovina auta",
    "prodaja auta",
    "Bosna i Hercegovina",
    "polovni automobili",
    "novi automobili",
    "KupiAuto",
  ],
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://www.kupiauto.ba',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: "KupiAuto.ba - Pronadi svoj auto iz snova",
    description:
      "Najveci online marketplace za kupovinu i prodaju automobila u Bosni i Hercegovini.",
    siteName: "KupiAuto.ba",
    locale: "bs_BA",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KupiAuto.ba - Pronadi svoj auto iz snova',
    description: 'Najveci online marketplace za kupovinu i prodaju automobila u Bosni i Hercegovini.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pt-16 md:pt-20">{children}</main>
              <Footer />
              <CookieConsent />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
