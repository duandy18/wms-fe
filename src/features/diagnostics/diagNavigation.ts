// src/features/diagnostics/diagNavigation.ts
//
// 诊断跳转协议（DiagnosticLink）
// 统一 Trace / Ledger / Inventory / Lifeline 之间的跳转规则，避免到处手拼 URL。

export type DiagnosticLink =
  | {
      kind: "trace";
      traceId: string;
      focusRef?: string;
    }
  | {
      kind: "ledger";
      warehouseId: number;
      itemId: number;
      batchCode?: string;
    }
  | {
      kind: "lifeline";
      warehouseId: number;
      itemId: number;
      batchCode: string;
    }
  | {
      kind: "stock";
      warehouseId: number;
      itemId: number;
      batchCode?: string;
    };

/**
 * 根据 DiagnosticLink 生成实际的前端 URL。
 * 当前实现基于：
 * - Trace Studio:      /trace?tab=trace&trace_id=...&focus_ref=...
 * - Ledger Studio:     /tools/ledger?tab=tool&warehouse_id=...&item_id=...&batch_code=...
 * - Inventory Studio:
 *   - stock slice:     /tools/stocks?warehouse_id=...&item_id=...&batch_code=...
 *   - batch lifeline:  /tools/stocks?warehouse_id=...&item_id=...&batch_code=...#lifeline
 */
export function buildDiagnosticUrl(link: DiagnosticLink): string {
  switch (link.kind) {
    case "trace": {
      const params = new URLSearchParams();
      params.set("tab", "trace");
      params.set("trace_id", link.traceId);
      if (link.focusRef) {
        params.set("focus_ref", link.focusRef);
      }
      return `/trace?${params.toString()}`;
    }
    case "ledger": {
      const params = new URLSearchParams();
      params.set("tab", "tool");
      params.set("warehouse_id", String(link.warehouseId));
      params.set("item_id", String(link.itemId));
      if (link.batchCode) {
        params.set("batch_code", link.batchCode);
      }
      return `/tools/ledger?${params.toString()}`;
    }
    case "stock": {
      const params = new URLSearchParams();
      params.set("warehouse_id", String(link.warehouseId));
      params.set("item_id", String(link.itemId));
      if (link.batchCode) {
        params.set("batch_code", link.batchCode);
      }
      return `/tools/stocks?${params.toString()}`;
    }
    case "lifeline": {
      const params = new URLSearchParams();
      params.set("warehouse_id", String(link.warehouseId));
      params.set("item_id", String(link.itemId));
      params.set("batch_code", link.batchCode);
      return `/tools/stocks?${params.toString()}#lifeline`;
    }
    default: {
      // 不认识就返回首页，理论上不会走到这里
      return "/snapshot";
    }
  }
}
