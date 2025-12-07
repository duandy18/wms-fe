// src/features/inventory/channel-inventory/ChannelInventoryBindingsCard.tsx
import React from "react";
import type { StoreBinding } from "../../admin/stores/types";

type Props = {
  bindings: StoreBinding[];
  loading: boolean;
};

export const ChannelInventoryBindingsCard: React.FC<Props> = ({
  bindings,
  loading,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          店铺路由绑定（store_warehouse）
        </h2>
        {loading && (
          <span className="text-[11px] text-slate-400">加载中…</span>
        )}
      </div>
      {bindings.length === 0 ? (
        <div className="text-xs text-slate-500">
          暂无绑定仓库：该店铺不会产生渠道可售。
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-2 py-1 text-left">仓库</th>
                <th className="px-2 py-1 text-left">TOP</th>
                <th className="px-2 py-1 text-left">默认</th>
                <th className="px-2 py-1 text-right">priority</th>
              </tr>
            </thead>
            <tbody>
              {bindings.map((b) => (
                <tr
                  key={b.warehouse_id}
                  className="border-b border-slate-100"
                >
                  <td className="px-2 py-1">
                    WH-{b.warehouse_id} · {b.warehouse_name}
                  </td>
                  <td className="px-2 py-1">
                    {b.is_top ? (
                      <span className="inline-block rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px]">
                        TOP
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {b.is_default ? (
                      <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px]">
                        DEFAULT
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {b.priority ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
