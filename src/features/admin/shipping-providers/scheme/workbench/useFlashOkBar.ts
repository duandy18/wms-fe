// src/features/admin/shipping-providers/scheme/workbench/useFlashOkBar.ts

import { useCallback, useRef, useState } from "react";

/**
 * 统一“成功回音”条（绿条）
 * - flashOk(msg): 显示并自动消失
 * - clearOk(): 立即关闭
 */
export function useFlashOkBar(args?: { autoHideMs?: number }) {
  const autoHideMs = args?.autoHideMs ?? 2500;

  const [okMsg, setOkMsg] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearOk = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOkMsg(null);
  }, []);

  const flashOk = useCallback(
    (msg: string) => {
      const m = (msg ?? "").trim();
      if (!m) return;

      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setOkMsg(m);

      timerRef.current = window.setTimeout(() => {
        setOkMsg((prev) => (prev === m ? null : prev));
        timerRef.current = null;
      }, autoHideMs);
    },
    [autoHideMs],
  );

  return { okMsg, flashOk, clearOk };
}
