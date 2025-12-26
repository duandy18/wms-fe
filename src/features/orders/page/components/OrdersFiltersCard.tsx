// src/features/orders/page/components/OrdersFiltersCard.tsx

import React from "react";
import { UI } from "../ui";

export const OrdersFiltersCard: React.FC<{
  platform: string;
  shopId: string;
  status: string;
  timeFrom: string;
  timeTo: string;
  limit: number;

  loading: boolean;
  error: string | null;

  onChangePlatform: (v: string) => void;
  onChangeShopId: (v: string) => void;
  onChangeStatus: (v: string) => void;
  onChangeTimeFrom: (v: string) => void;
  onChangeTimeTo: (v: string) => void;
  onChangeLimit: (v: number) => void;

  onQuery: () => void | Promise<void>;
}> = ({
  platform,
  shopId,
  status,
  timeFrom,
  timeTo,
  limit,
  loading,
  error,
  onChangePlatform,
  onChangeShopId,
  onChangeStatus,
  onChangeTimeFrom,
  onChangeTimeTo,
  onChangeLimit,
  onQuery,
}) => {
  return (
    <section className={UI.card}>
      <div className={UI.filtersRow}>
        <div className={UI.field}>
          <span className={UI.fieldLabel}>平台</span>
          <input className={UI.inputW28} value={platform} onChange={(e) => onChangePlatform(e.target.value)} placeholder="如 PDD" />
        </div>

        <div className={UI.field}>
          <span className={UI.fieldLabel}>店铺 ID</span>
          <input className={UI.inputW32} value={shopId} onChange={(e) => onChangeShopId(e.target.value)} placeholder="可选" />
        </div>

        <div className={UI.field}>
          <span className={UI.fieldLabel}>状态</span>
          <input className={UI.inputW32} value={status} onChange={(e) => onChangeStatus(e.target.value)} placeholder="如 SHIPPED / RETURNED" />
        </div>

        <div className={UI.field}>
          <span className={UI.fieldLabel}>开始日期</span>
          <input className={UI.input} type="date" value={timeFrom} onChange={(e) => onChangeTimeFrom(e.target.value)} />
        </div>

        <div className={UI.field}>
          <span className={UI.fieldLabel}>结束日期</span>
          <input className={UI.input} type="date" value={timeTo} onChange={(e) => onChangeTimeTo(e.target.value)} />
        </div>

        <div className={UI.field}>
          <span className={UI.fieldLabel}>每页数量</span>
          <input
            className={UI.inputW20}
            type="number"
            value={limit}
            onChange={(e) => onChangeLimit(Number(e.target.value || "") || 50)}
          />
        </div>

        <button type="button" disabled={loading} onClick={() => void onQuery()} className={UI.btnQuery}>
          {loading ? "查询中…" : "查询"}
        </button>
      </div>

      {error ? <div className={UI.err}>{error}</div> : null}
    </section>
  );
};

export default OrdersFiltersCard;
