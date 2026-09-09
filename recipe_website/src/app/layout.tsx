import DemoBanner from "@/components/DemoBanner";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import {
  Inter,
  Noto_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Tamil,
  Noto_Serif,
  Noto_Serif_Devanagari,
  Noto_Serif_Tamil,
  Playfair_Display,
} from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

// Noto Sans for Latin scripts
const notoSans = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-noto-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Noto Sans Devanagari for Hindi
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Noto Sans Tamil for Tamil
const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-sans-tamil",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Noto Serif for Latin scripts headings
const notoSerif = Noto_Serif({
  subsets: ["latin", "latin-ext"],
  variable: "--font-noto-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

// Noto Serif Devanagari for Hindi headings
const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-serif-devanagari",
  display: "swap",
  weight: ["400", "600", "700"],
});

// Noto Serif Tamil for Tamil headings
const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-serif-tamil",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "RecipeHub - Discover & Share Amazing Recipes",
    template: "%s | RecipeHub",
  },
  description:
    "Discover thousands of delicious recipes, share your culinary creations, and connect with food lovers around the world.",
  keywords: ["recipes", "cooking", "food", "culinary", "meals", "desserts"],
  authors: [{ name: "RecipeHub" }],
  creator: "RecipeHub",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "RecipeHub",
    title: "RecipeHub - Discover & Share Amazing Recipes",
    description:
      "Discover thousands of delicious recipes, share your culinary creations, and connect with food lovers around the world.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RecipeHub - Discover & Share Amazing Recipes",
    description:
      "Discover thousands of delicious recipes, share your culinary creations, and connect with food lovers around the world.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const tf = await getTranslations("footer");
  const locale = await getLocale();

  return (
    <html
      className={`${inter.variable} ${playfair.variable} ${notoSans.variable} ${notoSansDevanagari.variable} ${notoSansTamil.variable} ${notoSerif.variable} ${notoSerifDevanagari.variable} ${notoSerifTamil.variable}`}
      suppressHydrationWarning
      lang={locale}
    >
      <body className={notoSans.className}>
        <Script id="ads-config" strategy="afterInteractive">
          {`window.__adsPlaceholder={enabled:true,networks:["google-ads","taboola","outbrain","twitter-ads"]};`}
        </Script>
        <Script
          id="ld-json-org"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "RecipeHub",
            url: process.env.NEXTAUTH_URL || "http://localhost:3000",
            logo:
              (process.env.NEXTAUTH_URL || "http://localhost:3000") +
              "/logo.png",
          })}
        </Script>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <DemoBanner />
            <Navigation />
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <div
                data-ad-slot="global-banner"
                data-ad-network="google-ads"
                className="max-w-7xl mx-auto container-padding pt-4"
              >
                <div className="w-full h-20 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm">
                  Ad Placeholder
                </div>
              </div>
              {children}
            </main>
            <footer className="bg-secondary-900 dark:bg-gray-950 text-white py-12">
              <div className="max-w-7xl mx-auto container-padding">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-heading font-bold mb-4">
                      {tf("title")}
                    </h3>
                    <p className="text-gray-400 text-sm">{tf("description")}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">{tf("explore")}</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link
                          href={`/${locale}/recipes`}
                          className="text-gray-400 hover:text-white"
                        >
                          {tf("browseRecipes")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={`/${locale}/favLists`}
                          className="text-gray-400 hover:text-white"
                        >
                          {tf("collections")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={`/${locale}/about`}
                          className="text-gray-400 hover:text-white"
                        >
                          {tf("about")}
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">{tf("account")}</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link
                          href={`/${locale}/auth/signin`}
                          className="text-gray-400 hover:text-white"
                        >
                          {tf("signIn")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={`/${locale}/auth/signup`}
                          className="text-gray-400 hover:text-white"
                        >
                          {tf("signUp")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={`/${locale}/profile`}
                          className="text-gray-400 hover:text-white"
                        >
                          {tf("profile")}
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">{tf("followUs")}</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      {tf("community")}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                  <p>{tf("copyright", { year: new Date().getFullYear() })}</p>
                </div>
              </div>
            </footer>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
