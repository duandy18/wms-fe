// src/features/operations/ship/HidScalePanel.tsx
//
// 电子称状态面板（Ship Cockpit 配套）
// - 使用 useHidScale Hook
// - 显示当前读数 / 锁定读数 / 设备信息
// - 把锁定值通过 onWeightLocked 回传给上层（例如 Ship Cockpit）

import React, { useEffect } from "react";
import { useHidScale } from "./useHidScale";

type Props = {
  // 当锁定重量成功时回调（单位：kg）
  onWeightLocked?: (weightKg: number) => void;
};

export const HidScalePanel: React.FC<Props> = ({ onWeightLocked }) => {
  const { state, connect, disconnect, lockWeight, clearLock } = useHidScale();

  const {
    supported,
    status,
    error,
    liveWeightKg,
    lockedWeightKg,
    rawText,
    deviceInfo,
  } = state;

  // 当 lockedWeightKg 变化时回调上层
  useEffect(() => {
    if (lockedWeightKg != null && onWeightLocked) {
      onWeightLocked(lockedWeightKg);
    }
  }, [lockedWeightKg, onWeightLocked]);

  const handleConnect = () => {
    void connect();
  };

  const handleDisconnect = () => {
    void disconnect();
  };

  const handleLock = () => {
    lockWeight();
  };

  const handleClearLock = () => {
    clearLock();
  };

  const statusLabel = (() => {
    if (!supported) return "不支持 WebHID";
    switch (status) {
      case "idle":
        return "未连接";
      case "connecting":
        return "连接中…";
      case "connected":
        return "已连接";
      case "error":
        return "错误";
      default:
        return status;
    }
  })();

  const statusBadgeClass = (() => {
    if (!supported) return "bg-slate-100 text-slate-500 border-slate-200";
    switch (status) {
      case "connected":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "connecting":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "error":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  })();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-slate-800">
            电子称（WebHID）
          </h2>
          <p className="text-[11px] text-slate-500">
            连接 USB 电子称，自动读取毛重（kg），并支持锁定后回填到发货表单。
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={
              "inline-flex items-center rounded-full border px-3 py-[3px] text-[11px] font-medium " +
              statusBadgeClass
            }
          >
            {statusLabel}
          </span>
          {deviceInfo && (
            <span className="text-[10px] text-slate-500">
              {deviceInfo.productName ?? "未知设备"} · VID:
              {deviceInfo.vendorId} PID:{deviceInfo.productId}
            </span>
          )}
        </div>
      </div>

      {!supported && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          当前浏览器不支持 WebHID。建议使用最新版 Chrome / Edge，并在地址栏输入{" "}
          <span className="font-mono">chrome://flags</span> 检查 HID 相关支持。
        </div>
      )}

      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3 text-xs text-slate-700">
        {/* 当前读数 */}
        <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <span className="text-[11px] text-slate-500">当前读数（实时）</span>
          <span className="font-mono text-2xl font-semibold text-slate-900">
            {liveWeightKg != null ? liveWeightKg.toFixed(3) : "--.-"}
            <span className="ml-1 text-xs text-slate-500">kg</span>
          </span>
          <span className="text-[10px] text-slate-400">
            称上放入包裹后，等待数值稳定，再点击“锁定重量”。
          </span>
        </div>

        {/* 锁定读数 */}
        <div className="flex flex-col gap-1 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
          <span className="text-[11px] text-emerald-700">已锁定重量</span>
          <span className="font-mono text-2xl font-semibold text-emerald-900">
            {lockedWeightKg != null ? lockedWeightKg.toFixed(3) : "--.-"}
            <span className="ml-1 text-xs text-emerald-600">kg</span>
          </span>
          <span className="text-[10px] text-emerald-700">
            锁定后会将此值写入发货表单的毛重字段（gross_weight_kg）。
          </span>
        </div>

        {/* 控制按钮 */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <span className="text-[11px] text-slate-500">操作</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConnect}
              disabled={!supported || status === "connecting"}
              className={
                "inline-flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium text-white " +
                (!supported
                  ? "bg-slate-400 cursor-not-allowed"
                  : status === "connecting"
                  ? "bg-sky-400 opacity-70"
                  : "bg-sky-600 hover:bg-sky-700")
              }
            >
              {status === "connecting" ? "连接中…" : "连接电子称"}
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={status !== "connected" && status !== "error"}
              className={
                "inline-flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium " +
                (status === "connected" || status === "error"
                  ? "border border-slate-300 text-slate-700 hover:bg-slate-100"
                  : "border border-slate-200 text-slate-300 cursor-not-allowed")
              }
            >
              断开
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLock}
              disabled={status !== "connected"}
              className={
                "inline-flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium " +
                (status === "connected"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-emerald-300 text-white cursor-not-allowed")
              }
            >
              锁定重量
            </button>
            <button
              type="button"
              onClick={handleClearLock}
              disabled={lockedWeightKg == null}
              className={
                "inline-flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium " +
                (lockedWeightKg != null
                  ? "border border-slate-300 text-slate-700 hover:bg-slate-100"
                  : "border border-slate-200 text-slate-300 cursor-not-allowed")
              }
            >
              清除锁定
            </button>
          </div>
        </div>
      </div>

      {/* 原始报文（调试用，可选展示） */}
      {rawText && (
        <div className="mt-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
          <div className="mb-1 font-semibold text-slate-600">
            最近一帧原始报文（调试用）
          </div>
          <pre className="max-h-24 overflow-auto font-mono">
            {rawText}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
          {error}
        </div>
      )}
    </section>
  );
};

export default HidScalePanel;
