"use client";

import Image from "next/image";
import { formatDate, thumb, type Photo, type TimelineEvent } from "@/lib/gallery";

export function resolveMemoryPhotos(
  event: TimelineEvent,
  all: Photo[]
): Photo[] {
  const byId = new Map(all.map((p) => [p.id, p]));
  const ordered = event.photoIds
    .map((id) => byId.get(id))
    .filter((p): p is Photo => !!p);
  // Foto yang tidak terdaftar di photoIds tapi jadi cover tetap ikut.
  const cover = byId.get(event.coverId);
  if (cover && !ordered.some((p) => p.id === cover.id)) ordered.unshift(cover);
  return ordered;
}

// Satu memory card multi-foto: kolase cover + footer judul/tanggal.
// Klik di mana saja untuk membuka slider detail.
export default function MemoryCard({
  event,
  photos,
  onOpen,
  num,
}: {
  event: TimelineEvent;
  photos: Photo[];
  onOpen: () => void;
  num?: number;
}) {
  const cover = photos.find((p) => p.id === event.coverId) ?? photos[0];
  const rest = photos.filter((p) => p.id !== cover?.id).slice(0, 2);
  const extra = photos.length - 1 - rest.length;

  return (
    <article className="relative border-[3px] border-black bg-white shadow-hardSm">
      {typeof num === "number" && (
        <span className="sticker absolute -left-2 -top-3 z-10 flex h-9 w-9 rotate-[-6deg] items-center justify-center border-2 border-black bg-raspberry font-display text-[15px] text-white">
          {String(num + 1).padStart(2, "0")}
        </span>
      )}
      <button onClick={onOpen} className="block w-full p-2 text-left" aria-label={`Buka ${event.title}`}>
        {cover ? (
          <div className="grid h-44 grid-cols-[3fr_2fr] grid-rows-1 gap-1.5 overflow-hidden sm:h-52">
            {/* Cover photo — left, tall */}
            <span className="relative block h-full min-h-0 min-w-0 overflow-hidden border-2 border-black bg-black/10">
              <Image
                src={thumb(cover.src, 600)}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 58vw, 340px"
                className="object-cover"
                loading="lazy"
              />
            </span>
            {/* Right column — 2 stacked thumbnails */}
            <span className="grid h-full min-h-0 min-w-0 grid-rows-2 gap-1.5">
              {rest.length > 0 ? (
                rest.map((p, i) => (
                  <span key={p.id} className="relative block min-h-0 overflow-hidden border-2 border-black bg-black/10">
                    <Image
                      src={thumb(p.src, 300)}
                      alt={p.caption ?? "foto"}
                      fill
                      sizes="(max-width: 768px) 38vw, 220px"
                      className="object-cover"
                      loading="lazy"
                    />
                    {i === 1 && extra > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-display text-[20px] text-white">
                        +{extra}
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="col-span-full flex h-full items-center justify-center border-2 border-dashed border-black/40 p-2 text-center font-serif text-[11px] italic">
                  {photos.length} foto
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className="border-2 border-dashed border-black bg-white p-8 text-center">
            <p className="font-display text-[18px] tracking-wide">NO PHOTOS</p>
            <p className="mt-1 font-serif text-[12px] italic">Foto momen ini sudah dihapus dari galeri.</p>
          </div>
        )}
        <span className="mt-2 block truncate px-1 font-display text-[20px] tracking-wide">
          {event.title.toUpperCase()}
        </span>
        {event.description && (
          <span className="block truncate px-1 font-hand text-[16px] font-semibold opacity-80">
            {event.description}
          </span>
        )}
      </button>
      <div className="border-t-[3px] border-black bg-raspberry px-3 py-2 text-center">
        <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-white">
          {event.date ? formatDate(event.date).toUpperCase() : "TANPA TANGGAL"} — {photos.length} FOTO
        </p>
      </div>
    </article>
  );
}
