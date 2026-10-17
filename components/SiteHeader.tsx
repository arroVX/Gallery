"use client";

import Link from "next/link";

export default function SiteHeader() {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header>
      {/* top dateline */}
      <div className="flex items-center justify-between bg-raspberry px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white sm:px-5">
        <span className="hidden sm:inline">{today.toUpperCase()}</span>
        <span className="ml-auto">EDITION NO. 01</span>
      </div>

      {/* masthead */}
      <div className="stripes-blue flex items-center justify-between border-b-[3px] border-black px-3 py-3 sm:px-5">
        <Link href="/" className="font-display leading-none tracking-wide text-[clamp(2.125rem,9vw,2.75rem)]">
          GALLERY<span className="align-super text-[18px] text-raspberry">.</span>
        </Link>
        <p className="hidden max-w-[220px] text-right font-hand text-[18px] font-semibold leading-tight md:block">
          captured moments ♥
        </p>
      </div>
    </header>
  );
}
