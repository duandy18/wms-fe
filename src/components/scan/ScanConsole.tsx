// src/components/scan/ScanConsole.tsx
import React, { useEffect, useRef, useState } from "react";
import { parseScanBarcode } from "../../features/operations/scan/barcodeParser";
import type { ParsedBarcode } from "../../features/operations/scan/barcodeParser";

export type ScanStatus = "idle" | "success" | "error";

export interface ScanRecord {
  id: number;
  value: string;
  status: ScanStatus;
  message?: string;
  ts: Date;
}

export interface ScanConsoleProps {
  title?: string;
  placeholder?: string;
  modeLabel?: string; // UI 展示用标签："收货" / "拣货" / "盘点" 等

  /**
   * 扫描模式：
   * - "fill": 只做解析和回填，不自动调用 onScan
   * - "auto": 解析 + 回填 + 自动调用 onScan
   */
  scanMode?: "fill" | "auto";

  /**
   * 扫描业务回调：只负责接收条码字符串，由外层决定怎么调用 /scan。
   */
  onScan?: (barcode: string) => Promise<void> | void;

  /**
   * 条码解析结果，用于页面回填表单字段。
   */
  onParsedFields?: (parsed: ParsedBarcode) => void;
}

const MAX_RECORDS = 20;

export const ScanConsole: React.FC<ScanConsoleProps> = ({
  title = "扫码输入",
  placeholder = "请将光标置于此处并扫描条码",
  modeLabel,
  scanMode = "fill",
  onScan,
  onParsedFields,
}) => {
  const [input, setInput] = useState("");
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextIdRef = useRef(1);

  // 首次挂载时 focus 一次，后续不抢焦点
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const appendRecord = (value: string, status: ScanStatus, message?: string) => {
    setRecords((prev) => {
      const rec: ScanRecord = {
        id: nextIdRef.current++,
        value,
        status,
        message,
        ts: new Date(),
      };
      const list = [rec, ...prev];
      if (list.length > MAX_RECORDS) return list.slice(0, MAX_RECORDS);
      return list;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    // 先解析 → 回填
    const parsed = parseScanBarcode(value);
    onParsedFields?.(parsed);

    // fill 模式或者没提供 onScan：只记录一条 idle
    if (scanMode === "fill" || !onScan) {
      appendRecord(value, "idle");
      setInput("");
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    // auto 模式：自动执行 onScan
    setBusy(true);
    try {
      await onScan(value);
      appendRecord(value, "success");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "扫描失败";
      appendRecord(value, "error", msg);
    } finally {
      setBusy(false);
      setInput("");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {modeLabel && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
              模式：{modeLabel}
            </span>
          )}
        </div>
        {busy && (
          <span className="text-[11px] text-slate-500">处理中…</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-3">
        <input
          ref={inputRef}
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      <div className="text-xs text-slate-500 mb-1">最近扫描记录</div>
      <div className="max-h-40 overflow-auto border border-slate-100 rounded bg-slate-50 flex-1">
        {records.length === 0 ? (
          <div className="px-3 py-2 text-[11px] text-slate-400">
            暂无记录。
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 text-[11px]">
            {records.map((rec) => (
              <li
                key={rec.id}
                className="px-3 py-1.5 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-mono text-slate-800 break-all">
                    {rec.value}
                  </div>
                  {rec.message && (
                    <div className="text-[10px] text-red-600 mt-0.5">
                      {rec.message}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] text-slate-400">
                    {rec.ts.toLocaleTimeString()}
                  </span>
                  <span
                    className={
                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] " +
                      (rec.status === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : rec.status === "error"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-50 text-slate-500 border border-slate-200")
                    }
                  >
                    {rec.status === "success"
                      ? "成功"
                      : rec.status === "error"
                      ? "失败"
                      : "就绪"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
