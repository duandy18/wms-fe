import React, { useEffect, useRef, useState } from "react";
import {
  parseScanBarcode as defaultParseScanBarcode,
  type ParsedBarcode as DefaultParsedBarcode,
} from "../core/barcodeParser";

export type ScanStatus = "idle" | "success" | "error";

export interface ScanRecord {
  id: number;
  value: string;
  status: ScanStatus;
  message?: string;
  ts: Date;
}

export interface ScanConsoleProps<TParsed = DefaultParsedBarcode> {
  title?: string;
  placeholder?: string;
  modeLabel?: string;
  scanMode?: "fill" | "auto";
  onScan?: (barcode: string) => Promise<void> | void;
  parser?: (raw: string) => TParsed;
  onParsedFields?: (parsed: TParsed) => void;
}

const MAX_RECORDS = 20;

export const ScanConsole = <TParsed = DefaultParsedBarcode,>({
  title = "扫码输入",
  placeholder = "请将光标置于此处并扫描条码",
  modeLabel,
  scanMode = "fill",
  onScan,
  parser,
  onParsedFields,
}: ScanConsoleProps<TParsed>) => {
  const [input, setInput] = useState("");
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextIdRef = useRef(1);

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
      return list.length > MAX_RECORDS ? list.slice(0, MAX_RECORDS) : list;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    const effectiveParser =
      parser ??
      (defaultParseScanBarcode as unknown as (raw: string) => TParsed);

    const parsed = effectiveParser(value);
    onParsedFields?.(parsed);

    if (scanMode === "fill" || !onScan) {
      appendRecord(value, "idle");
      setInput("");
      inputRef.current?.focus();
      return;
    }

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
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {modeLabel ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-base text-slate-700">
              模式：{modeLabel}
            </span>
          ) : null}
        </div>
        {busy ? <span className="text-base text-slate-500">处理中…</span> : null}
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          ref={inputRef}
          className="w-full rounded border border-slate-300 px-4 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      <div className="mb-2 text-lg text-slate-600">最近扫描记录</div>

      <div className="max-h-56 flex-1 overflow-auto rounded border border-slate-100 bg-slate-50">
        {records.length === 0 ? (
          <div className="px-4 py-3 text-lg text-slate-400">暂无记录。</div>
        ) : (
          <ul className="divide-y divide-slate-100 text-lg">
            {records.map((rec) => (
              <li
                key={rec.id}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="break-all font-mono text-slate-800">
                    {rec.value}
                  </div>
                  {rec.message ? (
                    <div className="mt-1 break-words text-base text-red-600">
                      {rec.message}
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-base text-slate-500">
                    {rec.ts.toLocaleTimeString()}
                  </span>
                  <span
                    className={
                      "inline-flex items-center rounded-full border px-3 py-1 text-base " +
                      (rec.status === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : rec.status === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-slate-200 bg-slate-50 text-slate-600")
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
