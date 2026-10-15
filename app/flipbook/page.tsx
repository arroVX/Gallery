"use client";

import { useState } from "react";
import Link from "next/link";
import Flipbook from "@/components/Flipbook";
import { usePhotos } from "@/lib/store";

export default function FlipbookPage() {
  const { photos: all } = usePhotos();
  const favCount = all.filter((p) => p.favorite).length;
  const [scope, setScope] = useState<"all" | "fav">("all");
  const photos = scope === "fav" ? all.filter((p) => p.favorite) : all;

  return (
    <main className="px-3 py-4 sm:px-5">
      <div className="border-[3px] border-black bg-white shadow-hardSm">
        <p className="border-b-[3px] border-black py-1.5 text-center text-[10px] font-extrabold tracking-[0.3em]">
          ★ FLIPBOOK ★
        </p>
        <h1 className="py-4 text-center font-display text-[40px] leading-none sm:text-[64px]">
          OUR FLIPBOOK!
        </h1>
        <p className="border-t-[3px] border-black py-2 text-center font-serif text-[12px] italic">
          {photos.length} foto tersimpan dalam buku — balik halamannya satu per satu.
        </p>
      </div>

      {favCount > 0 && (
        <div className="mx-auto mt-4 flex max-w-3xl gap-2">
          {(["all", "fav"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`flex-1 border-[3px] border-black py-2 text-[11px] font-extrabold tracking-[0.14em] ${
                scope === s ? "bg-black text-white shadow-hardSm" : "bg-white"
              }`}
            >
              {s === "all" ? `SEMUA (${all.length})` : `★ FAVORIT (${favCount})`}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Flipbook photos={photos} />
      </div>

      <div className="mt-4 border-[3px] border-black bg-black py-2 text-center text-[10px] font-extrabold tracking-[0.3em] text-white">
        <Link href="/gallery">← KEMBALI KE GALLERY</Link>
      </div>
    </main>
  );
}
