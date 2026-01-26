// src/features/admin/shipping-providers/pages/edit/schemes/flashOk.ts
import { useEffect, useRef } from "react";

export function useFlashOk(setLocalOk: (v: string | null) => void) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  function flashOk(msg: string, ms = 2000) {
    setLocalOk(msg);
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = window.setTimeout(() => {
      setLocalOk(null);
      timerRef.current = null;
    }, ms);
  }

  return { flashOk };
}
