import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnalyticsProvider } from "./providers";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VRChat自己紹介カードメーカー",
  description: "VRChat自己紹介カードメーカー by @yota3d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="afterInteractive"
          charSet="utf-8"
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XMHKGYVDJW"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XMHKGYVDJW');
          `}
        </script>
        <link 
          href="https://fonts.googleapis.com/css2?family=Rounded+Mplus+1c&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Kosugi+Maru&family=Zen+Maru+Gothic&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`font-rounded ${geistSans.variable} ${geistMono.variable}`}>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
