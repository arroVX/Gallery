import TimelineView from "@/components/TimelineView";

export const metadata = { title: "Timeline — KITA." };

export default function TimelinePage() {
  return (
    <main className="px-3 py-4 sm:px-5">
      <div className="border-[3px] border-black bg-white shadow-hardSm">
        <p className="border-b-[3px] border-black py-1.5 text-center text-[10px] font-extrabold tracking-[0.3em]">
          ★ OUR JOURNEY ★
        </p>
        <h1 className="py-4 text-center font-display text-[42px] leading-none sm:text-[64px]">
          CERITA KITA!
        </h1>
        <p className="border-t-[3px] border-black py-2 text-center font-serif text-[12px] italic">
          Gulir pelan-pelan. Setiap titik adalah satu bab kecil kita.
        </p>
      </div>
      <div className="mx-auto mt-6 max-w-2xl">
        <TimelineView />
      </div>
    </main>
  );
}
