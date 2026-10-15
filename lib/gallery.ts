export type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
  caption: string;
  location: string;
  takenAt: string; // ISO date
  album: string;
  favorite?: boolean;
  storagePath?: string;
  cloudinaryPublicId?: string;
  /** Rotasi permanen pilihan user: 0 / 90 / 180 / 270 derajat. */
  rotate?: number;
};

export const ALBUMS = ["Semua", "Kencan", "Trip", "Harian"] as const;

const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const PHOTOS: Photo[] = [
  { id: "p1", src: img("couple-1", 600, 800), width: 600, height: 800, caption: "Sore pertama di tepi pantai", location: "Pantai Selatan", takenAt: "2024-02-14", album: "Kencan", favorite: true },
  { id: "p2", src: img("couple-2", 600, 450), width: 600, height: 450, caption: "Kopi susu dan tawa kecil", location: "Kafe Langit", takenAt: "2024-03-02", album: "Harian" },
  { id: "p3", src: img("couple-3", 600, 750), width: 600, height: 750, caption: "Hujan, payung satu berdua", location: "Kota Tua", takenAt: "2024-04-20", album: "Kencan", favorite: true },
  { id: "p4", src: img("couple-4", 600, 600), width: 600, height: 600, caption: "Bekal perjalanan jauh", location: "Stasiun Senja", takenAt: "2024-05-11", album: "Trip" },
  { id: "p5", src: img("couple-5", 600, 900), width: 600, height: 900, caption: "Puncak dan kabut tipis", location: "Dieng", takenAt: "2024-06-08", album: "Trip", favorite: true },
  { id: "p6", src: img("couple-6", 600, 500), width: 600, height: 500, caption: "Masak mie tengah malam", location: "Kos Kita", takenAt: "2024-07-01", album: "Harian" },
  { id: "p7", src: img("couple-7", 600, 780), width: 600, height: 780, caption: "Nonton gigs sampai serak", location: "Gigs Hall", takenAt: "2024-08-17", album: "Kencan" },
  { id: "p8", src: img("couple-8", 600, 620), width: 600, height: 620, caption: "Pasar pagi dan bunga", location: "Pasar Kembang", takenAt: "2024-09-05", album: "Harian" },
  { id: "p9", src: img("couple-9", 600, 850), width: 600, height: 850, caption: "Sunset yang tidak terlupakan", location: "Uluwatu", takenAt: "2024-10-12", album: "Trip", favorite: true },
  { id: "p10", src: img("couple-10", 600, 480), width: 600, height: 480, caption: "Piknik sederhana", location: "Taman Kota", takenAt: "2024-11-23", album: "Harian" },
  { id: "p11", src: img("couple-11", 600, 720), width: 600, height: 720, caption: "Anniversary pertama", location: "Rooftop Bintang", takenAt: "2025-02-14", album: "Kencan", favorite: true },
  { id: "p12", src: img("couple-12", 600, 640), width: 600, height: 640, caption: "Perjalanan pulang", location: "Kereta Malam", takenAt: "2025-03-30", album: "Trip" },
];

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  coverId: string;
  photoIds: string[];
};

export const TIMELINE: TimelineEvent[] = [
  { id: "t1", date: "2024-02-14", title: "Pertemuan pertama", description: "Sore yang canggung tapi manis. Foto pertama kita yang blur tapi disayang.", coverId: "p1", photoIds: ["p1", "p2"] },
  { id: "t2", date: "2024-04-20", title: "Hujan pertama berdua", description: "Satu payung, dua kepala, sepatu basah semua. Pulangnya malah ketawa terus.", coverId: "p3", photoIds: ["p3"] },
  { id: "t3", date: "2024-06-08", title: "Trip ke Dieng", description: "Berangkat jam 2 pagi, sampai disambut kabut. Kopi panas tidak pernah seenak itu.", coverId: "p5", photoIds: ["p4", "p5"] },
  { id: "t4", date: "2024-10-12", title: "Sunset di Uluwatu", description: "Duduk diam hampir satu jam. Tidak banyak bicara, tapi rasanya penuh.", coverId: "p9", photoIds: ["p9", "p10"] },
  { id: "t5", date: "2025-02-14", title: "Satu tahun", description: "Makan malam sederhana di rooftop. Setahun berlalu, masih deg-degan.", coverId: "p11", photoIds: ["p11", "p12"] },
];

export const photoById = (id: string): Photo =>
  PHOTOS.find((p) => p.id === id) ?? PHOTOS[0];

// Sudut putar user menjadi transformasi Cloudinary (digabung dgn a_auto).
const angleOf = (rotate?: number): string => {
  const r = ((Math.round(rotate ?? 0) % 360) + 360) % 360;
  if (r === 90) return ",a_90";
  if (r === 180) return ",a_180";
  if (r === 270) return ",a_270";
  return "";
};

// Thumbnail ringan untuk URL Cloudinary: sisipkan transformasi
// `w_{width},q_auto,f_auto,a_auto[,a_90/180/270]` tepat setelah `/image/upload/`.
// `a_auto` memutar piksel sesuai EXIF agar foto HP tidak miring,
// sudut user diterapkan setelahnya.
// Bukan URL Cloudinary (atau sudah ada transformasi) -> kembalikan asli.
// Dipakai di grid/kartu; popup detail pakai `full`.
export const thumb = (src: string, width = 400, rotate = 0): string => {
  const marker = "/image/upload/";
  const i = src.indexOf(marker);
  if (!src.startsWith("https://res.cloudinary.com/") || i < 0) return src;
  const rest = src.slice(i + marker.length);
  if (/^[a-z]+_[^/]*\//.test(rest)) return src;
  return `${src.slice(0, i + marker.length)}w_${width},q_auto,f_auto,a_auto${angleOf(rotate)}/${rest}`;
};

// Versi penuh untuk popup detail: kualitas/format otomatis +
// auto-rotasi EXIF (`a_auto`) + sudut user agar foto miring permanen tegak.
// Tanpa resize agar ketajaman HD tetap. Bukan URL Cloudinary -> asli.
export const full = (src: string, rotate = 0): string => {
  const marker = "/image/upload/";
  const i = src.indexOf(marker);
  if (!src.startsWith("https://res.cloudinary.com/") || i < 0) return src;
  const rest = src.slice(i + marker.length);
  if (/^[a-z]+_[^/]*\//.test(rest)) return src;
  return `${src.slice(0, i + marker.length)}q_auto,f_auto,a_auto${angleOf(rotate)}/${rest}`;
};

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
