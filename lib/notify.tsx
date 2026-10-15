"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

export type NoticeType = "success" | "error" | "info";

type Notice = { id: number; message: string; kind: NoticeType };

type NotifyFn = (message: string, kind?: NoticeType) => void;

const NotifyContext = createContext<NotifyFn>(() => {});

export const useNotify = () => useContext(NotifyContext);

const ICON: Record<NoticeType, string> = {
  success: "✓",
  error: "✕",
  info: "★",
};

const BAR: Record<NoticeType, string> = {
  success: "bg-raspberry",
  error: "bg-red-700",
  info: "bg-dustydeep",
};

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notice[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback<NotifyFn>(
    (message, kind = "info") => {
      const id = ++idRef.current;
      setItems((prev) => [...prev.slice(-2), { id, message, kind }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-10"
      >
        <AnimatePresence>
          {items.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto relative w-full max-w-sm border-[2.5px] border-black bg-[#FFFDF7] shadow-hardSm"
            >
              <span aria-hidden className="tape absolute -top-2.5 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-2" />
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-white ${BAR[n.kind]}`}
                >
                  {ICON[n.kind]}
                </span>
                <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug">{n.message}</p>
                <button
                  onClick={() => dismiss(n.id)}
                  className="shrink-0 border border-black/30 px-1.5 text-[11px] font-bold"
                  aria-label="Tutup notifikasi"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotifyContext.Provider>
  );
}
