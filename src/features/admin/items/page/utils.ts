// src/features/admin/items/page/utils.ts
//
// ItemsPage 纯工具函数（无 React / 无 store）

import type { BindInfo, ProbeInfo, ScanProbeResponse } from "./types";

export function buildStats(itemsCount: number, primaryCount: number) {
  return {
    total: itemsCount,
    withPrimary: primaryCount,
    withoutPrimary: itemsCount - primaryCount,
  };
}

export function buildBindInfo(scannedBarcode: string | null, owners: number[]): BindInfo | null {
  if (!scannedBarcode) return null;

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
}

export function buildProbeInfo(scannedBarcode: string | null, probeResult: ScanProbeResponse | null, owners: number[]): ProbeInfo | null {
  if (!scannedBarcode || !probeResult) return null;

  const backendId = probeResult.item_id ?? null;

  if (!backendId && owners.length === 0) {
    return { level: "ok", msg: "后端 /scan 未解析出 item_id，主数据中也未绑定此条码，两边一致。" };
  }

  if (backendId && owners.length === 1 && owners[0] === backendId) {
    return { level: "ok", msg: `后端 /scan 解析 item_id=${backendId}，与主数据绑定完全一致。` };
  }

  if (backendId && owners.length === 0) {
    return {
      level: "warn",
      msg: `后端 /scan 解析 item_id=${backendId}，但主数据中未绑定此条码，可考虑在条码管理中将其绑定到该商品，或检查条码规则。`,
    };
  }

  return {
    level: "error",
    msg: `后端 /scan 解析 item_id=${backendId}，但主数据中绑定商品为：${owners.length ? owners.join(", ") : "无"}，存在不一致，需尽快排查。`,
  };
}
