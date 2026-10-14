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
      <body className={`${serif.variable} ${sans.variable} ${hand.variable} bg-paper text-charcoal antialiased`}>
        <SmoothScroll>
          <div className="min-h-dvh px-2 py-2 sm:px-4 sm:py-4">
            <div className="mx-auto min-h-[calc(100dvh-1rem)] w-full max-w-6xl overflow-clip rounded-[22px] bg-white shadow-pop sm:rounded-[28px]">
              <SiteHeader />
              <div className="pb-28">{children}</div>
              <BottomNav />
            </div>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
