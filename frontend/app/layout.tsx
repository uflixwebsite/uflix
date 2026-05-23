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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
  metadataBase: new URL(siteUrl),
  title: {
    default: "UFLIX - Premium Furniture & Manufacturing Solutions",
    template: "%s | UFLIX",
  },
  description: "Leading manufacturer of premium furniture, metal fabrication, and shop fittings. Serving government, corporate, and retail sectors with ISO 9001:2015 certified quality.",
  keywords: [
    "UFLIX",
    "furniture manufacturer",
    "metal fabrication",
    "shop fittings",
    "steel fabrication",
    "industrial furniture",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WTR5C9JH');`}
          </Script>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-WTR5C9JH"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
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