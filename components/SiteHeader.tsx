"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/timeline", label: "Timeline" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-10">
        {/* Logo — Noir style */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-charcoal">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight">
            KITA<span className="text-charcoal">.</span>
          </span>
        </Link>

        {/* Center — Luna style */}
        <p className="hidden text-[11px] font-semibold tracking-wide text-charcoal/60 lg:block">
          Based in: Memories Since 2024
        </p>

        {/* Desktop nav — Luna style */}
        <div className="hidden items-center gap-7 md:flex">
          <nav className="flex items-center gap-6">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-[13px] font-semibold transition ${
                    active ? "text-charcoal" : "text-charcoal/55 hover:text-charcoal"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/upload"
            className="rounded-full bg-charcoal px-4 py-2 text-[12px] font-bold text-white transition hover:bg-black active:scale-95"
          >
            + Upload
          </Link>
        </div>

        {/* Hamburger — Noir/Luna */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="flex h-10 w-10 flex-col items-end justify-center gap-[5px] md:hidden"
        >
          <span className={`h-[2px] bg-charcoal transition-all ${open ? "w-6 -rotate-45 translate-y-[7px]" : "w-6"}`} />
          <span className={`h-[2px] bg-charcoal transition-all ${open ? "opacity-0" : "w-4"}`} />
          <span className={`h-[2px] bg-charcoal transition-all ${open ? "w-6 rotate-45 -translate-y-[7px]" : "w-6"}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-black/[0.06] bg-white px-5 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-bold tracking-tight hover:bg-black/[0.04]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/upload"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-charcoal px-4 py-3 text-center text-sm font-bold text-white"
            >
              + Upload Foto
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
