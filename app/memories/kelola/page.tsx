"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { addMemory, removeMemory, usePhotos, useTimeline } from "@/lib/store";
import { resolveMemoryPhotos } from "@/components/MemoryCard";
import { thumb } from "@/lib/gallery";

export default function KelolaMemoriesPage() {
  const { photos: all } = usePhotos();
  const { events } = useTimeline();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [coverId, setCoverId] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!prev.includes(id) && !coverId) setCoverId(id);
      if (prev.includes(id) && coverId === id) setCoverId(next[0] ?? "");
      return next;
    });

  const login = async () => {
    setError(null);
    try {
      if (!auth) return;
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Gagal masuk. Cek email & kata sandi.");
    }
  };

  const save = async () => {
    setError(null);
    setDone(null);
    if (!title.trim()) return setError("Isi judul momen dulu.");
    if (picked.length === 0) return setError("Pilih minimal 1 foto.");
    setSaving(true);
    try {
      await addMemory({
        title: title.trim(),
        date,
        description: description.trim(),
        coverId: coverId || picked[0],
        photoIds: picked,
      });
      setDone(`Momen "${title.trim()}" tersimpan (${picked.length} foto).`);
      setTitle("");
      setDescription("");
      setPicked([]);
      setCoverId("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Gagal menyimpan: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Hapus momen "${name}"? (Fotonya tetap ada di galeri)`)) return;
    setBusyId(id);
    try {
      await removeMemory(id);
    } catch (e) {
      setError(`Gagal menghapus: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-3 py-4 sm:px-5">
      <div className="border-[3px] border-black bg-white shadow-hardSm">
        <p className="border-b-[3px] border-black py-1.5 text-center text-[10px] font-extrabold tracking-[0.3em]">
          ★ MANAGE ★
        </p>
        <h1 className="py-4 text-center font-display text-[36px] leading-none sm:text-[48px]">
          KELOLA MOMEN!
        </h1>
        <p className="border-t-[3px] border-black py-2 text-center font-serif text-[12px] italic">
          Gabungkan beberapa foto jadi satu kartu — ketuk kartu untuk slide.
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/memories"
          className="inline-block border-2 border-black bg-white px-5 py-2 text-[11px] font-extrabold tracking-[0.2em]"
        >
          ← LIHAT SEMUA MOMEN
        </Link>
      </div>

      {isFirebaseConfigured && !user && (
        <div className="mt-4 border-[3px] border-black bg-white p-4 shadow-hardSm">
          <p className="font-display text-[18px] tracking-wide">MASUK DULU</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            inputMode="email"
            className="mt-2 w-full border-2 border-black bg-white px-3 py-2.5 text-sm outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="kata sandi"
            type="password"
            className="mt-2 w-full border-2 border-black bg-white px-3 py-2.5 text-sm outline-none"
          />
          <button
            onClick={login}
            className="mt-2 w-full border-2 border-black bg-black py-2.5 text-sm font-extrabold tracking-widest text-white"
          >
            MASUK
          </button>
        </div>
      )}

      {isFirebaseConfigured && user && (
        <div className="mt-4 flex items-center justify-between border-[3px] border-black bg-white px-4 py-2.5">
          <p className="text-xs font-bold">{user.email}</p>
          <button
            onClick={() => auth && signOut(auth)}
            className="border-2 border-black px-3 py-1 text-xs font-extrabold"
          >
            KELUAR
          </button>
        </div>
      )}

      {user && (
        <div className="gridpaper mt-4 space-y-2 border-[3px] border-black p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul momen — misal: Trip ke Dieng"
            className="w-full border-2 border-black bg-white px-3 py-2.5 text-sm outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="border-2 border-black bg-white px-3 py-2.5 text-sm outline-none"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat"
              className="border-2 border-black bg-white px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <p className="pt-1 text-[11px] font-extrabold tracking-[0.14em]">
            PILIH FOTO ({picked.length}) — KETUK ★ UNTUK JADIKAN COVER
          </p>
          {all.length === 0 ? (
            <p className="border-2 border-dashed border-black p-4 text-center font-serif text-[12px] italic">
              Belum ada foto di galeri. Upload dulu.
            </p>
          ) : (
            <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto border-2 border-black p-2">
              {all.map((p) => {
                const active = picked.includes(p.id);
                const isCover = coverId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`relative border-2 bg-white p-1 ${active ? "border-black" : "border-black/20 opacity-70"}`}
                  >
                    <button onClick={() => toggle(p.id)} className="block w-full" aria-label={`Pilih ${p.caption}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb(p.src, 300)} alt={p.caption} className="h-20 w-full border border-black object-cover" loading="lazy" />
                    </button>
                    {active && (
                      <button
                        onClick={() => setCoverId(p.id)}
                        className={`absolute left-2 top-2 border border-black px-1.5 py-0.5 text-[11px] font-bold ${isCover ? "bg-black text-white" : "bg-white"}`}
                        aria-label="Jadikan cover"
                      >
                        ★
                      </button>
                    )}
                    {active && (
                      <span className="absolute bottom-1 right-1 border border-black bg-black px-1.5 text-[10px] font-bold text-white">
                        {picked.indexOf(p.id) + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="border-2 border-black bg-white p-2 text-[13px] font-bold">{error}</p>}
          {done && <p className="border-2 border-black bg-black p-2 text-[13px] font-bold text-white">{done}</p>}

          <button
            onClick={save}
            disabled={saving || picked.length === 0}
            className="sticker w-full border-[3px] border-black bg-raspberry py-3 text-sm font-extrabold tracking-[0.2em] text-white disabled:opacity-40"
          >
            {saving ? "MENYIMPAN…" : `SIMPAN MOMEN (${picked.length} FOTO)`}
          </button>
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-4 border-[3px] border-black bg-white p-4">
          <p className="font-display text-[18px] tracking-wide">MOMEN TERSIMPAN ({events.length})</p>
          <div className="mt-2 space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between gap-2 border-2 border-black px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{ev.title}</p>
                  <p className="font-mono text-[11px] opacity-70">
                    {ev.date} — {resolveMemoryPhotos(ev, all).length} foto
                  </p>
                </div>
                <button
                  onClick={() => remove(ev.id, ev.title)}
                  disabled={busyId === ev.id}
                  className="shrink-0 border-2 border-red-700 px-3 py-1 text-xs font-extrabold text-red-700 disabled:opacity-40"
                >
                  {busyId === ev.id ? "…" : "HAPUS"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
