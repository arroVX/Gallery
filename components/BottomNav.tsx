"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <path d="M3 10.5 12 3l9 7.5V21H3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m5 19 5.5-5.5 3 3L18 12l3 3.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/timeline",
    label: "Timeline",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <path d="M12 3v18" strokeLinecap="round" />
        <circle cx="12" cy="7" r="2.2" />
        <circle cx="12" cy="17" r="2.2" />
      </svg>
    ),
  },
  {
    href: "/upload",
    label: "Upload",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[18px] w-[18px]">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-1 rounded-full bg-ink/95 p-1.5 text-white shadow-pop backdrop-blur-xl">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-bold tracking-wide transition ${
                active ? "bg-white text-charcoal" : "text-white/60 hover:text-white"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
