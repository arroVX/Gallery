"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePhotos, useTimeline } from "@/lib/store";
import MemoryCard, { resolveMemoryPhotos } from "@/components/MemoryCard";
import PhotoLightbox from "@/components/PhotoLightbox";

export default function MemoriesPage() {
  const { photos: all, loading } = usePhotos();
  const { events, error } = useTimeline();
  const [openId, setOpenId] = useState<string | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const openPhotos = useMemo(() => {
    const ev = events.find((e) => e.id === openId);
    if (!ev) return [];
    return resolveMemoryPhotos(ev, all);
  }, [events, all, openId]);

  // Kartu yang fotonya sudah habis dihapus tidak ditampilkan ke pengunjung —
  // perbaiki lewat /memories/kelola (tombol EDIT).
  const visibleEvents = useMemo(
    () => events.filter((e) => resolveMemoryPhotos(e, all).length > 0),
    [events, all]
  );

  const open = (id: string) => {
    setOpenId(id);
    setIndex(0);
  };
  const close = () => {
    setOpenId(null);
    setIndex(null);
  };

  return (
    <main className="px-3 py-4 sm:px-5">
      <div className="relative border-[3px] border-black bg-white shadow-hardSm">
        <span aria-hidden className="tape absolute -top-3 left-8 z-10 h-6 w-20 -rotate-6" />
        <span aria-hidden className="tape-rose absolute -top-3 right-8 z-10 h-6 w-20 rotate-6" />
        <p className="border-b-[3px] border-black py-1.5 text-center text-[10px] font-extrabold tracking-[0.3em]">
          ★ MEMORY CARDS ★
        </p>
        <h1 className="py-4 text-center font-display leading-none text-[clamp(2.625rem,11vw,4rem)]">
          OUR MOMENTS!
        </h1>
        <p className="border-t-[3px] border-black py-2 text-center font-hand text-[16px] font-semibold">
          {visibleEvents.length === 0 ? "Belum ada momen — bikin satu yuk ♥" : `${visibleEvents.length} momen • ${all.length} foto`}
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/memories/kelola"
          className="sticker inline-block border-[3px] border-black bg-raspberry px-6 py-2.5 text-[12px] font-extrabold tracking-[0.2em] text-white"
        >
          + BIKIN MOMEN BARU
        </Link>
      </div>

      {error && (
        <p className="mt-4 border-2 border-red-600 bg-red-50 p-3 text-[13px] font-bold text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
          <p className="font-serif text-[12px] italic">Memuat momen…</p>
        </div>
      ) : visibleEvents.length === 0 && !error ? (
        <div className="mt-4 border-[3px] border-dashed border-black bg-white p-10 text-center">
          <p className="font-display text-[22px] tracking-wide">BELUM ADA MOMEN</p>
          <p className="mt-1 font-serif text-[13px] italic">
            Pilih beberapa foto dari galeri dan jadikan satu kartu momen.
          </p>
        </div>
      ) : (
        <div className="mx-auto mt-4 grid max-w-4xl gap-4 sm:grid-cols-2">
          {visibleEvents.map((ev, n) => (
            <MemoryCard
              key={ev.id}
              event={ev}
              photos={resolveMemoryPhotos(ev, all)}
              onOpen={() => open(ev.id)}
              num={n}
            />
          ))}
        </div>
      )}

      <PhotoLightbox photos={openPhotos} index={index} onClose={close} onNav={setIndex} />

      <p className="mt-6 text-center font-mono text-[9px] opacity-40">build mc4</p>
    </main>
  );
}
