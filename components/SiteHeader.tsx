"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "HOME" },
  { href: "/gallery", label: "GALLERY" },
  { href: "/timeline", label: "TIMELINE" },
  { href: "/memories", label: "MEMORIES" },
  { href: "/upload", label: "UPLOAD" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header>
      {/* top dateline */}
      <div className="flex items-center justify-between bg-raspberry px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white sm:px-5">
        <span>★ EST. 2024 — KITA BERDUA</span>
        <span className="hidden sm:inline">{today.toUpperCase()}</span>
        <span>EDITION NO. 01</span>
      </div>

      {/* masthead */}
      <div className="stripes-blue flex items-center justify-between border-b-[3px] border-black px-3 py-3 sm:px-5">
        <Link href="/" className="font-display leading-none tracking-wide text-[clamp(2.125rem,9vw,2.75rem)]">
          GALLERY<span className="align-super text-[18px] text-raspberry">.</span>
        </Link>
        <p className="hidden max-w-[220px] text-right font-hand text-[18px] font-semibold leading-tight md:block">
          captured moments ♥
        </p>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="flex h-10 w-10 flex-col items-end justify-center gap-[5px] md:hidden"
        >
          <span className="h-[2.5px] w-6 bg-black" />
          <span className="h-[2.5px] w-4 bg-black" />
          <span className="h-[2.5px] w-6 bg-black" />
        </button>
      </div>

      {/* black navbar — like reference */}
      <nav className="hidden border-y-[3px] border-black bg-raspberry px-5 py-2.5 md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-7">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-[12px] font-extrabold tracking-[0.18em] text-white transition ${
                    active ? "underline underline-offset-8" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          <Link
            href="/gallery"
            className="border border-white bg-white px-4 py-1 text-[10px] font-extrabold tracking-[0.2em] text-black"
          >
            SEARCH
          </Link>
        </div>
      </nav>

      {/* mobile dropdown */}
      {open && (
        <nav className="border-t-[3px] border-black bg-raspberry px-4 py-3 md:hidden">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/15 py-3 text-[13px] font-extrabold tracking-[0.2em] text-white last:border-0"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
