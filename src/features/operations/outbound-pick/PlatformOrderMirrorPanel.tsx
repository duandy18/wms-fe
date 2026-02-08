// src/features/operations/outbound-pick/PlatformOrderMirrorPanel.tsx
import React, { useMemo } from "react";
import type { OrderSummary } from "../../orders/api";
import { OrderMirrorBasics } from "./platformOrderMirror/OrderMirrorBasics";
import { OrderMirrorLinesTable } from "./platformOrderMirror/OrderMirrorLinesTable";

// ✅ 解析结果：通过 replay 得到（字段驱动，不推导）
import { useOrderExplain } from "./orderExplain/useOrderExplain";
import type { OrderExplainCardInput, PlatformOrderReplayOut } from "./orderExplain/types";

type Props = {
  summary: OrderSummary | null;
  detailOrder: unknown;
  loading: boolean;
  error: string | null;
  onReload?: () => void;
};

type ExplainLite =
  | { kind: "idle" }
  | { kind: "missing_key"; reason: string }
  | { kind: "loading" }
  | { kind: "ready"; data: PlatformOrderReplayOut }
  | { kind: "error"; message: string };

export const PlatformOrderMirrorPanel: React.FC<Props> = ({
  summary,
  detailOrder,
  loading,
  error,
  onReload,
}) => {
  const input = useMemo<OrderExplainCardInput | null>(() => {
    if (!summary) return null;
    return {
      orderId: summary.id,
      platform: summary.platform,
      shop_id: summary.shop_id,
      ext_order_no: summary.ext_order_no,
      store_id: summary.store_id ?? null,
    };
  }, [summary]);

  const explainHook = useOrderExplain(input);
  const explain: ExplainLite = explainHook.state;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <OrderMirrorBasics
        summary={summary}
        detailOrder={detailOrder}
        loading={loading}
        onReload={onReload}
        explain={explain}
        onReloadExplain={() => void explainHook.reload()}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </div>
      ) : null}

      <OrderMirrorLinesTable
        detailOrder={detailOrder}
        loading={loading}
        explain={explain}
        onReloadExplain={() => void explainHook.reload()}
      />
    </section>
  );
};
