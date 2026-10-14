import TimelineView from "@/components/TimelineView";

export const metadata = { title: "Cerita Kita — Kita" };

export default function TimelinePage() {
  return (
    <main className="px-5 pt-4">
      <p className="font-hand text-xl text-rosewood">linimasa cinta</p>
      <h1 className="font-serif text-4xl">Cerita Kita</h1>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">
        Gulir pelan-pelan. Setiap titik adalah satu bab kecil kita.
      </p>
      <div className="mt-5">
        <TimelineView />
      </div>
    </main>
  );
}
