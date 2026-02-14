import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND_NAME } from "@/lib/constants";
import { AuthProvider } from "@/components/session-provider";
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
  metadataBase: new URL("https://www.nudgesoon.com"),
  title: {
    default: `${BRAND_NAME} - Gentle Reminders for Your Items`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: "Get timely nudges before your items expire. Track passports, memberships, food, medicine, and more with instant visual feedback.",
  keywords: ["expiry tracker", "reminders", "expiration dates", "membership tracker", "passport expiry"],
  openGraph: {
    title: `${BRAND_NAME} - Gentle Reminders for Your Items`,
    description: "Get timely nudges before your items expire. Track passports, memberships, food, medicine, and more.",
    type: "website",
    url: "https://www.nudgesoon.com",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "NudgeSoon - Gentle Reminders for Your Items",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} - Gentle Reminders for Your Items`,
    description: "Get timely nudges before your items expire. Track passports, memberships, food, medicine, and more.",
    images: ["/og-image"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
