import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingContactLinks } from "@/components/layout/FloatingContactLinks";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shaashbeautystore.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SHAASH Beauty Store | Premium Hair Extensions",
    template: "%s | SHAASH Beauty Store",
  },
  description:
    "Shop premium synthetic hair extensions and hair accessories at SHAASH Beauty Store — find the perfect length, texture and colour for your hairstyle.",
  openGraph: {
    siteName: "SHAASH Beauty Store",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingContactLinks />
        </CartProvider>
      </body>
    </html>
  );
}
