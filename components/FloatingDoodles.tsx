"use client";

// Doodle hati/bintang/bunga yang melayang di background.
// Posisi & durasi dari seed tetap (bukan Math.random saat render)
// agar SSR dan client selalu sama — tanpa flicker hidrasi.
const DOODLES = [
  { ch: "♥", left: "4%", size: 18, dur: "26s", delay: "0s", color: "text-raspberry" },
  { ch: "✦", left: "12%", size: 14, dur: "32s", delay: "-8s", color: "text-dustydeep" },
  { ch: "❀", left: "21%", size: 16, dur: "29s", delay: "-15s", color: "text-raspberry" },
  { ch: "♥", left: "30%", size: 12, dur: "24s", delay: "-5s", color: "text-dustydeep" },
  { ch: "✦", left: "39%", size: 20, dur: "35s", delay: "-20s", color: "text-raspberry" },
  { ch: "❀", left: "48%", size: 13, dur: "27s", delay: "-11s", color: "text-dustydeep" },
  { ch: "♥", left: "57%", size: 17, dur: "31s", delay: "-3s", color: "text-raspberry" },
  { ch: "✦", left: "66%", size: 12, dur: "25s", delay: "-17s", color: "text-dustydeep" },
  { ch: "❀", left: "74%", size: 19, dur: "33s", delay: "-9s", color: "text-raspberry" },
  { ch: "♥", left: "83%", size: 14, dur: "28s", delay: "-22s", color: "text-dustydeep" },
  { ch: "✦", left: "91%", size: 16, dur: "30s", delay: "-13s", color: "text-raspberry" },
  { ch: "❀", left: "96%", size: 12, dur: "23s", delay: "-6s", color: "text-dustydeep" },
];

export default function FloatingDoodles() {
  return (
    <div aria-hidden className="doodle-layer">
      {DOODLES.map((d, i) => (
        <span
          key={i}
          className={d.color}
          style={{
            left: d.left,
            bottom: "-8vh",
            fontSize: d.size,
            animationDuration: d.dur,
            animationDelay: d.delay,
          }}
        >
          {d.ch}
        </span>
      ))}
    </div>
  );
}
