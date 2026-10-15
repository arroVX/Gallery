"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "HOME" },
  { href: "/gallery", label: "GALLERY" },
  { href: "/flipbook", label: "BOOK" },
  { href: "/timeline", label: "STORY" },
  { href: "/memories", label: "MOMEN" },
  { href: "/upload", label: "UPLOAD" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="sticker mx-auto grid w-full max-w-md grid-cols-6 overflow-hidden border-[3px] border-black bg-raspberry text-white">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative min-w-0 overflow-hidden border-r-2 border-white/20 py-2.5 text-center text-[9px] font-extrabold tracking-[0.04em] last:border-r-0 ${
                active ? "bg-white text-black" : "text-white/60 hover:text-white/90"
              }`}
            >
              {active && (
                <span className="absolute inset-x-0 top-0 h-[3px] bg-black" />
              )}
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
