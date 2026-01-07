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
// - 若条码唯一绑定：自动选中商品行 + 展开条码管理面板

import React, { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useItemsStore } from "./itemsStore";
import ItemsFormSection from "./ItemsFormSection";
import { ItemBarcodesPanel } from "./ItemBarcodesPanel";
import { useScanProbe } from "../../operations/scan/useScanProbe";

import type { BindInfo, ProbeInfo, ScanProbeResponse, ItemsStats } from "./page/types";
import { StatsCards } from "./page/StatsCards";
import { BarcodeScanCard } from "./page/BarcodeScanCard";
import { ProbeResultSection } from "./page/ProbeResultSection";
import { ItemsListCard } from "./page/ItemsListCard";

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
        const message = err instanceof Error ? err.message : "调用 /scan 失败";
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
    if (!scannedBarcode) return;

    const itemId = barcodeIndex[scannedBarcode];
    if (!itemId) {
      setPanelOpen(true);
      return;
    }
    const target = items.find((it) => it.id === itemId);
    if (!target) return;

    setSelectedItem(target);
    setPanelOpen(true);
  }, [scannedBarcode, barcodeIndex, items, setSelectedItem, setPanelOpen]);

  // --- 5. 顶部主条码覆盖率统计 ---
  const stats: ItemsStats = useMemo(() => {
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
  const bindInfo: BindInfo | null = useMemo(() => {
    if (!scannedBarcode) return null;
    const owners = barcodeOwners[scannedBarcode] || [];
    if (owners.length === 0) {
      return {
        status: "UNBOUND",
        msg: "当前系统中尚未绑定此条码，可在下方商品列表中选择目标商品，并在条码管理卡片中新增绑定。",
      };
    }
    if (owners.length === 1) {
      return {
        status: "BOUND",
        msg: `已在主数据中绑定到商品 ID ${owners[0]}，可在条码管理卡片中查看/调整。`,
      };
    }
    return {
      status: "CONFLICT",
      msg: `该条码被绑定到多个商品：${owners.join(", ")}，建议尽快排查并修复（严重冲突）。`,
    };
  }, [scannedBarcode, barcodeOwners]);

  // --- 8. 构造 probe 一致性提示 ---
  const probeInfo: ProbeInfo | null = useMemo(() => {
    if (!scannedBarcode || !probeResult) return null;

    const owners = barcodeOwners[scannedBarcode] || [];
    const backendId = probeResult.item_id ?? null;

    if (!backendId && owners.length === 0) {
      return {
        level: "ok",
        msg: "后端 /scan 未解析出 item_id，主数据中也未绑定此条码，两边一致。",
      };
    }

    if (backendId && owners.length === 1 && owners[0] === backendId) {
      return {
        level: "ok",
        msg: `后端 /scan 解析 item_id=${backendId}，与主数据绑定完全一致。`,
      };
    }

    if (backendId && owners.length === 0) {
      return {
        level: "warn",
        msg: `后端 /scan 解析 item_id=${backendId}，但主数据中未绑定此条码，可考虑在条码管理中将其绑定到该商品，或检查条码规则。`,
      };
    }

    return {
      level: "error",
      msg: `后端 /scan 解析 item_id=${backendId}，但主数据中绑定商品为：${
        owners.length ? owners.join(", ") : "无"
      }，存在不一致，需尽快排查。`,
    };
  }, [scannedBarcode, probeResult, barcodeOwners]);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">商品主数据（Items）</h1>
        <p className="mt-1 text-sm text-slate-500">
          Items 是全系统统一的商品来源：入库、出库、库存、批次、订单都只认{" "}
          <span className="font-mono">item_id</span> / <span className="font-mono">sku</span>。
          商品新建必须绑定供货商（必选），否则无法创建。条码管理必须在这里维护完整，仓库作业区只负责扫描执行，不再判断商品。
        </p>
      </header>

      <StatsCards stats={stats} />

      <BarcodeScanCard onScan={handleScan} />

      {scannedBarcode ? (
        <ProbeResultSection
          scannedBarcode={scannedBarcode}
          bindInfo={bindInfo}
          probeLoading={probeLoading}
          probeError={probeError}
          probeResult={probeResult}
          probeInfo={probeInfo}
          barcodeOwners={barcodeOwners}
        />
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <ItemsFormSection />

      <ItemsListCard filter={filter} onChangeFilter={setFilter} />

      {/* ✅ 直接渲染条码管理面板：不再包外圈 */}
      <ItemBarcodesPanel />
    </div>
  );
};

export default ItemsPage;
