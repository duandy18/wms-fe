// src/features/admin/items/ItemsPage.tsx
//
// 商品主数据首页（Barcode Hub + 列表上方，条码管理下方布局）
//
// - 顶部：主条码覆盖率统计
// - 中部：Items 条码扫描台 + /scan probe 条码体检
// - 下部：新建商品表单
// - 底部：商品列表（上） + 当前商品条码管理（下）
//
// 本页的扫码逻辑：
// - 扫码台使用 useScanProbe("items") 调用 /scan(mode=pick, probe=true) 做条码体检
// - ItemsStore 中的 barcodeIndex 用于条码 → item_id 唯一反查
// - 若条码唯一绑定：自动选中商品行 + 滚动定位 + 展开条码管理面板

import React, { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useItemsStore } from "./itemsStore";
import ItemsFormSection from "./ItemsFormSection";
import { ItemsTable } from "./ItemsTable";
import { ItemBarcodesPanel } from "./ItemBarcodesPanel";
import { ScanConsole } from "../../../components/scan/ScanConsole";
import { useScanProbe } from "../../operations/scan/useScanProbe";

type ScanProbeError = {
  stage?: string;
  error?: string;
};

interface ScanProbeResponse {
  ok: boolean;
  committed: boolean;
  scan_ref: string;
  event_id?: number | null;
  source?: string | null;
  item_id?: number | null;
  qty?: number | null;
  batch_code?: string | null;
  evidence?: Array<Record<string, unknown>>;
  errors?: ScanProbeError[];
}

