// src/features/operations/scan/ScanCountItemMetaCard.tsx

import React from "react";
import type { ItemMeta } from "./api";

type Props = {
  itemId: number;
  itemMeta: ItemMeta | null;
  loading: boolean;
  error: string | null;
};

export const ScanCountItemMetaCard: React.FC<Props> = ({
  itemId,
  itemMeta,
  loading,
  error,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
      <div>
        <div>
          当前 item_id: <span className="font-mono">{itemId}</span>
        </div>
        {loading ? (
          <div className="text-slate-500 mt-1">加载商品主数据中…</div>
        ) : itemMeta ? (
          <div className="space-y-0.5 mt-1">
            <div>
              名称：
              <span className="font-semibold">{itemMeta.name}</span>
            </div>
            <div>规格：{itemMeta.spec || "（未填写）"}</div>
            <div>单位：{itemMeta.uom || "PCS（默认）"}</div>
            <div>
              状态：{" "}
              {itemMeta.enabled === false ? (
                <span className="text-red-600">停用</span>
              ) : (
                <span className="text-emerald-600">启用</span>
              )}
            </div>
          </div>
        ) : error ? (
          <div className="text-red-600 mt-1">{error}</div>
        ) : (
          <div className="text-slate-400 mt-1">尚未加载到商品主数据。</div>
        )}
      </div>
    </section>
  );
};
