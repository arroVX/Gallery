import type { Metadata } from "next";
import { Anton, Caveat, Great_Vibes, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import BottomNav from "@/components/BottomNav";
import SmoothScroll from "@/components/SmoothScroll";
import FloatingDoodles from "@/components/FloatingDoodles";
import { NotifyProvider } from "@/lib/notify";

const display = Anton({ subsets: ["latin"], weight: ["400"], variable: "--font-display" });
const scriptF = Great_Vibes({ subsets: ["latin"], weight: ["400"], variable: "--font-script" });
const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-serif" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans" });
const hand = Caveat({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-hand" });

export const metadata: Metadata = {
  title: "GALLERY — Galeri Kita Berdua",
  description: "Galeri foto scrapbook untuk kita berdua.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${display.variable} ${scriptF.variable} ${serif.variable} ${sans.variable} ${hand.variable} bg-paper text-charcoal antialiased`}>
        <SmoothScroll>
          <NotifyProvider>
            <FloatingDoodles />
            <div className="relative min-h-dvh px-2 py-3 sm:px-4">
              <div className="mx-auto min-h-[calc(100dvh-1.5rem)] w-full max-w-5xl border-[3px] border-black bg-ivory shadow-hard">
                <SiteHeader />
                <div className="pb-32 md:pb-10">{children}</div>
                <BottomNav />
              </div>
            </div>
          </NotifyProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
