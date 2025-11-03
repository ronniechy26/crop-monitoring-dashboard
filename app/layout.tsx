import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crop Monitoring Dashboard",
  description:
    "Next-gen crop telemetry for row crops and vegetables, built with Next.js, Recharts, and shadcn/ui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-muted/40 antialiased`}
      >
        <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/60">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
            <div className="hidden w-[260px] lg:block">
              <AppSidebar />
            </div>
            <div className="flex-1 space-y-6 lg:pl-2">
              <TopNav />
              <main className="pb-16">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
