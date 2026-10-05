import type { Metadata } from "next";
import { Hind_Siliguri, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteChrome } from '@/components/layout/SiteChrome';

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accrc.pages.dev"),
  title: "ACCRC \u2014 Adamjee Cantonment College Robotics Club",
  description:
    "Build what's next with ACCRC \u2014 the student robotics club at Adamjee Cantonment College, Dhaka.",
  generator: "ACCRC",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "ACCRC \u2014 Adamjee Cantonment College Robotics Club",
    description:
      "Build what's next with ACCRC \u2014 the student robotics club at Adamjee Cantonment College, Dhaka.",
    url: "https://accrc.pages.dev",
    siteName: "ACCRC",
    locale: "en_US",
    type: "website",
    images: [{ url: "/accrc-logo.png", alt: "ACCRC logo" }],
  },
  twitter: {
    card: "summary",
    title: "ACCRC \u2014 Adamjee Cantonment College Robotics Club",
    description: "Build what's next with ACCRC — the student robotics club at Adamjee Cantonment College, Dhaka.",
    images: ["/accrc-logo.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <meta name="theme-color" content="white" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="black" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="light" />
      </head>
      <body className={`${hindSiliguri.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
