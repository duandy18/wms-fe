// src/features/operations/outbound-pick/PlatformOrderMirrorPanel.tsx
import React from "react";
import type { OrderSummary } from "../../orders/api";
import { OrderMirrorBasics } from "./platformOrderMirror/OrderMirrorBasics";
import { OrderMirrorLinesTable } from "./platformOrderMirror/OrderMirrorLinesTable";

type Props = {
  summary: OrderSummary | null;
  detailOrder: unknown;
  loading: boolean;
  error: string | null;
  onReload?: () => void;
};

export const PlatformOrderMirrorPanel: React.FC<Props> = ({
  summary,
  detailOrder,
  loading,
  error,
  onReload,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <OrderMirrorBasics
        summary={summary}
        detailOrder={detailOrder}
        loading={loading}
        onReload={onReload}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </div>
      ) : null}

      <OrderMirrorLinesTable detailOrder={detailOrder} loading={loading} />
    </section>
  );
};
