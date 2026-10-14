import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Caveat } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import BottomNav from "@/components/BottomNav";
import SmoothScroll from "@/components/SmoothScroll";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-serif" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans" });
const hand = Caveat({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-hand" });

export const metadata: Metadata = {
  title: "Kita — Galeri Kita Berdua",
  description: "Galeri foto minimalis dan romantis untuk kita berdua.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${serif.variable} ${sans.variable} ${hand.variable} bg-ivory text-charcoal antialiased`}>
        <SmoothScroll>
          <SiteHeader />
          <div className="mx-auto min-h-dvh w-full max-w-md pb-28 pt-14">{children}</div>
          <BottomNav />
        </SmoothScroll>
      </body>
    </html>
  );
}
