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
    // Diagnostik: tunjukkan kondisi mana yang gagal
    if (!isFirebaseConfigured) return setError("❌ Firebase belum terkonfigurasi — cek env NEXT_PUBLIC_FIREBASE_*");
    if (!db) return setError("❌ Firestore (db) null — Firebase gagal inisialisasi");
    if (!storage) return setError("❌ Storage null — cek FIREBASE_STORAGE_BUCKET atau error di console");
    if (!auth?.currentUser) return setError("❌ Belum login — silakan masuk dulu");
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
    <main className="mx-auto max-w-2xl px-3 py-4 sm:px-5">
      <div className="border-[3px] border-black bg-white shadow-hardSm">
        <p className="border-b-[3px] border-black py-1.5 text-center text-[10px] font-extrabold tracking-[0.3em]">
          ★ ADD MEMORY ★
        </p>
        <h1 className="py-4 text-center font-display text-[42px] leading-none sm:text-[56px]">
          UPLOAD!
        </h1>
        <p className="border-t-[3px] border-black py-2 text-center font-serif text-[12px] italic">
          Tambah kenangan baru — otomatis dikompres sebelum tersimpan.
        </p>
      </div>

      {!isFirebaseConfigured && (
        <div className="mt-4 border-2 border-amber-500 bg-amber-50 p-3 text-[13px] leading-relaxed">
          Firebase belum dikonfigurasi. Isi env <code>NEXT_PUBLIC_FIREBASE_*</code> lalu
          upload asli aktif. Untuk sekarang hanya mode pratinjau.
        </div>
      )}

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
          <button onClick={login} className="mt-2 w-full border-2 border-black bg-black py-2.5 text-sm font-extrabold tracking-widest text-white">
            MASUK
          </button>
        </div>
      )}

      {isFirebaseConfigured && user && (
        <div className="mt-4 flex items-center justify-between border-[3px] border-black bg-white px-4 py-2.5">
          <p className="text-xs font-bold">{user.email}</p>
          <button onClick={() => auth && signOut(auth)} className="border-2 border-black px-3 py-1 text-xs font-extrabold">
            KELUAR
          </button>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`mt-4 border-[3px] border-dashed border-black p-8 text-center transition ${
          isDragActive ? "bg-black text-white" : "bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <p className="font-display text-[20px] tracking-wide">{isDragActive ? "LEPASKAN DI SINI" : "KETUK / SERET FOTO KE SINI"}</p>
        <p className="mt-1 font-serif text-xs italic">Maks 10 foto, otomatis dikompres sebelum upload</p>
      </div>

      {picks.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {picks.map((p, i) => (
            <motion.div key={p.preview} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative border-2 border-black bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="pratinjau" className="h-24 w-full border border-black object-cover" />
              <button
                onClick={() => remove(i)}
                className="absolute right-1 top-1 border border-black bg-black px-2 py-0.5 text-[11px] font-bold text-white"
                aria-label="Hapus foto"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2 border-[3px] border-black bg-white p-4">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption — misal: senja di stasiun"
          className="w-full border-2 border-black bg-white px-3 py-2.5 text-sm outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lokasi"
            className="border-2 border-black bg-white px-3 py-2.5 text-sm outline-none"
          />
          <input
            value={takenAt}
            onChange={(e) => setTakenAt(e.target.value)}
            type="date"
            className="border-2 border-black bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          {ALBUMS.filter((a) => a !== "Semua").map((a) => (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`flex-1 border-2 border-black py-2 text-xs font-extrabold ${album === a ? "bg-black text-white" : "bg-white"}`}
            >
              {a.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {progress !== null && (
        <div className="mt-4 h-3 border-2 border-black bg-white">
          <motion.div className="h-full bg-black" animate={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-2 border-2 border-black bg-white p-2 text-[13px] font-bold">{error}</p>}
      {done && <p className="mt-2 border-2 border-black bg-black p-2 text-[13px] font-bold text-white">{done}</p>}

      <button
        onClick={submit}
        disabled={picks.length === 0}
        className="mt-4 w-full border-[3px] border-black bg-black py-3.5 text-sm font-extrabold tracking-[0.2em] text-white shadow-hardSm disabled:opacity-40"
      >
        UPLOAD {picks.length > 0 ? `${picks.length} FOTO` : ""}
      </button>
    </main>
  );
}
