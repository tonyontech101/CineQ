import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SidebarProvider, Sidebar, ContentArea } from "@/components/Sidebar";
import { ChatWidget } from "@/components/ChatWidget";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CineQueue — Discover your next film",
    template: "%s · CineQueue",
  },
  description:
    "Browse and filter movies by genre, dig into details, and jump to the streaming site of your choice.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "CineQueue",
    description: "Discover your next film.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The near-black brand background, applied to the browser UI on mobile.
  themeColor: "#0A0A0C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <SidebarProvider>
          <Suspense fallback={<aside aria-hidden className="fixed left-0 top-0 z-30 hidden h-full border-r border-ink-600/70 bg-ink-900 lg:block" style={{ width: 240 }} />}>
            <Sidebar />
          </Suspense>
          <ContentArea>
            <Header />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </ContentArea>
        </SidebarProvider>
        <ChatWidget />
      </body>
    </html>
  );
}
