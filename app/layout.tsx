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

  title: "Pippinway - Buy, Sell & Shop Smarter",

  description:
    "Buy and sell electronics, vehicles, property, fashion and more across Sri Lanka, Zimbabwe, UK, USA, Canada, India and other countries.",

  keywords: [
    "Pippinway",
    "Marketplace",
    "Buy and Sell",
    "Classified Ads",
    "Sri Lanka",
    "Zimbabwe",
    "UK",
    "USA",
    "Canada",
    "India",
  ],

  alternates: {
    canonical: "https://www.pippinway.com",
  },

  openGraph: {
    title: "Pippinway - Buy, Sell & Shop Smarter",
    description:
      "Global marketplace for buying and selling products, vehicles, property and more.",
    url: "https://www.pippinway.com",
    siteName: "Pippinway",
    images: [
      {
        url: "/icon.png",
        width: 1024,
        height: 1024,
      },
    ],
    type: "website",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
