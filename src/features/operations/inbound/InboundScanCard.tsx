// src/features/operations/inbound/InboundScanCard.tsx
// 收货扫码卡片（面向仓库作业）
// - 使用统一 /scan(mode=receive, probe=true) 做条码解析（BarcodeResolver + 条码表 + GS1）
// - 本地 parseScanBarcode 作为补充（数量）
// - 只负责解析 + 写入数量；批次/日期统一在收货明细里编辑

import React, { useState } from "react";
import { ScanConsole } from "../../../components/scan/ScanConsole";
import type { InboundCockpitController } from "./types";
import {
  parseScanBarcode,
  type ParsedBarcode,
} from "../scan/barcodeParser";
import { useScanProbe } from "../scan/useScanProbe";

interface Props {
  c: InboundCockpitController;
}

type StatusLevel = "idle" | "ok" | "warn" | "error";

type ApiErrorShape = {
  message?: string;
};

export const InboundScanCard: React.FC<Props> = ({ c }) => {
  // 本次扫描要累积的数量（同一件货扫一次即可）
  const [scanQty, setScanQty] = useState<number>(1);

  const [statusLevel, setStatusLevel] = useState<StatusLevel>("idle");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const { probe, loading, error: probeError } = useScanProbe("receive");

  const handleScan = async (barcodeRaw: string) => {
    const barcode = barcodeRaw.trim();
    if (!barcode) return;

    // 记录历史（简单打个桩）
    c.handleScan(barcode);

    // 基础解析（前端轻量规则）
    const parsedLocal: ParsedBarcode = parseScanBarcode(barcode);

    // 调用统一 /scan(mode=receive, probe=true)
    try {
      const std = await probe({
        barcode,
        warehouseId: c.currentTask?.warehouse_id ?? 1,
        ctx: { device_id: "inbound-cockpit" },
      });

      // 状态提示
      if (std.status === "OK") {
        setStatusLevel("ok");
        setStatusMsg(
          `条码解析成功：item_id=${std.item_id ?? "(未解析)"}，qty=${std.qty ?? 1}`,
        );
      } else if (std.status === "UNBOUND") {
        setStatusLevel("warn");
        setStatusMsg(
          `条码 ${barcode} 未在条码主数据中绑定任何商品，请检查条码与 Items 条码管理。`,
        );
      } else {
        setStatusLevel("error");
        setStatusMsg(std.message ?? "条码解析失败");
      }

      // 合并解析信息：item_id / qty
      const itemId =
        (std.item_id as number | null | undefined) ??
        parsedLocal.item_id ??
        null;

      const qtyFromParsed =
        (std.qty as number | null | undefined) ??
        parsedLocal.qty ??
        1;

      // 手工输入优先：scanQty > 0 时覆盖解析数量
      const effectiveQty =
        Number.isFinite(scanQty) && scanQty > 0 ? scanQty : qtyFromParsed;

      // 构造覆盖后的 ParsedBarcode，交给中控写入 receive_task_lines
      const overridden: ParsedBarcode = {
        ...parsedLocal,
        raw: barcode,
        item_id: itemId ?? undefined,
        qty: effectiveQty,
      };

      await c.handleScanParsed(overridden);
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setStatusLevel("error");
      setStatusMsg(err?.message ?? "调用 /scan 解析失败");
      throw e;
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v) || v <= 0) {
      setScanQty(1);
    } else {
      setScanQty(Math.floor(v));
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          收货扫码台
        </h2>
        {c.currentTask && (
          <span className="text-[11px] text-slate-500">
            当前任务：#{c.currentTask.id}
            {c.currentTask.po_id != null && (
              <> · PO-{c.currentTask.po_id}</>
            )}
            ，仓库：{c.currentTask.warehouse_id}，状态：{c.currentTask.status}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500">
        每次扫描将调用统一条码解析链
        <span className="font-mono mx-1">/scan(mode=receive, probe=true)</span>
        ，解析出 <span className="font-mono">item_id / qty</span>{" "}
        等信息，落入当前收货任务的
        <span className="font-mono mx-1">
          receive_task_lines.scanned_qty
        </span>
        上。下方“本次扫描数量”用于指定本次要累积多少件，无需重复扫码。
        批次与日期只在收货明细中统一维护。
      </p>

      <div className="border border-dashed border-slate-300 rounded-lg p-2">
        <ScanConsole
          title="收货扫码台"
          modeLabel="receive → 收货任务"
          scanMode="auto"
          onScan={handleScan}
        />
      </div>

      {/* 本次扫描数量 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-slate-600">本次扫描数量</label>
          <input
            type="number"
            min={1}
            className="border rounded-md px-2 py-1 text-xs"
            value={scanQty}
            onChange={handleQtyChange}
          />
          <p className="text-[10px] text-slate-500">
            例如需要收 10 件，同一条码只需扫码一次，在此填 10 即可。
            若条码本身带数量，此处的值优先。
          </p>
        </div>
      </div>

      {/* 解析状态提示 */}
      <div className="text-[11px]">
        {loading && (
          <span className="text-slate-500">调用 /scan 中…</span>
        )}
        {probeError && (
          <span className="text-red-600 ml-2">
            {probeError}
          </span>
        )}
        {statusMsg && (
          <div
            className={
              "mt-1 rounded-md px-2 py-1 inline-block " +
              (statusLevel === "ok"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : statusLevel === "warn"
                ? "bg-amber-50 border border-amber-200 text-amber-700"
                : statusLevel === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-slate-50 border border-slate-200 text-slate-500")
            }
          >
            {statusMsg}
          </div>
        )}
      </div>
    </section>
  );
};
