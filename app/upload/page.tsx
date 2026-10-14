"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
import { ALBUMS } from "@/lib/gallery";
import { auth, db, isFirebaseConfigured, storage } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect } from "react";

type Pick = { file: File; preview: string };

export default function UploadPage() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [takenAt, setTakenAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [album, setAlbum] = useState<string>("Harian");
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  const onDrop = useCallback((files: File[]) => {
    setError(null);
    setDone(null);
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    setPicks((prev) =>
      [...prev, ...imgs.map((file) => ({ file, preview: URL.createObjectURL(file) }))].slice(0, 10)
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });

  const remove = (i: number) => setPicks((p) => p.filter((_, x) => x !== i));

  const login = async () => {
    setError(null);
    try {
      if (!auth) return;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError("Gagal masuk. Cek email & kata sandi.");
    }
  };

  const submit = async () => {
    setError(null);
    setDone(null);
    if (picks.length === 0) return setError("Pilih minimal 1 foto dulu.");
    if (!isFirebaseConfigured || !db || !storage || !auth?.currentUser) {
      // Mode demo: simulasi progres
      setProgress(0);
      const t = setInterval(() => {
        setProgress((p) => {
          if (p === null) return 0;
          if (p >= 100) {
            clearInterval(t);
            setDone(`${picks.length} foto siap. Sambungkan Firebase untuk upload asli.`);
            setPicks([]);
            return null;
          }
          return p + 20;
        });
      }, 250);
      return;
    }
    try {
      let doneCount = 0;
      for (const { file } of picks) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        let width = 800;
        let height = 1000;
        try {
          const bmp = await createImageBitmap(compressed);
          width = bmp.width;
          height = bmp.height;
          bmp.close();
        } catch {
          // abaikan, pakai default
        }
        const path = `photos/${takenAt.slice(0, 7)}/${Date.now()}-${file.name}`;
        const r = ref(storage, path);
        const task = uploadBytesResumable(r, compressed, { contentType: "image/jpeg" });
        const url: string = await new Promise((resolve, reject) => {
          task.on(
            "state_changed",
            (s) =>
              setProgress(
                Math.round(
                  ((doneCount + s.bytesTransferred / s.totalBytes) / picks.length) * 100
                )
              ),
            reject,
            async () => resolve(await getDownloadURL(task.snapshot.ref))
          );
        });
        await addDoc(collection(db, "photos"), {
          imageUrl: url,
          storagePath: path,
          width,
          height,
          caption: caption || file.name,
          location,
          takenAt,
          album,
          uploadedAt: serverTimestamp(),
          isFavorite: false,
        });
        doneCount++;
      }
      setProgress(null);
      setDone(`${doneCount} foto berhasil diupload.`);
      setPicks([]);
      setCaption("");
    } catch {
      setProgress(null);
      setError("Upload gagal. Coba lagi.");
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 pt-8 md:pt-12">
      <p className="inline-block rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-bold tracking-wide">
        Add Memory
      </p>
      <h1 className="mt-3 text-[42px] font-extrabold leading-[0.95] tracking-tighter sm:text-[56px]">
        Upload
      </h1>
      <p className="mt-2 max-w-[40ch] text-[13px] font-medium leading-relaxed text-charcoal/60">
        Tambah kenangan baru — otomatis dikompres sebelum tersimpan rapi di galeri.
      </p>

      {!isFirebaseConfigured && (
        <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-[13px] leading-relaxed">
          Firebase belum dikonfigurasi. Isi env <code>NEXT_PUBLIC_FIREBASE_*</code> lalu
          upload asli aktif. Untuk sekarang hanya mode pratinjau.
        </div>
      )}

      {isFirebaseConfigured && !user && (
        <div className="mt-6 rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-card">
          <p className="text-sm font-extrabold tracking-tight">Masuk dulu (khusus kalian berdua)</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            inputMode="email"
            className="mt-2 w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm outline-none focus:border-charcoal"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="kata sandi"
            type="password"
            className="mt-2 w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm outline-none focus:border-charcoal"
          />
          <button onClick={login} className="mt-2 w-full rounded-full bg-charcoal py-2.5 text-sm font-bold text-white">
            Masuk
          </button>
        </div>
      )}

      {isFirebaseConfigured && user && (
        <div className="mt-6 flex items-center justify-between rounded-[20px] border border-black/[0.06] bg-white px-4 py-2.5 shadow-card">
          <p className="text-xs font-semibold text-muted">{user.email}</p>
          <button onClick={() => auth && signOut(auth)} className="text-xs font-bold text-charcoal underline">
            Keluar
          </button>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`mt-6 rounded-[22px] border-2 border-dashed p-8 text-center transition ${
          isDragActive ? "border-charcoal bg-black/[0.04]" : "border-black/15 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-[17px] font-extrabold tracking-tight">{isDragActive ? "Lepaskan di sini" : "Ketuk / seret foto ke sini"}</p>
        <p className="mt-1 text-xs font-medium text-charcoal/55">Maks 10 foto, otomatis dikompres sebelum upload</p>
      </div>

      {picks.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {picks.map((p, i) => (
            <motion.div key={p.preview} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[16px] bg-black/[0.05]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="pratinjau" className="h-24 w-full object-cover" />
              <button
                onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-black/80 px-2 py-0.5 text-[11px] font-bold text-white"
                aria-label="Hapus foto"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2 rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-card">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption — misal: senja di stasiun"
          className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm outline-none focus:border-charcoal"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lokasi"
            className="rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm outline-none focus:border-charcoal"
          />
          <input
            value={takenAt}
            onChange={(e) => setTakenAt(e.target.value)}
            type="date"
            className="rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm outline-none focus:border-charcoal"
          />
        </div>
        <div className="flex gap-2">
          {ALBUMS.filter((a) => a !== "Semua").map((a) => (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`flex-1 rounded-full py-2 text-xs font-bold ${album === a ? "bg-charcoal text-white" : "bg-black/[0.05] text-charcoal"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {progress !== null && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
          <motion.div className="h-full bg-charcoal" animate={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-2 text-[13px] font-semibold text-red-700">{error}</p>}
      {done && <p className="mt-2 text-[13px] font-semibold text-green-800">{done}</p>}

      <button
        onClick={submit}
        disabled={picks.length === 0}
        className="mt-4 w-full rounded-full bg-charcoal py-3.5 text-sm font-bold text-white disabled:opacity-40 active:scale-[0.98]"
      >
        Upload {picks.length > 0 ? `${picks.length} foto` : ""}
      </button>
    </main>
  );
}
