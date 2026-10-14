"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TIMELINE, formatDate } from "@/lib/gallery";
import { usePhotos } from "@/lib/store";
import PhotoLightbox from "@/components/PhotoLightbox";

const START = new Date("2024-02-14T00:00:00");
const daysTogether = Math.max(
  1,
  Math.floor((Date.now() - START.getTime()) / 86_400_000)
);

export default function Home() {
  const { photos } = usePhotos();
  const favorites = photos.filter((p) => p.favorite);
  const picks = (favorites.length > 0 ? favorites : photos).slice(0, 6);
  const hero = picks[0] ?? photos[0];
  const strip = picks.slice(0, 3);
  const bottom = picks[1] ?? photos[1] ?? hero;
  const [pickIndex, setPickIndex] = useState<number | null>(null);

  const updates = [
    `gallery — ${photos.length} foto`,
    `timeline — ${TIMELINE.length} cerita`,
    `favorites — ${favorites.length} disayang`,
    `days together — ${daysTogether} hari`,
  ];

  if (!hero) return <main className="p-10 text-center text-sm font-bold">Belum ada foto.</main>;

  return (
    <main className="px-3 py-4 sm:px-5">
      {/* ── FRONT PAGE TOP: hero + NEW UPDATE ── */}
      <section className="grid border-[3px] border-black bg-white md:grid-cols-2">
        {/* left big photo */}
        <div className="border-b-[3px] border-black p-2 md:border-b-0 md:border-r-[3px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="border-2 border-black"
          >
            <Image
              src={hero.src}
              alt={hero.caption}
              width={hero.width}
              height={hero.height}
              sizes="(max-width: 768px) 100vw, 480px"
              className="h-auto max-h-[520px] w-full object-cover"
              priority
            />
          </motion.div>
          <p className="px-1 py-2 text-center font-serif text-[11px] italic">
            {hero.caption} — {formatDate(hero.takenAt)}
          </p>
        </div>

        {/* right NEW UPDATE column */}
        <div className="flex flex-col">
          <h2 className="bg-black py-2.5 text-center font-display text-[20px] tracking-[0.2em] text-white">
            NEW UPDATE
          </h2>
          <ul>
            {updates.map((u) => (
              <li
                key={u}
                className="flex items-center gap-2 border-b-2 border-black px-4 py-2.5 text-[12px] font-bold"
              >
                <span aria-hidden>•</span> {u}
              </li>
            ))}
          </ul>
          <p className="mx-auto max-w-[38ch] px-6 py-5 text-center font-serif text-[12.5px] italic leading-relaxed">
            Having a friend is a real privilege and if you forget about them you run the risk
            of becoming like older people who are only interested in figures and numbers.
          </p>
          <div className="mx-auto mb-5 w-fit border-2 border-black px-8 py-1 text-[11px] font-bold">
            note: {daysTogether} days together
          </div>
          <div className="mt-auto flex border-t-[3px] border-black">
            <Link href="/gallery" className="flex-1 bg-black py-2.5 text-center text-[11px] font-extrabold tracking-[0.2em] text-white">
              SEE PHOTOS
            </Link>
            <Link href="/timeline" className="flex-1 py-2.5 text-center text-[11px] font-extrabold tracking-[0.2em]">
              OUR STORY
            </Link>
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP: 3 cards + label bars ── */}
      <section className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
        {strip.map((p, i) => (
          <motion.figure
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <button
              onClick={() => setPickIndex(i)}
              className="block w-full border-[3px] border-black bg-white p-1 shadow-hardSm sm:p-1.5"
              aria-label={`Buka ${p.caption}`}
            >
              <span className="block border-2 border-black">
                <Image
                  src={p.src}
                  alt={p.caption}
                  width={p.width}
                  height={p.height}
                  sizes="(max-width: 768px) 30vw, 280px"
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
              </span>
            </button>
            <figcaption
              className={`mt-1.5 border-2 border-black px-1 py-1.5 text-center text-[10px] font-extrabold tracking-wide sm:text-[11px] ${
                i === 1 ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              <span className="block truncate">
                {i === 1 ? p.caption.toUpperCase() : `@${(p.location || p.album).replace(/\s+/g, "").toLowerCase()}`}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </section>

      {/* ── FLIPBOOK PROMO ── */}
      <section className="mt-4 border-[3px] border-black bg-[#2A3757] text-white shadow-hardSm">
        <Link href="/flipbook" className="flex items-center justify-between gap-3 p-4 sm:p-5">
          <span>
            <span className="text-[9px] font-extrabold tracking-[0.3em] text-white/70 sm:text-[10px]">
              ★ NEW! BUKA HALAMANNYA ★
            </span>
            <span className="mt-1 block font-display text-[26px] leading-none sm:text-[36px]">
              OUR FLIPBOOK!
            </span>
            <span className="mt-1 block font-script text-[22px] leading-none text-[#B9C4DC] sm:text-[26px]">
              flip it, sweetheart
            </span>
          </span>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-white bg-white text-[20px] font-extrabold text-[#2A3757]">
            →
          </span>
        </Link>
      </section>

      {/* ── BOTTOM: headline + big photo ── */}
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        {/* left headline box */}
        <div className="flex flex-col border-[3px] border-black bg-white shadow-hardSm">
          <h2 className="border-b-[3px] border-black py-4 text-center font-display text-[44px] leading-none sm:text-[64px]">
            CUTE BOY!
          </h2>
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-6">
            <p className="font-script text-[42px] leading-none text-dustydeep sm:text-[54px]">My sweet</p>
            <p className="font-script text-[30px] leading-none text-dustydeep sm:text-[38px]">heart</p>
            <p className="mx-auto mt-4 max-w-[34ch] text-center font-serif text-[10.5px] leading-relaxed">
              When you find a diamond that doesn&apos;t belong to anyone, it&apos;s yours. When you
              find an island that doesn&apos;t belong to anyone, it&apos;s yours. The stars are
              ours because no one before us ever dreamed of owning them.
            </p>
            <Link
              href="/gallery"
              className="mt-5 border-2 border-black bg-black px-6 py-2 text-[11px] font-extrabold tracking-[0.2em] text-white"
            >
              OPEN GALLERY
            </Link>
          </div>
        </div>

        {/* right big photo, thick frame */}
        <div className="border-[3px] border-black bg-black p-2 shadow-hardSm">
          <div className="border-2 border-white">
            {bottom && (
              <Image
                src={bottom.src}
                alt={bottom.caption}
                width={bottom.width}
                height={bottom.height}
                sizes="(max-width: 768px) 100vw, 480px"
                className="h-auto max-h-[460px] w-full object-cover"
                loading="lazy"
              />
            )}
          </div>
          {bottom && (
            <p className="py-2 text-center text-[11px] font-bold tracking-[0.14em] text-white">
              {bottom.caption.toUpperCase()} — {formatDate(bottom.takenAt).toUpperCase()}
            </p>
          )}
        </div>
      </section>

      {/* ── FOOTER STRIP ── */}
      <div className="mt-4 border-[3px] border-black bg-black py-2 text-center text-[10px] font-extrabold tracking-[0.3em] text-white">
        KITA ★ BEYOND COLOR ★ PURE EMOTION ★ {daysTogether} DAYS
      </div>

      <PhotoLightbox photos={picks} index={pickIndex} onClose={() => setPickIndex(null)} onNav={setPickIndex} />
    </main>
  );
}
