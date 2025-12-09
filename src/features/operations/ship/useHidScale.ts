// src/features/operations/ship/useHidScale.ts
//
// WebHID 电子称 Hook（通用骨架版）
// - 检测浏览器 WebHID 支持
// - 连接 HID 设备
// - 监听 inputreport，尝试从字节流解析重量（kg）
// - 简单防抖 + 稳定检测 + 锁重

import { useCallback, useEffect, useRef, useState } from "react";

export type HidScaleStatus = "idle" | "connecting" | "connected" | "error";

export interface HidScaleState {
  status: HidScaleStatus;
  supported: boolean; // 浏览器是否支持 navigator.hid
  error: string | null;

  // 实时读数（kg，未锁定时会跳动）
  liveWeightKg: number | null;
  // 锁定后的重量（用于回填到表单）
  lockedWeightKg: number | null;

  rawText: string | null; // 最近一次原始字符串（调试用）
  deviceInfo: {
    productName?: string;
    vendorId?: number;
    productId?: number;
  } | null;
}

export interface HidScaleApi {
  state: HidScaleState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  lockWeight: () => void;
  clearLock: () => void;
}

// ---- 本地 WebHID 类型定义（避免引用全局未声明类型） ----

interface HidDeviceInfo {
  productName?: string;
  vendorId?: number;
  productId?: number;
}

interface HidDevice extends HidDeviceInfo {
  opened: boolean;
  open(): Promise<void>;
  close(): Promise<void>;
  addEventListener(
    type: "inputreport",
    listener: (event: Event) => void,
  ): void;
  removeEventListener(
    type: "inputreport",
    listener: (event: Event) => void,
  ): void;
}

interface HidDeviceFilter {
  vendorId?: number;
  productId?: number;
}

interface HidApi {
  requestDevice(options: { filters: HidDeviceFilter[] }): Promise<HidDevice[]>;
}

interface HidNavigator extends Navigator {
  hid: HidApi;
}

interface HidInputReportEvent extends Event {
  data?: DataView;
}

/**
 * 尝试将 HID 报文中的 DataView 解析为文本。
 * 很多电子称其实输出 ASCII 字符串，例如： "ST,GS,+  2.350kg"
 */
function dataViewToAscii(view: DataView): string {
  let s = "";
  for (let i = 0; i < view.byteLength; i++) {
    const code = view.getUint8(i);
    if (code === 0) continue;
    s += String.fromCharCode(code);
  }
  return s.trim();
}

/**
 * 从字符串中提取一个可能的重量（kg），例如：
 * "ST,GS,+  2.350kg" → 2.35
 * "W=1.200" → 1.2
 */
function parseWeightFromText(text: string): number | null {
  if (!text) return null;

  const match = text.match(/([+-]?\d+(?:\.\d+)?)/);
  if (!match) return null;

  const n = Number(match[1]);
  if (!Number.isFinite(n)) return null;

  const lower = text.toLowerCase();
  if (lower.includes("kg")) {
    return n;
  }
  if (lower.includes(" g") || lower.endsWith("g")) {
    return n / 1000;
  }

  return n;
}

/**
 * 简单的稳定检测：
 * - 最近 N 次读数差异很小，就认为是“稳定”
 */
class StableDetector {
  private windowSize: number;
  private epsilon: number;
  private values: number[];

  constructor(windowSize = 4, epsilon = 0.005) {
    this.windowSize = windowSize;
    this.epsilon = epsilon;
    this.values = [];
  }

  push(value: number): boolean {
    this.values.push(value);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
    if (this.values.length < this.windowSize) return false;

    const min = Math.min(...this.values);
    const max = Math.max(...this.values);
    return max - min <= this.epsilon;
  }
}

export function useHidScale(): HidScaleApi {
  const [state, setState] = useState<HidScaleState>({
    status: "idle",
    supported: typeof navigator !== "undefined" && "hid" in navigator,
    error: null,
    liveWeightKg: null,
    lockedWeightKg: null,
    rawText: null,
    deviceInfo: null,
  });

  const deviceRef = useRef<HidDevice | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const stableDetectorRef = useRef<StableDetector | null>(null);
  const stableWeightRef = useRef<number | null>(null);

  // 连接电子称（弹出系统设备选择框）
  const connect = useCallback(async () => {
    if (typeof navigator === "undefined" || !("hid" in navigator)) {
      setState((prev) => ({
        ...prev,
        supported: false,
        status: "error",
        error: "当前浏览器不支持 WebHID（建议使用最新版 Chrome/Edge）。",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "connecting",
      error: null,
    }));

    try {
      const nav = navigator as HidNavigator;

      const devices = await nav.hid.requestDevice({
        filters: [],
      });

      if (!devices || devices.length === 0) {
        setState((prev) => ({
          ...prev,
          status: "idle",
          error: "未选择任何 HID 设备。",
        }));
        return;
      }

      const device = devices[0];
      await device.open();

      deviceRef.current = device;
      stableDetectorRef.current = new StableDetector();
      stableWeightRef.current = null;

      const info = {
        productName: device.productName,
        vendorId: device.vendorId,
        productId: device.productId,
      };

      const onInputReport = (event: Event) => {
        const hidEvent = event as HidInputReportEvent;
        const data = hidEvent.data;
        if (!data) return;

        const text = dataViewToAscii(data);
        const weight = parseWeightFromText(text);

        setState((prev) => ({
          ...prev,
          rawText: text || prev.rawText,
        }));

        if (weight == null || !Number.isFinite(weight)) {
          return;
        }

        const detector = stableDetectorRef.current;
        const isStable = detector?.push(weight) ?? false;
        if (isStable) {
          stableWeightRef.current = weight;
        }

        setState((prev) => ({
          ...prev,
          liveWeightKg: weight,
          lockedWeightKg: prev.lockedWeightKg ?? null,
          status: "connected",
        }));
      };

      device.addEventListener("inputreport", onInputReport);

      const cleanup = () => {
        device.removeEventListener("inputreport", onInputReport);
      };

      cleanupRef.current = cleanup;

      setState((prev) => ({
        ...prev,
        status: "connected",
        deviceInfo: info,
        error: null,
      }));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "连接电子称失败。";
       
      console.error("[HID scale] connect error:", e);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: message,
      }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    const dev = deviceRef.current;
    const cleanup = cleanupRef.current;
    if (!dev) return;

    try {
      if (cleanup) cleanup();
      if (dev.opened) {
        await dev.close();
      }
    } catch (e) {
       
      console.warn("[HID scale] disconnect error:", e);
    } finally {
      deviceRef.current = null;
      cleanupRef.current = null;
      stableDetectorRef.current = null;
      stableWeightRef.current = null;
      setState((prev) => ({
        ...prev,
        status: "idle",
        deviceInfo: null,
        liveWeightKg: null,
      }));
    }
  }, []);

  const lockWeight = useCallback(() => {
    const stable = stableWeightRef.current;
    const toLock =
      stable != null && Number.isFinite(stable)
        ? stable
        : state.liveWeightKg ?? null;

    if (toLock == null) {
      setState((prev) => ({
        ...prev,
        error: "当前还没有可锁定的重量读数。",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      lockedWeightKg: toLock,
      error: null,
    }));
  }, [state.liveWeightKg]);

  const clearLock = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lockedWeightKg: null,
    }));
  }, []);

  // 组件卸载时自动断开
  useEffect(() => {
    return () => {
      void disconnect();
    };
  }, [disconnect]);

  return {
    state,
    connect,
    disconnect,
    lockWeight,
    clearLock,
  };
}
