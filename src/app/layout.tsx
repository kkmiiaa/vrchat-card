import type { Metadata } from "next";
import { Nunito, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AnalyticsProvider } from "./providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaacard.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'vaacard',
    template: '%s | vaacard',
  },
  description: '自己紹介カードを作って、あなたのプロフィールページをシェアしよう。',
  openGraph: {
    siteName: 'vaacard',
    title: 'vaacard',
    description: '自己紹介カードを作って、あなたのプロフィールページをシェアしよう。',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'vaacard',
    description: '自己紹介カードを作って、あなたのプロフィールページをシェアしよう。',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body className={`${nunito.variable} ${notoSansJP.variable}`} style={{ fontFamily: "var(--font-nunito), var(--font-noto-sans-jp), sans-serif" }}>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-XMHKGYVDJW" strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XMHKGYVDJW');
            `}</Script>
          </>
        )}
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
