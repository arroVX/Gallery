"use client";

// Pita teks berjalan ala zine — konten digandakan 2x agar loop mulus.
export default function Marquee({
  items,
  speed = 22,
  reverse = false,
  className = "",
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {items.map((t, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-4 font-display text-[15px] tracking-[0.2em]">{t}</span>
          <span className="text-raspberry">♥</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`overflow-hidden border-y-[3px] border-black bg-cream py-2 text-black ${reverse ? "marquee-reverse" : ""} ${className}`}
    >
      <div className="marquee-track" style={{ ["--marquee-speed" as string]: `${speed}s` }}>
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
