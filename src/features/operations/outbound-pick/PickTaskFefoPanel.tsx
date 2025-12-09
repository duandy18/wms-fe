// src/features/operations/outbound-pick/PickTaskFefoPanel.tsx
//
// FEFO 批次视图（内容模块）：
// - 显示当前 active item 的批次库存情况
// - 自动推荐 FEFO 第一批次（available_qty > 0），并提供“一键使用推荐批次”按钮

import React, { useMemo } from "react";
import type {
  ItemDetailResponse,
  ItemSlice,
} from "../../inventory/snapshot/api";
import type { ItemBasic } from "../../../master-data/itemsApi";

type Props = {
  detail: ItemDetailResponse | null;
  loading: boolean;
  error: string | null;
  activeItemMeta: ItemBasic | null;
  onUseBatch: (batchCode: string) => void;
};

type SliceWithExpire = ItemSlice & {
  expire_at?: string | null;
};

function sortFEFO(slices: ItemSlice[]) {
  return [...slices]
    .map((s) => s as SliceWithExpire)
    .sort((a, b) => {
      const da = a.expire_at ? Date.parse(a.expire_at) : Infinity;
      const db = b.expire_at ? Date.parse(b.expire_at) : Infinity;
      return da - db;
    });
}

export const PickTaskFefoPanel: React.FC<Props> = ({
  detail,
  loading,
  error,
  activeItemMeta,
  onUseBatch,
}) => {
  const sortedSlices: SliceWithExpire[] = useMemo(
    () => (detail ? sortFEFO(detail.slices) : []),
    [detail],
  );

  const recommended = useMemo(() => {
    if (!sortedSlices.length) return null;
    const withStock =
      sortedSlices.find((s) => (s.available_qty ?? 0) > 0) ??
      sortedSlices[0];
    return withStock.batch_code ?? null;
  }, [sortedSlices]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-800">
        批次库存（FEFO 参考）
      </h3>

      {activeItemMeta && (
        <div className="text-xs text-slate-700">
          当前商品：
          <span className="mr-1 font-mono">{activeItemMeta.sku}</span>
          <span>{activeItemMeta.name}</span>
          {activeItemMeta.spec && ` · ${activeItemMeta.spec}`}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600">加载失败：{error}</div>
      )}

      {loading ? (
        <div className="text-xs text-slate-500">加载中…</div>
      ) : !detail ? (
        <div className="text-xs text-slate-500">
          当前任务没有可用的 item_id，暂不展示批次。
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <div>
              item_id:{" "}
              <span className="font-mono">{detail.item_id}</span> · 总可用量：
              {detail.totals.available_qty}（on_hand=
              {detail.totals.on_hand_qty}）
            </div>
            {recommended && (
              <button
                type="button"
                className="ml-2 inline-flex items-center rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                onClick={() => onUseBatch(recommended)}
              >
                使用推荐批次: {recommended}
              </button>
            )}
          </div>

          <div className="max-h-32 space-y-2 overflow-auto">
            {sortedSlices.map((s, idx) => {
              const isRecommended =
                recommended && s.batch_code === recommended;
              return (
                <div
                  key={`${s.batch_code}-${idx}`}
                  className={
                    "rounded-lg p-2 text-xs " +
                    (isRecommended
                      ? "border border-sky-300 bg-sky-50"
                      : "border border-slate-200 bg-slate-50")
                  }
                >
                  <div className="flex justify-between">
                    <span className="font-mono">{s.batch_code}</span>
                    <span className="font-semibold">
                      可用：{s.available_qty}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    expire: {s.expire_at ?? "-"}
                  </div>
                  {isRecommended && (
                    <div className="mt-1 text-[11px] text-sky-700">
                      推荐批次（FEFO 优先，且有可用库存）。
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
