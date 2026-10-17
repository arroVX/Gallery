"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/gallery", label: "GALLERY" },
  { href: "/timeline", label: "STORY" },
  { href: "/memories", label: "MOMEN" },
  { href: "/upload", label: "UPLOAD" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      <div className={`sticker mx-auto grid w-full max-w-md overflow-hidden border-[4px] border-black bg-raspberry shadow-hard text-white grid-cols-${TABS.length}`}>
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative min-w-0 overflow-hidden flex flex-col items-center justify-center gap-0.5 border-r-2 border-white/30 py-3 px-1 text-center text-[10px] font-extrabold tracking-wide last:border-r-0 transition ${
                active ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-black" />
              )}
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
