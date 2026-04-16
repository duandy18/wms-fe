// src/features/purchase-orders/detail/utils.ts
// 拆分说明：从 PurchaseOrderViewPage.tsx 抽出详情页纯函数与轻类型，避免页面层继续承载格式化职责。

export type PageMode = "view" | "edit";

export function formatPurchaseOrderTs(ts: string | null | undefined): string {
  return ts ? ts.replace("T", " ").replace("Z", "") : "-";
}

export function formatPurchaseOrderMoney(v: string | null | undefined): string {
  if (v == null) return "-";
  const s = String(v).trim();
  return s || "-";
}
