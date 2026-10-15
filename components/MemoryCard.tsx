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
}: {
  event: TimelineEvent;
  photos: Photo[];
  onOpen: () => void;
}) {
  const cover = photos.find((p) => p.id === event.coverId) ?? photos[0];
  const rest = photos.filter((p) => p.id !== cover?.id).slice(0, 3);
  const extra = photos.length - 1 - rest.length;

  return (
    <article className="border-[3px] border-black bg-white shadow-hardSm">
      <button onClick={onOpen} className="block w-full p-2 text-left" aria-label={`Buka ${event.title}`}>
        {cover ? (
          <div className="grid h-44 grid-cols-5 gap-1.5 sm:h-56">
            <span className="relative col-span-3 block h-full overflow-hidden border-2 border-black bg-black/10">
              <Image
                src={thumb(cover.src, 600)}
                alt={event.title}
                width={cover.width}
                height={cover.height}
                sizes="(max-width: 768px) 60vw, 360px"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </span>
            <span className="col-span-2 grid h-full grid-rows-2 gap-1.5">
              {rest.length > 0 ? (
                rest.slice(0, 2).map((p, i) => (
                  <span key={p.id} className="relative block h-full min-h-0 overflow-hidden border-2 border-black bg-black/10">
                    <Image
                      src={thumb(p.src, 300)}
                      alt={p.caption}
                      width={p.width}
                      height={p.height}
                      sizes="(max-width: 768px) 35vw, 220px"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {i === 1 && extra > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/60 font-display text-[22px] text-white">
                        +{extra}
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="flex h-full items-center justify-center border-2 border-dashed border-black/40 p-2 text-center font-serif text-[11px] italic">
                  {photos.length} foto di momen ini
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
          <span className="block truncate px-1 font-serif text-[12px] italic opacity-70">
            {event.description}
          </span>
        )}
      </button>
      <div className="border-t-[3px] border-black bg-[#2A3757] px-3 py-2 text-center">
        <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-white">
          {event.date ? formatDate(event.date).toUpperCase() : "TANPA TANGGAL"} — {photos.length} FOTO
        </p>
      </div>
    </article>
  );
}