const ItemsPage: React.FC = () => {
  const location = useLocation();

  const items = useItemsStore((s) => s.items);
  const error = useItemsStore((s) => s.error);
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);
  const barcodeOwners = useItemsStore((s) => s.barcodeOwners);
  const primaryBarcodes = useItemsStore((s) => s.primaryBarcodes);
  const barcodeIndex = useItemsStore((s) => s.barcodeIndex);
  const filter = useItemsStore((s) => s.filter);

  const setScannedBarcode = useItemsStore((s) => s.setScannedBarcode);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setPanelOpen = useItemsStore((s) => s.setPanelOpen);
  const setFilter = useItemsStore((s) => s.setFilter);
  const loadItems = useItemsStore((s) => s.loadItems);

  const probeResult = useItemsStore((s) => s.probeResult);
  const probeLoading = useItemsStore((s) => s.probeLoading);
  const probeError = useItemsStore((s) => s.probeError);
  const setProbeState = useItemsStore((s) => s.setProbeState);

  // 统一扫码探针（前端视角 mode="items"，后端实际 mode="pick" + probe=true）
  const { probe } = useScanProbe("items");

  // --- 1. 从 URL 读取 ?barcode=xxx，写入 scannedBarcode ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bc = params.get("barcode");
    if (bc && bc.trim()) {
      setScannedBarcode(bc.trim());
    } else {
      setScannedBarcode(null);
    }
  }, [location.search, setScannedBarcode]);

  // --- 2. 首次加载商品 + 条码绑定信息 ---
  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // --- 3. 调用 /scan 做条码体检（通过 useScanProbe 实现） ---
  const runProbe = useCallback(
    async (barcode: string) => {
      const trimmed = barcode.trim();
      if (!trimmed) return;

      setProbeState({ loading: true, error: null, result: null });

      try {
        const std = await probe({
          barcode: trimmed,
          warehouseId: 1,
          ctx: { device_id: "items-page" },
        });

        const res: ScanProbeResponse = std.raw;
        setProbeState({ loading: false, result: res });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "调用 /scan 失败";
        setProbeState({
          loading: false,
          result: null,
          error: message,
        });
      }
    },
    [probe, setProbeState],
  );

  // --- 4. 当 scannedBarcode 变化时：做体检 ---
  useEffect(() => {
    if (!scannedBarcode) {
      setProbeState({ result: null, error: null });
      return;
    }
    void runProbe(scannedBarcode);
  }, [scannedBarcode, runProbe, setProbeState]);

  // --- 4.1 扫码后：若条码在主数据中唯一绑定 → 自动选中该商品 + 展开条码管理面板 ---
  useEffect(() => {
    if (!scannedBarcode) {
      return;
    }
    const itemId = barcodeIndex[scannedBarcode];
    if (!itemId) {
      // 未绑定条码：保持当前选中项，只确保条码面板展开，方便用户看到提示
      setPanelOpen(true);
      return;
    }
    const target = items.find((it) => it.id === itemId);
    if (!target) return;

    setSelectedItem(target);
    setPanelOpen(true);
  }, [scannedBarcode, barcodeIndex, items, setSelectedItem, setPanelOpen]);

  // --- 5. 顶部主条码覆盖率统计 ---
  const stats = useMemo(() => {
    const total = items.length;
    const withPrimary = Object.keys(primaryBarcodes).length;
    return {
      total,
      withPrimary,
      withoutPrimary: total - withPrimary,
    };
  }, [items, primaryBarcodes]);

  // --- 6. 扫描输入回调（ScanConsole） ---
  const handleScan = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setScannedBarcode(trimmed);
  };

  // --- 7. 构造条码绑定信息 ---
  const bindInfo = useMemo(() => {
    if (!scannedBarcode) return null;
    const owners = barcodeOwners[scannedBarcode] || [];
    if (owners.length === 0) {
      return {
        status: "UNBOUND" as const,
        msg: "当前系统中尚未绑定此条码，可在下方商品列表中选择目标商品，并在条码管理卡片中新增绑定。",
      };
    }
    if (owners.length === 1) {
      return {
        status: "BOUND" as const,
        msg: `已在主数据中绑定到商品 ID ${owners[0]}，可在条码管理卡片中查看/调整。`,
      };
    }
    return {
      status: "CONFLICT" as const,
      msg: `该条码被绑定到多个商品：${owners.join(
        ", ",
      )}，建议尽快排查并修复（严重冲突）。`,
    };
  }, [scannedBarcode, barcodeOwners]);

  // --- 8. 构造 probe 一致性提示 ---
  const probeInfo = useMemo(() => {
    if (!scannedBarcode || !probeResult) return null;

    const owners = barcodeOwners[scannedBarcode] || [];
    const backendId = probeResult.item_id ?? null;

    if (!backendId && owners.length === 0) {
      return {
        level: "ok" as const,
        msg: "后端 /scan 未解析出 item_id，主数据中也未绑定此条码，两边一致。",
      };
    }

    if (backendId && owners.length === 1 && owners[0] === backendId) {
      return {
        level: "ok" as const,
        msg: `后端 /scan 解析 item_id=${backendId}，与主数据绑定完全一致。`,
      };
    }

    if (backendId && owners.length === 0) {
      return {
        level: "warn" as const,
        msg: `后端 /scan 解析 item_id=${backendId}，但主数据中未绑定此条码，可考虑在条码管理中将其绑定到该商品，或检查条码规则。`,
      };
    }

    return {
      level: "error" as const,
      msg: `后端 /scan 解析 item_id=${backendId}，但主数据中绑定商品为：${
        owners.length ? owners.join(", ") : "无"
      }，存在不一致，需尽快排查。`,
    };
  }, [scannedBarcode, probeResult, barcodeOwners]);

  return (
    <div className="space-y-6 p-6">
      {/* 头部 */}
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          商品主数据（Items）
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Items 是全系统统一的商品来源：入库、出库、库存、批次、订单都只认{" "}
          <span className="font-mono">item_id</span> /{" "}
          <span className="font-mono">sku</span>。
          条码管理必须在这里维护完整，仓库作业区只负责扫描执行，不再判断商品。
        </p>
      </header>

      {/* 顶部统计 */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <div className="text-[11px] text-slate-500">商品总数</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {stats.total}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <div className="text-[11px] text-emerald-700">已配置主条码</div>
          <div className="mt-1 text-xl font-semibold text-emerald-900">
            {stats.withPrimary}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <div className="text-[11px] text-amber-700">
            未配置主条码（入库时会失败）
          </div>
          <div className="mt-1 text-xl font-semibold text-amber-900">
            {stats.withoutPrimary}
          </div>
        </div>
      </section>

      {/* 条码扫描台 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">
          Items 条码扫描台
        </h2>
        <p className="text-[11px] text-slate-500">
          扫描任意条码，系统会调用 /scan(mode=pick, probe=true) 做一次条码体检，
          并在下方展示主数据绑定情况。你可以在条码管理卡片中完成绑定或调整。
        </p>
        <ScanConsole
          title="条码扫描（barcode → item）"
          modeLabel="items-page"
          scanMode="auto"
          onScan={handleScan}
        />
      </section>

      {/* 扫描结果 + 条码体检 */}
      {scannedBarcode && (
        <section className="space-y-2">
          {/* 当前条码 + 绑定提示 */}
          <div className="space-y-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-800">
            <div>
              当前条码：{" "}
              <span className="font-mono">{scannedBarcode}</span>
            </div>
            {bindInfo && <div>{bindInfo.msg}</div>}
          </div>

          {/* 条码体检卡片 */}
          <div className="space-y-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">
                条码体检（/scan probe）
              </span>
              {probeLoading && (
                <span className="text-[11px] text-slate-500">
                  调用 /scan 中…
                </span>
              )}
            </div>

            {probeError && (
              <div className="mt-1 text-[11px] text-red-600">
                {probeError}
              </div>
            )}

            {probeResult && (
              <>
                <div>
                  后端解析 item_id：{" "}
                  <span className="font-mono">
                    {probeResult.item_id ?? "(未解析)"}
                  </span>
                </div>
                <div>
                  主数据绑定 item_ids：{" "}
                  <span className="font-mono">
                    {(barcodeOwners[scannedBarcode] || []).length > 0
                      ? (barcodeOwners[scannedBarcode] || []).join(", ")
                      : "(无)"}
                  </span>
                </div>
                {probeInfo && (
                  <div
                    className={
                      "mt-1 " +
                      (probeInfo.level === "ok"
                        ? "text-emerald-700"
                        : probeInfo.level === "warn"
                        ? "text-amber-700"
                        : "text-red-700")
                    }
                  >
                    {probeInfo.msg}
                  </div>
                )}
                {probeResult.errors &&
                  probeResult.errors.length > 0 && (
                    <div className="mt-1 text-[11px] text-red-600">
                      /scan 报告错误：
                      {probeResult.errors.map(
                        (e: ScanProbeError, idx: number) => (
                          <div key={idx}>
                            [{e.stage ?? "stage"}] {e.error ?? ""}
                          </div>
                        ),
                      )}
                    </div>
                  )}
              </>
            )}

            {!probeError && !probeResult && !probeLoading && (
              <div className="mt-1 text-[11px] text-slate-500">
                尚未拿到 /scan 体检结果。
              </div>
            )}
          </div>
        </section>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 新建商品表单（含 SKU 生成器） */}
      <ItemsFormSection />

      {/* 商品列表 */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            商品列表
          </h2>

          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span>状态筛选：</span>
            <button
              type="button"
              className={
                "rounded px-2 py-1 border " +
                (filter === "all"
                  ? "border-slate-900 text-slate-900"
                  : "border-slate-300 text-slate-500")
              }
              onClick={() => setFilter("all")}
            >
              全部
            </button>
            <button
              type="button"
              className={
                "rounded px-2 py-1 border " +
                (filter === "enabled"
                  ? "border-emerald-500 text-emerald-700"
                  : "border-slate-300 text-slate-500")
              }
              onClick={() => setFilter("enabled")}
            >
              仅启用
            </button>
            <button
              type="button"
              className={
                "rounded px-2 py-1 border " +
                (filter === "disabled"
                  ? "border-slate-500 text-slate-800"
                  : "border-slate-300 text-slate-500")
              }
              onClick={() => setFilter("disabled")}
            >
              仅停用
            </button>
          </div>
        </div>

        <ItemsTable />
      </section>

      {/* 当前商品条码管理 */}
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">
          当前商品的条码管理
        </h2>
        <p className="text-xs text-slate-500">
          在上方商品列表中点击「管理条码」，或在顶部扫描条码并手动选择商品，然后在这里维护主条码和次条码。
        </p>
        <ItemBarcodesPanel />
      </section>
    </div>
  );
};

export default ItemsPage;
