import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ClerkProvider } from '@clerk/nextjs';
import UserSync from '@/components/UserSync';
import PageTransition from '@/components/PageTransition';
import PageLoadingIndicator from '@/components/PageLoadingIndicator';
import LoadingBar from '@/components/LoadingBar';
import WhatsAppButton from '@/components/WhatsAppButton';
import SiteButtonThemeSync from '@/components/SiteButtonThemeSync';

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UFLIX - Premium Furniture & Manufacturing Solutions",
  description: "Leading manufacturer of premium furniture, metal fabrication, and shop fittings. Serving government, corporate, and retail sectors with ISO 9001:2015 certified quality.",
  icons: {
    icon: '/Logos/Uflix_Logo.png',
    apple: '/Logos/Uflix_Logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${playfair.variable} ${montserrat.variable} antialiased`}>
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-LJLKLX3BY7" strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-LJLKLX3BY7');`}
          </Script>
          <LoadingBar />
          <PageLoadingIndicator />
          <SiteButtonThemeSync />
          <UserSync />
          <CartProvider>
            <WishlistProvider>
              <PageTransition>
                {children}
              </PageTransition>
            </WishlistProvider>
          </CartProvider>
          <WhatsAppButton />
        </body>
      </html>
    </ClerkProvider>
  );
}