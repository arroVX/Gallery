"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatDate, type Photo } from "@/lib/gallery";

const START = new Date("2024-02-14T00:00:00");
const daysTogether = Math.max(
  1,
  Math.floor((Date.now() - START.getTime()) / 86_400_000)
);

type Page =
  | { kind: "cover" }
  | { kind: "photo"; photo: Photo }
  | { kind: "wishes" }
  | { kind: "closing" }
  | { kind: "back" }
  | { kind: "blank" };

const STARS = [
  { top: "8%", left: "12%", s: 12 },
  { top: "15%", left: "78%", s: 9 },
  { top: "28%", left: "22%", s: 8 },
  { top: "38%", left: "85%", s: 12 },
  { top: "55%", left: "10%", s: 9 },
  { top: "66%", left: "70%", s: 8 },
  { top: "78%", left: "25%", s: 11 },
  { top: "86%", left: "82%", s: 9 },
  { top: "48%", left: "50%", s: 7 },
  { top: "20%", left: "50%", s: 7 },
];

function StarryBg() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {STARS.map((st, i) => (
        <span
          key={i}
          className="absolute text-white/80"
          style={{ top: st.top, left: st.left, fontSize: st.s }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function PageFace({ page }: { page: Page }) {
  if (page.kind === "cover") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#2A3757] p-4 text-center text-white">
        <StarryBg />
        <p className="text-[9px] font-extrabold tracking-[0.3em] text-white/70 sm:text-[10px]">
          ★ OUR STORY ★
        </p>
        <p className="mt-2 font-display text-[34px] leading-none sm:text-[48px]">
          FLIP-
          <br />
          BOOK
        </p>
        <p className="mt-2 font-script text-[26px] leading-none text-[#B9C4DC] sm:text-[32px]">
          kita berdua
        </p>
        <p className="mt-3 border border-white/50 px-3 py-1 font-mono text-[9px] font-bold tracking-[0.2em] sm:text-[10px]">
          VOL. 01 — {daysTogether} DAYS
        </p>
      </div>
    );
  }

  if (page.kind === "back") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#2A3757] p-4 text-center text-white">
        <StarryBg />
        <p className="font-script text-[30px] leading-none text-[#B9C4DC] sm:text-[40px]">
          I love you,
        </p>
        <p className="mt-1 font-display text-[30px] leading-none sm:text-[42px]">
          FOREVER
        </p>
        <p className="mt-3 text-[9px] font-extrabold tracking-[0.3em] text-white/70 sm:text-[10px]">
          ★ EST. 14 FEB 2024 ★
        </p>
      </div>
    );
  }

  if (page.kind === "wishes") {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#FBF6E9] p-4 text-center sm:p-5">
        <p className="text-[9px] font-extrabold tracking-[0.3em] text-[#5A6B94] sm:text-[10px]">
          ✦ WISHES FOR YOU ✦
        </p>
        <p className="mt-2 font-serif text-[12px] italic leading-relaxed text-[#3C4C6E] sm:text-[13.5px]">
          “Wishing you days as sweet as your laugh — may every ordinary moment
          turn golden as long as we face it together.”
        </p>
        <p className="mt-3 text-[15px] tracking-[0.3em] text-[#8E9CBE]">♥ ♥ ♥</p>
        <p className="mt-1 font-script text-[24px] leading-none text-[#5A6B94] sm:text-[28px]">
          make a wish!
        </p>
      </div>
    );
  }

  if (page.kind === "closing") {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#FBF6E9] p-4 text-center sm:p-5">
        <p className="font-display text-[22px] leading-tight text-[#3C4C6E] sm:text-[30px]">
          TO MANY
          <br />
          MORE MEMORIES
        </p>
        <p className="mt-2 font-script text-[26px] leading-none text-[#5A6B94] sm:text-[32px]">
          my sweet heart
        </p>
        <p className="mt-3 border-2 border-[#3C4C6E] px-4 py-1 text-[9px] font-extrabold tracking-[0.2em] text-[#3C4C6E] sm:text-[10px]">
          {daysTogether} DAYS & COUNTING
        </p>
      </div>
    );
  }

  if (page.kind === "blank") {
    return <div className="h-full bg-[#FBF6E9]" />;
  }

  const p = page.photo;
  return (
    <div className="flex h-full flex-col bg-[#FBF6E9] p-2 sm:p-2.5">
      <div className="relative border-2 border-[#3C4C6E]">
        <Image
          src={p.src}
          alt={p.caption}
          width={p.width}
          height={p.height}
          sizes="(max-width: 768px) 40vw, 300px"
          className="aspect-[4/5] w-full object-cover"
          loading="lazy"
        />
        {/* selotip sudut */}
        <span className="absolute -left-2 -top-2 h-4 w-10 -rotate-45 bg-[#8E9CBE]/50" aria-hidden />
        <span className="absolute -right-2 -top-2 h-4 w-10 rotate-45 bg-[#8E9CBE]/50" aria-hidden />
      </div>
      <p className="mt-1.5 truncate text-center font-display text-[12px] tracking-wide text-[#3C4C6E] sm:text-[14px]">
        {p.caption.toUpperCase()}
      </p>
      <p className="text-center font-mono text-[8.5px] font-bold tracking-[0.14em] text-[#3C4C6E]/60 sm:text-[9.5px]">
        {formatDate(p.takenAt).toUpperCase()}
      </p>
    </div>
  );
}

