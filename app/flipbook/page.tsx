"use client";

import Link from "next/link";
import Flipbook from "@/components/Flipbook";
import { usePhotos } from "@/lib/store";

export default function FlipbookPage() {
  const { photos } = usePhotos();

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

      <div className="mt-4">
        <Flipbook photos={photos} />
      </div>

      <div className="mt-4 border-[3px] border-black bg-black py-2 text-center text-[10px] font-extrabold tracking-[0.3em] text-white">
        <Link href="/gallery">← KEMBALI KE GALLERY</Link>
      </div>
    </main>
  );
}
