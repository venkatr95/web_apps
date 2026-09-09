import ExtensionAttributeCleanup from "@/components/ExtensionAttributeCleanup";
import DynamicClerkProvider from "@/components/providers/DynamicClerkProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UserDataProvider } from "@/contexts/UserDataContext";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = localFont({
  src: "./fonts/Poppins.woff2",
  variable: "--font-poppins",
  weight: "400",
  preload: false,
});
const raleway = localFont({
  src: "./fonts/Raleway.woff2",
  variable: "--font-raleway",
  weight: "100 900",
});

const opensans = localFont({
  src: "./fonts/Open Sans.woff2",
  variable: "--font-open-sans",
  weight: "100 800",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ShopItpro.reactbd.org"),
  title: {
    template: "ShopIt - Premium Online Shopping",
    default: "ShopIt - Your Trusted Online Shopping Destination",
  },
  icons: {
    icon: [],
    shortcut: [],
    apple: [],
  },
  description:
    "Discover amazing products at ShopIt, your trusted online shopping destination for quality items and exceptional customer service. Shop electronics, fashion, home goods and more with fast delivery.",
  keywords: [
    "online shopping",
    "e-commerce",
    "buy online",
    "shop online",
    "electronics",
    "fashion",
    "home goods",
    "deals",
    "discounts",
    "ShopIt",
  ],
  authors: [{ name: "ShopIt" }],
  creator: "ShopIt",
  publisher: "ShopIt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    // url: "https://ShopItpro.reactbd.org",
    siteName: "ShopIt",
    title: "ShopIt - Your Trusted Online Shopping Destination",
    description:
      "Discover amazing products at ShopIt, your trusted online shopping destination for quality items and exceptional customer service.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ShopIt Online Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopIt - Your Trusted Online Shopping Destination",
    description:
      "Discover amazing products at ShopIt, your trusted online shopping destination for quality items and exceptional customer service.",
    images: ["/og-image.jpg"],
    creator: "@ShopIt",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    // Add other verification codes as needed
  },
  alternates: {
    canonical: "https://ShopItpro.reactbd.org",
  },
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <DynamicClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="data:," />
          <link rel="shortcut icon" href="data:," />
        </head>
        <body
          className={`${poppins.variable} ${raleway.variable} ${opensans.variable} antialiased`}
          suppressHydrationWarning
        >
          {/* Extension cleanup script - runs before React hydration */}
          <Script src="/extension-cleanup.js" strategy="beforeInteractive" />

          <ThemeProvider>
            <ExtensionAttributeCleanup />
            <UserDataProvider>{children}</UserDataProvider>
            {/* <PremiumFloatingButton /> */}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              theme="system"
              toastOptions={{
                className: "sonner-toast",
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </DynamicClerkProvider>
  );
};

export default RootLayout;