export default function Flipbook({ photos }: { photos: Photo[] }) {
  const pages: Page[] = useMemo(() => {
    const list: Page[] = [{ kind: "cover" }];
    photos.forEach((photo) => list.push({ kind: "photo", photo }));
    list.push({ kind: "wishes" }, { kind: "closing" }, { kind: "back" });
    if (list.length % 2 === 1) list.push({ kind: "blank" });
    return list;
  }, [photos]);

  const [pos, setPos] = useState(0); // index halaman kiri
  const [flip, setFlip] = useState<null | { dir: "next" | "prev" }>(null);
  const total = pages.length;
  const sheets = Math.ceil(total / 2);
  const sheet = Math.floor(pos / 2);

  const canPrev = pos > 0 && !flip;
  const canNext = pos + 2 < total && !flip;
  const goNext = () => {
    if (canNext) setFlip({ dir: "next" });
  };
  const goPrev = () => {
    if (canPrev) setFlip({ dir: "prev" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, flip, total]);

  if (photos.length === 0) {
    return (
      <div className="border-[3px] border-black bg-white p-10 text-center">
        <p className="font-display text-[22px] tracking-wide">BOOK MASIH KOSONG</p>
        <p className="mt-1 font-serif text-[13px] italic">Upload foto dulu untuk mengisi flipbook.</p>
      </div>
    );
  }

  const flipFront = flip?.dir === "next" ? pages[pos + 1] : pages[pos - 1];
  const flipBack = flip?.dir === "next" ? pages[pos + 2] : pages[pos];

  return (
    <div>
      {/* ── Buku ── */}
      <div className="[perspective:2200px]">
        <div className="relative mx-auto max-w-3xl border-[3px] border-black bg-white shadow-hard">
          <div className="relative grid h-[440px] grid-cols-2 sm:h-[540px]">
            {/* halaman kiri */}
            <div
              className={`relative overflow-hidden border-r-[1.5px] border-black ${canPrev ? "cursor-pointer" : ""}`}
              onClick={goPrev}
            >
              <PageFace page={pages[pos]} />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/15 to-transparent" />
              {canPrev && (
                <span className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-white text-[15px] font-extrabold">
                  ‹
                </span>
              )}
            </div>
            {/* halaman kanan */}
            <div
              className={`relative overflow-hidden border-l-[1.5px] border-black ${canNext ? "cursor-pointer" : ""}`}
              onClick={goNext}
            >
              <PageFace page={pages[pos + 1]} />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/15 to-transparent" />
              {canNext && (
                <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-white text-[15px] font-extrabold">
                  ›
                </span>
              )}
            </div>

            {/* jilid spiral tengah */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 flex w-0 flex-col items-center justify-evenly" aria-hidden>
              {Array.from({ length: 13 }).map((_, i) => (
                <span
                  key={i}
                  className="-ml-3 block h-3 w-3 rounded-full border-2 border-black bg-[#FCFDFF] sm:-ml-3.5 sm:h-3.5 sm:w-3.5"
                />
              ))}
            </div>

            {/* lembar yang dibalik */}
            {flip && flipFront && flipBack && (
              <motion.div
                key={`${pos}-${flip.dir}`}
                initial={{ rotateY: flip.dir === "next" ? 0 : -180 }}
                animate={{ rotateY: flip.dir === "next" ? -180 : 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                onAnimationComplete={() => {
                  setPos((p) => p + (flip.dir === "next" ? 2 : -2));
                  setFlip(null);
                }}
                style={{ transformStyle: "preserve-3d" }}
                className={`absolute inset-y-0 z-10 w-1/2 overflow-visible ${
                  flip.dir === "next"
                    ? "left-1/2 origin-left"
                    : "left-0 origin-right"
                }`}
              >
                <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
                  <PageFace page={flipFront} />
                </div>
                <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <PageFace page={flipBack} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Kontrol ── */}
      <div className="mx-auto mt-4 flex max-w-3xl items-center justify-between gap-2">
        <button
          onClick={goPrev}
          disabled={!canPrev}
          className="border-[3px] border-black bg-white px-5 py-2.5 text-[12px] font-extrabold tracking-[0.14em] shadow-hardSm disabled:opacity-30"
        >
          ← PREV
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: sheets }).map((_, i) => (
            <span
              key={i}
              className={`block h-2.5 w-2.5 border-2 border-black ${i === sheet ? "bg-black" : "bg-white"}`}
            />
          ))}
        </div>
        <button
          onClick={goNext}
          disabled={!canNext}
          className="border-[3px] border-black bg-black px-5 py-2.5 text-[12px] font-extrabold tracking-[0.14em] text-white shadow-hardSm disabled:opacity-30"
        >
          NEXT →
        </button>
      </div>
      <p className="mt-2 text-center font-mono text-[11px] font-bold tracking-[0.14em]">
        HAL {pos + 1}–{Math.min(pos + 2, total)} / {total}
      </p>
      <p className="mt-1 text-center font-serif text-[11.5px] italic opacity-70">
        Klik sisi buku / panah / geser keyboard ← → untuk membalik halaman
      </p>
    </div>
  );
}
