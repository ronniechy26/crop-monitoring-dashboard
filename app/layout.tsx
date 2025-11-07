import type { Metadata } from "next";
import { Nunito, Geist_Mono } from "next/font/google";

import "./globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeScript } from "@/components/providers/theme-script";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crop Monitoring Dashboard",
  description:
    "Next-gen crop telemetry for row crops and vegetables!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        suppressHydrationWarning
        className={`${nunito.variable} ${geistMono.variable} bg-muted/40 antialiased overflow-x-hidden`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
