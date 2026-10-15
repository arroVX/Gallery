"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
import { ALBUMS } from "@/lib/gallery";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";

type Pick = { file: File; preview: string };

// File biner diupload ke Cloudinary (unsigned preset, tanpa kartu),
// metadata-nya disimpan di Firestore. Firebase Storage tidak dipakai lagi.
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "xivl9amq";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "gallery_unsigned";

type CloudinaryResult = {
  secureUrl: string;
  width: number;
  height: number;
  publicId: string;
};

// Upload via XMLHttpRequest agar progress bar tetap hidup (fetch tidak ada progress upload).
const uploadToCloudinary = (
  blob: Blob,
  filename: string,
  folder: string,
  onProgress: (fraction: number) => void
): Promise<CloudinaryResult> =>
  new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", blob, filename);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    form.append("folder", folder);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300) {
          const msg = json?.error?.message ?? `HTTP ${xhr.status}`;
          reject(new Error(`Cloudinary: ${msg}`));
          return;
        }
        if (!json.secure_url) {
          reject(new Error("Cloudinary tidak mengembalikan secure_url."));
          return;
        }
        resolve({
          secureUrl: String(json.secure_url),
          width: Number(json.width ?? 0),
          height: Number(json.height ?? 0),
          publicId: String(json.public_id ?? ""),
        });
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };
    xhr.onerror = () => reject(new Error("Cloudinary: jaringan gagal."));
    xhr.onabort = () => reject(new Error("Cloudinary: upload dibatalkan."));
    xhr.send(form);
  });

// Ubah kode error menjadi pesan yang bisa ditindaklanjuti user.
const friendlyError = (err: unknown): string => {
  const code = (err as { code?: string })?.code ?? "";
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.startsWith("Cloudinary:")) {
    if (raw.includes("unknown preset") || raw.includes("Invalid upload preset"))
      return `Cloudinary menolak preset (${CLOUDINARY_UPLOAD_PRESET}). Cek Settings > Upload > Upload presets — harus Unsigned. Detail: ${raw}`;
    return `Upload gambar gagal. ${raw}`;
  }
  if (code === "permission-denied")
    return `Firestore menolak tulis (permission-denied). Pastikan sudah login DAN rules Firestore sudah di-Publish. Detail: ${raw}`;
  if (code === "unauthenticated")
    return `Belum login (unauthenticated). Masuk dulu dengan akun yang terdaftar di Authentication. Detail: ${raw}`;
  if (code === "auth/operation-not-allowed")
    return "Login gagal (auth/operation-not-allowed). Aktifkan Email/Password di Console > Authentication > Sign-in method.";
  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential")
    return "Login gagal. Email tidak terdaftar atau kata sandi salah.";
  if (code === "auth/too-many-requests")
    return "Terlalu banyak percobaan login. Tunggu sebentar lalu coba lagi.";
  if (code === "failed-precondition")
    return `Firestore butuh index (failed-precondition). Klik link index di console browser. Detail: ${raw}`;
  if (code === "unavailable")
    return "Firestore tidak dapat dijangkau (unavailable). Pastikan database sudah dibuat dan koneksi stabil.";
  return `Upload gagal: ${raw}`;
};

const sanitizeName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "foto.jpg";

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
      console.error("[Auth] login error:", e);
      setError(friendlyError(e));
    }
  };

  const submit = async () => {
    setError(null);
    setDone(null);
    if (picks.length === 0) return setError("Pilih minimal 1 foto dulu.");
    // Diagnostik: tunjukkan kondisi mana yang gagal
    if (!isFirebaseConfigured) return setError("❌ Firebase belum terkonfigurasi — cek env NEXT_PUBLIC_FIREBASE_*");
    if (!db) return setError("❌ Firestore (db) null — Firebase gagal inisialisasi");
    if (!auth?.currentUser) return setError("❌ Belum login — silakan masuk dulu");
    try {
      let doneCount = 0;
      for (const { file } of picks) {
        // Kompresi ringan saja — Cloudinary free 25 GB, kualitas HD dipertahankan.
        const compressed = await imageCompression(file, {
          maxSizeMB: 4,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
        });
        const safeName = sanitizeName(file.name);
        const folder = `gallery/${takenAt.slice(0, 7)}`;
        const up = await uploadToCloudinary(
          compressed,
          safeName,
          folder,
          (frac) =>
            setProgress(
              Math.round(((doneCount + frac) / picks.length) * 100)
            )
        );
        // Dimensi dari respon Cloudinary; fallback ke bitmap lokal.
        let width = up.width || 800;
        let height = up.height || 1000;
        if (!up.width || !up.height) {
          try {
            const bmp = await createImageBitmap(compressed);
            width = bmp.width;
            height = bmp.height;
            bmp.close();
          } catch {
            // abaikan, pakai default
          }
        }
        // Catatan: kalau addDoc gagal setelah file terupload, file yatim
        // tetap ada di Cloudinary (delete butuh signed API) — hapus manual
        // di Media Library bila perlu. public_id disimpan untuk itu.
        await addDoc(collection(db, "photos"), {
          imageUrl: up.secureUrl,
          cloudinaryPublicId: up.publicId,
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
    } catch (err: unknown) {
      setProgress(null);
      console.error("[Upload] gagal:", err);
      setError(friendlyError(err));
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
