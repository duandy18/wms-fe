// src/features/admin/items/page/useItemsPage.ts
//
// ItemsPage 状态 / orchestration
// - URL ?barcode=xxx -> scannedBarcode
// - 首次 loadItems
// - scannedBarcode 变化 -> /scan probe
// - 条码唯一绑定 -> 自动选中商品 + 打开条码面板
// - 计算 stats / bindInfo / probeInfo

import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useItemsStore } from "../itemsStore";
import { useScanProbe } from "../../../operations/scan/useScanProbe";
import type { ScanProbeResponse } from "./types";
import { buildBindInfo, buildProbeInfo, buildStats } from "./utils";

export function useItemsPage() {
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

  const probeResult = useItemsStore((s) => s.probeResult) as ScanProbeResponse | null;
  const probeLoading = useItemsStore((s) => s.probeLoading);
  const probeError = useItemsStore((s) => s.probeError);
  const setProbeState = useItemsStore((s) => s.setProbeState);

  // 统一扫码探针（前端视角 mode="items"，后端实际 mode="pick" + probe=true）
  const { probe } = useScanProbe("items");

  // 1) URL ?barcode=xxx -> scannedBarcode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bc = params.get("barcode");
    if (bc && bc.trim()) {
      setScannedBarcode(bc.trim());
    } else {
      setScannedBarcode(null);
    }
  }, [location.search, setScannedBarcode]);

  // 2) 首次加载
  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // 3) 调用 /scan probe
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
        setProbeState({ loading: false, result: null, error: message });
      }
    },
    [probe, setProbeState],
  );

  // 4) scannedBarcode -> probe
  useEffect(() => {
    if (!scannedBarcode) {
      setProbeState({ result: null, error: null });
      return;
    }
    void runProbe(scannedBarcode);
  }, [scannedBarcode, runProbe, setProbeState]);

  // 4.1) 唯一绑定 -> 自动选中 + 打开条码面板
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

  // 5) 顶部统计
  const stats = useMemo(() => {
    const total = items.length;
    const withPrimary = Object.keys(primaryBarcodes).length;
    return buildStats(total, withPrimary);
  }, [items, primaryBarcodes]);

  // 6) ScanConsole 输入回调
  const handleScan = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setScannedBarcode(trimmed);
  };

  // 7) bindInfo
  const owners = useMemo(() => (scannedBarcode ? barcodeOwners[scannedBarcode] || [] : []), [scannedBarcode, barcodeOwners]);
  const bindInfo = useMemo(() => buildBindInfo(scannedBarcode, owners), [scannedBarcode, owners]);

  // 8) probeInfo
  const probeInfo = useMemo(() => buildProbeInfo(scannedBarcode, probeResult, owners), [scannedBarcode, probeResult, owners]);

  return {
    // state
    items,
    error,
    scannedBarcode,
    owners,
    filter,
    setFilter,

    // probe
    probeResult,
    probeLoading,
    probeError,
    probeInfo,

    // binding
    bindInfo,

    // stats
    stats,

    // actions
    handleScan,
  };
}

export default useItemsPage;
