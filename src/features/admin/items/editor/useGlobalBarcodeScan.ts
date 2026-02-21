// src/features/admin/items/editor/useGlobalBarcodeScan.ts
import { useEffect, useRef } from "react";

type UseGlobalBarcodeScanArgs = {
  enabled: boolean;
  onScan: (code: string) => void;
};

/**
 * 全局扫码捕获（强制模式）：
 * - 不论焦点在哪，都尽量捕获扫码枪输出
 * - 通过“字符间隔很短 + Enter/Tab 结束”识别扫码流，降低误伤手动输入
 * - 一旦识别为扫码：preventDefault + stopPropagation，避免条码落入当前输入框
 */
export default function useGlobalBarcodeScan(args: UseGlobalBarcodeScanArgs) {
  const { enabled, onScan } = args;

  const bufRef = useRef<string>("");
  const lastTsRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const MAX_GAP_MS = 50; // 扫码枪字符间隔通常远小于人手输入
    const MIN_LEN = 3; // 过滤误触（过短不视为扫码）

    function resetIfGap(now: number) {
      const gap = now - lastTsRef.current;
      lastTsRef.current = now;
      if (gap > MAX_GAP_MS) {
        bufRef.current = "";
      }
    }

    function finalizeIfAny(e: KeyboardEvent) {
      const code = bufRef.current.trim();
      bufRef.current = "";
      if (code.length < MIN_LEN) return;

      // ✅ 识别为扫码：吞掉事件，避免落到当前输入框
      e.preventDefault();
      e.stopPropagation();

      onScan(code);
    }

    function handler(e: KeyboardEvent) {
      if (e.isComposing) return; // 避免输入法 composition 干扰
      if (e.ctrlKey || e.metaKey || e.altKey) return; // 不抢系统快捷键

      const now = Date.now();
      resetIfGap(now);

      // 结束符：Enter / Tab
      if (e.key === "Enter" || e.key === "Tab") {
        finalizeIfAny(e);
        return;
      }

      // 普通字符：只收单字符键（扫码枪就是一串字符）
      if (e.key.length === 1) {
        bufRef.current += e.key;
        return;
      }

      // 其它键：不处理
    }

    // capture=true：尽量早拿到事件（否则可能被输入框/组件先吃掉）
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [enabled, onScan]);
}
