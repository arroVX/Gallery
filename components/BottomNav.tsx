"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "HOME" },
  { href: "/gallery", label: "GALLERY" },
  { href: "/flipbook", label: "BOOK" },
  { href: "/timeline", label: "STORY" },
  { href: "/upload", label: "UPLOAD" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto grid w-full max-w-md grid-cols-5 border-[3px] border-black bg-black text-white shadow-hardSm">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`border-r-2 border-white/20 py-2.5 text-center text-[9px] font-extrabold tracking-[0.1em] last:border-r-0 ${
                active ? "bg-white text-black" : "text-white/70"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
