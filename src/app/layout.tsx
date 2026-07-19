import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SidebarProvider, Sidebar, ContentArea } from "@/components/Sidebar";

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
  metadataBase: new URL("https://cinequeue.example"),
  openGraph: {
    title: "CineQueue",
    description: "Discover your next film.",
    type: "website",
  },
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
          <Sidebar />
          <ContentArea>
            <Header />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </ContentArea>
        </SidebarProvider>
      </body>
    </html>
  );
}
