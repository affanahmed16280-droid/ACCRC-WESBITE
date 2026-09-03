import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
