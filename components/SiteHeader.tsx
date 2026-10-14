"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled ? "bg-ivory/85 shadow-card backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <Link href="/" className="font-serif text-2xl tracking-wide">
          Kita<span className="text-rosewood">.</span>
        </Link>
        <Link
          href="/upload"
          className="rounded-full border border-charcoal/15 bg-white/70 px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur"
        >
          + Upload
        </Link>
      </div>
    </header>
  );
}
