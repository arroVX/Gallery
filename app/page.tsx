"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PHOTOS, TIMELINE, formatDate } from "@/lib/gallery";
import { usePhotos } from "@/lib/store";

const START = new Date("2024-02-14T00:00:00");
const daysTogether = Math.max(
  1,
  Math.floor((Date.now() - START.getTime()) / 86_400_000)
);

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
};

export default function Home() {
  const { photos } = usePhotos();
  const favorites = photos.filter((p) => p.favorite);
  const hero = favorites[0] ?? PHOTOS[10];
  return (
    <main>
      {/* Hero */}
      <section className="relative -mt-14 h-[92dvh] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={hero.src}
            alt={hero.caption}
            fill
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/15 to-charcoal/10" />
        <div className="absolute inset-x-0 bottom-0 p-5 pb-8">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="font-hand text-2xl text-ivory/90"
          >
            untuk kita berdua,
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55 }}
            className="mt-1 font-serif text-5xl leading-[1.02] text-ivory"
          >
            Setiap momen,
            <br />
            disimpan rapi.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 flex gap-2"
          >
            <Link
              href="/gallery"
              className="flex-1 rounded-full bg-ivory px-5 py-3 text-center text-sm font-bold text-charcoal active:scale-95"
            >
              Lihat Galeri
            </Link>
            <Link
              href="/timeline"
              className="flex-1 rounded-full border border-ivory/50 px-5 py-3 text-center text-sm font-bold text-ivory backdrop-blur-sm active:scale-95"
            >
              Cerita Kita
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-3 text-center text-[11px] font-semibold tracking-widest text-ivory/70"
          >
            {daysTogether} HARI BERSAMA — SEJAK 14 FEB 2024
          </motion.p>
        </div>
      </section>

      {/* Favorit */}
      <section className="px-5 pt-8">
        <motion.div {...fadeUp} className="flex items-end justify-between">
          <div>
            <p className="font-hand text-xl text-rosewood">paling disayang</p>
            <h2 className="font-serif text-3xl">Favorit kita</h2>
          </div>
          <Link href="/gallery" className="text-xs font-bold text-rosewood">
            Semua →
          </Link>
        </motion.div>
        <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {favorites.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="w-56 shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-card"
            >
              <div className="relative h-64 w-56">
                <Image src={p.src} alt={p.caption} fill sizes="224px" className="object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <p className="line-clamp-1 font-serif text-base leading-snug">{p.caption}</p>
                <p className="font-hand text-sm text-rosewood">{formatDate(p.takenAt)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cerita */}
      <section className="px-5 pt-8">
        <motion.div {...fadeUp}>
          <p className="font-hand text-xl text-rosewood">dari awal sampai kini</p>
          <h2 className="font-serif text-3xl">Cuplikan cerita</h2>
        </motion.div>
        <div className="mt-3 space-y-3">
          {TIMELINE.slice(0, 3).map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href="/timeline" className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
                <span className="font-serif text-2xl text-rosewood/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-serif text-lg leading-tight">{ev.title}</span>
                  <span className="block font-hand text-sm text-muted">{formatDate(ev.date)}</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        <Link
          href="/timeline"
          className="mt-3 block rounded-full border border-charcoal/15 bg-white py-3 text-center text-sm font-bold"
        >
          Buka semua cerita
        </Link>
      </section>

      {/* Quote */}
      <motion.section {...fadeUp} className="px-5 pt-10 text-center">
        <p className="font-hand text-2xl text-rosewood">“</p>
        <p className="mx-auto max-w-[28ch] font-serif text-2xl italic leading-snug">
          Yang sederhana, justru paling lama diingat.
        </p>
        <p className="mt-2 text-[11px] font-bold tracking-widest text-muted">— KITA</p>
      </motion.section>
    </main>
  );
}
