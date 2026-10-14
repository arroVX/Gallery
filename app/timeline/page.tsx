import TimelineView from "@/components/TimelineView";

export const metadata = { title: "Timeline — KITA." };

export default function TimelinePage() {
  return (
    <main className="px-5 pt-8 md:px-10 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-block rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-bold tracking-wide">
            Our Journey
          </p>
          <h1 className="mt-3 text-[42px] font-extrabold leading-[0.95] tracking-tighter sm:text-[64px]">
            Cerita Kita
          </h1>
        </div>
        <p className="max-w-[220px] text-right text-[12.5px] font-medium leading-relaxed text-charcoal/60">
          Gulir pelan-pelan. Setiap titik adalah satu bab kecil kita.
        </p>
      </div>
      <div className="mt-8 max-w-2xl">
        <TimelineView />
      </div>
    </main>
  );
}
