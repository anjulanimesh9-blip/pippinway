import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans_Devanagari,
  Noto_Sans_SC,
  Noto_Sans_Sinhala,
  Noto_Sans_Tamil,
  Noto_Sans_Thaana,
  Noto_Sans_Thai,
} from "next/font/google";
import Script from "next/script";
import GaScripts from "./components/analytics/GaScripts";
import { GuestAuthProvider } from "./components/GuestAuthPrompt";
import { I18nProvider } from "@/lib/i18n";
import { LANGUAGE_STORAGE_KEY } from "@/lib/i18n/languages";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sinhala",
  display: "swap",
  preload: false,
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-tamil",
  display: "swap",
  preload: false,
});

const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
  preload: false,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

const notoSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sc",
  display: "swap",
  preload: false,
});

const notoThaana = Noto_Sans_Thaana({
  subsets: ["thaana"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-thaana",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pippinway.com"),

  title: {
    default: "Pippinway - Buy, Sell & Shop Smarter",
    template: "%s | Pippinway",
  },

  description:
    "Buy and sell electronics, vehicles, property, fashion and more across Sri Lanka, Zimbabwe, UK, USA, Canada, India, South Africa, Singapore, Thailand and Maldives.",

  keywords: [
    "Pippinway",
    "Marketplace",
    "Buy and Sell",
    "Classified Ads",
    "Online Marketplace",
    "Sri Lanka",
    "Zimbabwe",
    "UK",
    "USA",
    "Canada",
    "India",
    "South Africa",
    "Singapore",
    "Thailand",
    "Maldives",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "./",
  },

  openGraph: {
    title: "Pippinway - Buy, Sell & Shop Smarter",
    description:
      "Global marketplace for buying and selling electronics, vehicles, property, fashion and more.",
    url: "https://www.pippinway.com",
    siteName: "Pippinway",
    images: [
      {
        url: "/icon.png",
        width: 1024,
        height: 1024,
        alt: "Pippinway Logo",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Pippinway - Buy, Sell & Shop Smarter",
    description:
      "Global marketplace for buying and selling products and services.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-lang="en"
      data-script="latin"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSinhala.variable} ${notoTamil.variable} ${notoThai.variable} ${notoDevanagari.variable} ${notoSc.variable} ${notoThaana.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=${JSON.stringify(LANGUAGE_STORAGE_KEY)};var v=localStorage.getItem(k);if(!v){var m=document.cookie.match(new RegExp('(?:^|; )'+k.replace(/\\./g,'\\\\.')+'=([^;]*)'));v=m?decodeURIComponent(m[1]):'';}if(v){document.documentElement.lang=v;document.documentElement.setAttribute('data-lang',v);var s={si:'sinhala',ta:'tamil',th:'thai',hi:'devanagari',zh:'han',dv:'thaana'};document.documentElement.setAttribute('data-script',s[v]||'latin');}}catch(e){}})();`,
          }}
        />
        <I18nProvider>
          <GuestAuthProvider>{children}</GuestAuthProvider>
        </I18nProvider>
        <GaScripts />

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {
              if(f.fbq)return;
              n=f.fbq=function(){
                n.callMethod
                  ? n.callMethod.apply(n,arguments)
                  : n.queue.push(arguments)
              };
              if(!f._fbq)f._fbq=n;
              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];
              t=b.createElement(e);
              t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(
              window,
              document,
              'script',
              'https://connect.facebook.net/en_US/fbevents.js'
            );

            fbq('init', '1682495002854308');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1682495002854308&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5400699100789727"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}