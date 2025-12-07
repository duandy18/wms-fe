// src/features/operations/scan/ScanCountPage.tsx
//
// v2 盘点 Cockpit（Orchestrator 版）：手工盘点 + 扫码盘点（/scan, mode=count）
// 重点：最近一次 ScanResponse 上增加 “查看链路 / 查看库存” 按钮
// - 表单提交：真正调用 /scan(mode=count) 落 COUNT 台账
// - 扫码台：probe=true，只做条码解析（识别 item_id 等），不直接动账（通过 useScanProbe 统一实现）

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { scanCountV2, fetchItemMeta, type ItemMeta } from "./api";
import type { ScanResponse } from "./api";
import { makeCountScanRequest } from "./scanRequest";
import type { ParsedBarcode } from "./barcodeParser";

import ApiBadge from "../../../components/common/ApiBadge";
import type { FormState } from "./scanCountTypes";
import { ScanCountItemMetaCard } from "./ScanCountItemMetaCard";
import { ScanCountForm } from "./ScanCountForm";
import { ScanCountScanPanel } from "./ScanCountScanPanel";
import { ScanCountResultPanel } from "./ScanCountResultPanel";
import { ScanCountSidebar } from "./ScanCountSidebar";
import { useScanProbe } from "./useScanProbe";

type ScanMode = "fill" | "auto";

type ApiErrorShape = {
  message?: string;
};

const ScanCountPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(() => ({
    item_id: 0,
    actual: 0,
    warehouse_id: 1,
    batch_code: "",
  }));

  const [scanMode, setScanMode] = useState<ScanMode>("fill");

  const [loading, setLoading] = useState(false); // 仅用于真正提交 /scan 落账
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [itemMeta, setItemMeta] = useState<ItemMeta | null>(null);
  const [itemMetaError, setItemMetaError] = useState<string | null>(null);
  const [itemMetaLoading, setItemMetaLoading] = useState(false);

  // 统一扫码探针：用于扫码台（probe=true，不落账）
  const { probe } = useScanProbe("count");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isDateMissing = useMemo(
    () => !form.production_date && !form.expiry_date,
    [form.production_date, form.expiry_date],
  );

  const formError = useMemo(() => {
    if (!form.item_id || form.item_id <= 0) {
      return "item_id 必须为正整数";
    }
    if (form.actual < 0) {
      return "actual 必须 ≥ 0";
    }
    if (!form.batch_code.trim()) {
      return "batch_code 必填";
    }
    if (isDateMissing) {
      return "盘盈为入库行为，必须提供 production_date 或 expiry_date";
    }
    return null;
  }, [form, isDateMissing]);

  // item_id 变化时加载主数据
  useEffect(() => {
    const id = form.item_id;
    if (!id || id <= 0) {
      setItemMeta(null);
      setItemMetaError(null);
      return;
    }
    setItemMetaLoading(true);
    setItemMetaError(null);
    fetchItemMeta(id)
      .then((meta) => setItemMeta(meta))
      .catch((err: unknown) => {
        const e = err as ApiErrorShape;
        console.error("loadItemMeta (count) failed:", e);
        setItemMeta(null);
        setItemMetaError(e?.message ?? "加载商品主数据失败");
      })
      .finally(() => setItemMetaLoading(false));
  }, [form.item_id]);

  // 表单提交：真正落 COUNT 台账（保持原逻辑不变）
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const msg = formError;
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      const req = makeCountScanRequest(
        {
          item_id: form.item_id,
          actual: form.actual,
          warehouse_id: form.warehouse_id,
          batch_code: form.batch_code.trim(),
          production_date: form.production_date || undefined,
          expiry_date: form.expiry_date || undefined,
          ctx: { device_id: "count-page" },
        },
        "count-page",
      );

      const res = await scanCountV2(req);
      setResult(res);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "扫码盘点失败");
    } finally {
      setLoading(false);
    }
  }

  const handleScanParsed = (parsed: ParsedBarcode) => {
    setForm((prev) => ({
      ...prev,
      item_id: parsed.item_id ?? prev.item_id,
      actual: parsed.qty ?? prev.actual,
      batch_code: parsed.batch_code ?? prev.batch_code,
      warehouse_id: parsed.warehouse_id ?? prev.warehouse_id,
      production_date: parsed.production_date ?? prev.production_date,
      expiry_date: parsed.expiry_date ?? prev.expiry_date,
    }));
  };

  // 扫码台：只做解析（probe=true，不落账），用于识别 item_id 并引导条码绑定
  async function handleScanConsole(barcode: string) {
    setError(null);
    setResult(null);
    try {
      const std = await probe({
        barcode,
        warehouseId: form.warehouse_id ?? 1,
        ctx: { device_id: "scan-console-count" },
      });

      const res = std.raw;
      setResult(res);

      if (std.status === "OK" && std.item_id && std.item_id > 0) {
        setForm((prev) => ({
          ...prev,
          item_id: std.item_id as number,
        }));
      } else if (std.status === "UNBOUND") {
        const go = window.confirm(
          `条码 ${barcode} 尚未绑定任何商品，是否前往 Items 进行条码绑定？`,
        );
        if (go) {
          navigate(
            `/admin/items?barcode=${encodeURIComponent(barcode)}`,
          );
        }
      } else if (std.status === "ERROR" && std.message) {
        setError(std.message);
      }
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "扫码盘点失败");
      throw err;
    }
  }

  function handleReset() {
    setForm({
      item_id: 0,
      actual: 0,
      warehouse_id: 1,
      batch_code: "",
      production_date: "",
      expiry_date: "",
    } as FormState);
    setResult(null);
    setError(null);
    setItemMeta(null);
    setItemMetaError(null);
  }

  return (
    <div className="p-6 space-y-6">
      {/* 头部 */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            盘点（v2 /scan count）
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            使用统一 ScanRequest 调用 <code>/scan</code>（mode=
            <code>count</code>），录入 item / batch / 盘点后数量，后端自动计算盘盈盘亏并落账。
          </p>
        </div>
        <ApiBadge method="POST" path="/scan" />
      </header>

      {/* Item 主数据信息卡片 */}
      {form.item_id > 0 && (
        <ScanCountItemMetaCard
          itemId={form.item_id}
          itemMeta={itemMeta}
          loading={itemMetaLoading}
          error={itemMetaError}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 items-start">
        {/* 左侧：表单 + 扫码台 + 结果 */}
        <div className="space-y-4">
          <ScanCountForm
            form={form}
            loading={loading}
            error={error}
            onUpdate={update}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />

          <ScanCountScanPanel
            scanMode={scanMode}
            onChangeScanMode={setScanMode}
            onScan={handleScanConsole}
            onScanParsed={handleScanParsed}
          />

          <ScanCountResultPanel result={result} />
        </div>

        {/* 右侧占位（未来可接 Snapshot / Trace） */}
        <ScanCountSidebar />
      </div>
    </div>
  );
};

export default ScanCountPage;
