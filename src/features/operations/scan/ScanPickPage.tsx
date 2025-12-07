// src/features/operations/scan/ScanPickPage.tsx
//
// v2 拣货 Cockpit（Orchestrator 版）：手工拣货 + 扫码拣货（/scan, mode=pick）
// 重点：最近一次 ScanResponse 上增加 “查看链路 / 查看库存” 按钮
// - 表单提交：真正调用 /scan(mode=pick) 扣库存
// - 扫码台：probe=true，只做条码解析（识别 item_id），不扣库存（通过 useScanProbe 统一实现）

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { scanPickV2, fetchItemMeta, type ItemMeta } from "./api";
import type { ScanResponse } from "./api";
import { makePickScanRequest } from "./scanRequest";
import type { ParsedBarcode } from "./barcodeParser";

import ApiBadge from "../../../components/common/ApiBadge";
import type { FormState } from "./scanPickTypes";
import { ScanPickItemMetaCard } from "./ScanPickItemMetaCard";
import { ScanPickForm } from "./ScanPickForm";
import { ScanPickScanPanel } from "./ScanPickScanPanel";
import { ScanPickResultPanel } from "./ScanPickResultPanel";
import { ScanPickSidebar } from "./ScanPickSidebar";
import { useScanProbe } from "./useScanProbe";

type ScanMode = "fill" | "auto";

type ApiErrorShape = {
  message?: string;
};

const ScanPickPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(() => ({
    item_id: 0,
    qty: 0,
    warehouse_id: 1,
    batch_code: "",
  }));

  const [scanMode, setScanMode] = useState<ScanMode>("auto");

  const [loading, setLoading] = useState(false); // 仅用于真正提交 /scan 扣库
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [itemMeta, setItemMeta] = useState<ItemMeta | null>(null);
  const [itemMetaError, setItemMetaError] = useState<string | null>(null);
  const [itemMetaLoading, setItemMetaLoading] = useState(false);

  // 统一扫码探针：用于扫码台（probe=true，不扣库存）
  const { probe } = useScanProbe("pick");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const formError = useMemo(() => {
    if (!form.item_id || form.item_id <= 0) return "item_id 必须为正整数";
    if (form.qty <= 0) return "qty 必须 > 0";
    if (!form.batch_code.trim()) return "batch_code 必填";
    return null;
  }, [form]);

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
        console.error("loadItemMeta (pick) failed:", e);
        setItemMeta(null);
        setItemMetaError(e?.message ?? "加载商品主数据失败");
      })
      .finally(() => setItemMetaLoading(false));
  }, [form.item_id]);

  // 表单提交：真正扣库存（保持原逻辑不变）
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
      const req = makePickScanRequest(
        {
          item_id: form.item_id,
          qty: form.qty,
          warehouse_id: form.warehouse_id ?? 1,
          batch_code: form.batch_code.trim(),
          ctx: { device_id: "scan-pick-page" },
        },
        "scan-pick-page",
      );

      const res = await scanPickV2(req);
      setResult(res);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      setError(e?.message ?? "扫码拣货失败");
    } finally {
      setLoading(false);
    }
  }

  const handleScanParsed = (parsed: ParsedBarcode) => {
    setForm((prev) => ({
      ...prev,
      item_id: parsed.item_id ?? prev.item_id,
      qty: parsed.qty ?? prev.qty,
      batch_code: parsed.batch_code ?? prev.batch_code,
      warehouse_id: parsed.warehouse_id ?? prev.warehouse_id,
    }));
  };

  // 扫码台：只做解析（probe=true，不扣库存），用于识别 item_id 和跳转条码绑定
  async function handleScanConsole(barcode: string) {
    setError(null);
    setResult(null);
    try {
      const std = await probe({
        barcode,
        warehouseId: form.warehouse_id ?? 1,
        ctx: { device_id: "scan-console-pick" },
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
      setError(e?.message ?? "扫码拣货失败");
      throw err;
    }
  }

  function handleReset() {
    setForm({
      item_id: 0,
      qty: 0,
      warehouse_id: 1,
      batch_code: "",
    });
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
            拣货（v2 /scan pick）
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            表单提交：使用统一 ScanRequest 调用 <code>/scan</code>（mode=
            <code>pick</code>）执行真正扣库。下方扫码台则仅用于解析条码（probe=true）并回填表单，不直接动账。
          </p>
        </div>
        <ApiBadge method="POST" path="/scan" />
      </header>

      {/* Item 主数据信息卡片 */}
      {form.item_id > 0 && (
        <ScanPickItemMetaCard
          itemId={form.item_id}
          itemMeta={itemMeta}
          loading={itemMetaLoading}
          error={itemMetaError}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 items-start">
        {/* 左侧：表单 + 扫码台 + 结果 */}
        <div className="space-y-4">
          <ScanPickForm
            form={form}
            loading={loading}
            error={error}
            onUpdate={update}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />

          <ScanPickScanPanel
            scanMode={scanMode}
            onChangeScanMode={setScanMode}
            onScan={handleScanConsole}
            onScanParsed={handleScanParsed}
          />

          <ScanPickResultPanel result={result} />
        </div>

        {/* 右侧占位（未来可接 Snapshot / Trace） */}
        <ScanPickSidebar />
      </div>
    </div>
  );
};

export default ScanPickPage;
