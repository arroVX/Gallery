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
  const rest = photos.filter((p) => p.id !== cover?.id).slice(0, 3);
  const extra = photos.length - 1 - rest.length;

  return (
    <article className="relative w-full min-w-0 border-[3px] border-black bg-white shadow-hardSm">
      {typeof num === "number" && (
        <span className="sticker absolute -left-2 -top-3 z-10 flex h-9 w-9 rotate-[-6deg] items-center justify-center border-2 border-black bg-raspberry font-display text-[15px] text-white">
          {String(num + 1).padStart(2, "0")}
        </span>
      )}
      <button onClick={onOpen} className="block w-full min-w-0 p-2 text-left" aria-label={`Buka ${event.title}`}>
        {cover ? (
          <div className="w-full min-w-0 overflow-hidden">
            {/* Foto utama full-width rasio 4:3 proporsional */}
            <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden border-2 border-black bg-black/10">
              <Image
                src={thumb(cover.src, 800, cover.rotate ?? 0)}
                alt={event.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
                className="object-cover"
                loading="lazy"
              />
            </div>
            {rest.length > 0 && (
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {rest.map((p, i) => (
                  <span
                    key={p.id}
                    className="relative block aspect-square w-full min-w-0 overflow-hidden border-2 border-black bg-black/10"
                  >
                    <Image
                      src={thumb(p.src, 300, p.rotate ?? 0)}
                      alt={p.caption ?? "foto"}
                      fill
                      sizes="(max-width: 640px) 30vw, 150px"
                      className="object-cover"
                      loading="lazy"
                    />
                    {i === rest.length - 1 && extra > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-display text-[18px] text-white">
                        +{extra}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
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
