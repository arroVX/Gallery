"use client";

import { useEffect, useState } from "react";

export default function DisclaimerModal() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hanya tampilkan sekali per perangkat (simpan di localStorage).
    const seen = localStorage.getItem("gallery:disclaimer-seen");
    if (seen === "1") setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/[60] backdrop-blur-sm p-4">
      <div className="max-w-md w-full border-[4px] border-black bg-ivory shadow-hard relative">
        {/* Stempel sudut */}
        <span className="absolute -top-2 -left-2 z-10 h-6 w-16 border-2 border-black bg-white -translate-x-1/2 -rotate-3" style={{ top: "-10px", left: "20%" }} />
        <span className="absolute -top-2 -right-2 z-10 h-6 w-16 border-2 border-black bg-white translate-x-1/2 rotate-3" style={{ top: "-10px", right: "20%" }} />

        <div className="p-8 text-center">
          <p className="border-b-[3px] border-black py-2 mb-6 text-center text-[10px] font-extrabold tracking-[0.3em]">
            ★ PERINGATAN ★
          </p>
          <h1 className="font-display leading-none text-[clamp(1.75rem,8vw,2.25rem)] mb-4 text-black">
            Hubungan ini sudah selesai.
          </h1>
          <p className="font-serif leading-relaxed mb-8 text-charcoal/80">
            Membuka gallery ini hanya akan mengingatkanmu pada kenangan lama.
            Jika kamu masih tengah menyembuhkan luka, pikirkan baik-baik
            sebelum melanjutkan.
          </p>
          <button
            onClick={() => {
              localStorage.setItem("gallery:disclaimer-seen", "1");
              setShow(false);
            }}
            className="sticker border-[3px] border-black bg-raspberry px-6 py-2.5 text-sm font-extrabold tracking-[0.2em] text-white"
          >
            MENGERTI, LANJUTKAN
          </button>
        </div>
      </div>
    </div>
  );
}
