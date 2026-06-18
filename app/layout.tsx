import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    canonical: "https://www.pippinway.com",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}