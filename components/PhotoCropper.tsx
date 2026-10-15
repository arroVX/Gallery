"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

// Potong + putar di canvas (snippet resmi react-easy-crop).
async function getCroppedBlob(
  src: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung browser ini.");
  const rotRad = (rotation * Math.PI) / 180;
  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
  canvas.width = safeArea;
  canvas.height = safeArea;
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(rotRad);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );
  const data = ctx.getImageData(0, 0, safeArea, safeArea);
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
  );
  if (!blob) throw new Error("Gagal memotong gambar.");
  return blob;
}

const ASPECTS = [
  { label: "ASLI", value: 0 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 },
];

export default function PhotoCropper({
  src,
  fileName,
  onCancel,
  onSave,
}: {
  src: string;
  fileName: string;
  onCancel: () => void;
  onSave: (file: File) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectChoice, setAspectChoice] = useState(0);
  const [naturalAspect, setNaturalAspect] = useState(4 / 5);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aspect = aspectChoice === 0 ? naturalAspect : aspectChoice;

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setPixels(areaPixels);
  }, []);

  const save = async () => {
    if (!pixels) return;
    setSaving(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(src, pixels, rotation);
      const base = fileName.replace(/\.[^.]+$/, "") || "foto";
      onSave(new File([blob], `${base}-crop.jpg`, { type: "image/jpeg" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
      <div className="w-full max-w-lg border-[3px] border-black bg-[#FFFDF7] shadow-hard">
        <p className="border-b-[3px] border-black bg-raspberry py-2 text-center text-[11px] font-extrabold tracking-[0.25em] text-white">
          ✂ POTONG FOTO
        </p>

        <div className="relative h-[52dvh] bg-black sm:h-[46dvh]">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onMediaLoaded={(media) => {
              if (media.naturalWidth && media.naturalHeight) {
                setNaturalAspect(media.naturalWidth / media.naturalHeight);
              }
            }}
            showGrid
          />
        </div>

        <div className="space-y-2 border-t-[3px] border-black p-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                onClick={() => setAspectChoice(a.value)}
                className={`shrink-0 border-2 border-black px-3 py-1.5 text-[11px] font-extrabold ${
                  aspectChoice === a.value ? "bg-raspberry text-white" : "bg-white"
                }`}
              >
                {a.label}
              </button>
            ))}
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="shrink-0 border-2 border-black bg-white px-3 py-1.5 text-[13px] font-extrabold"
              aria-label="Putar 90 derajat"
            >
              ⟳ {rotation}°
            </button>
          </div>

          <label className="flex items-center gap-2 text-[11px] font-extrabold tracking-widest">
            ZOOM
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#A6193C]"
            />
          </label>

          {error && (
            <p className="border-2 border-red-600 bg-red-50 p-2 text-[12px] font-bold text-red-800">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 border-2 border-black bg-white py-2.5 text-[12px] font-extrabold tracking-widest"
            >
              BATAL
            </button>
            <button
              onClick={save}
              disabled={saving || !pixels}
              className="sticker flex-1 border-[3px] border-black bg-raspberry py-2.5 text-[12px] font-extrabold tracking-widest text-white disabled:opacity-40"
            >
              {saving ? "MEMOTONG…" : "SIMPAN POTONGAN"}
            </button>
          </div>
          <p className="text-center font-hand text-[15px] font-semibold opacity-70">
            geser untuk posisi • cubit/scroll untuk zoom
          </p>
        </div>
      </div>
    </div>
  );
}
