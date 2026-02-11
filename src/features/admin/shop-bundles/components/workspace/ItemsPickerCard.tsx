// admin/shop-bundles/components/build/ItemsPickerCard.tsx
import React from "react";
import type { UseItemsPickerState } from "../../useItemsPicker";
import type { UseFskuComponentsState } from "../../useFskuComponents";
import { cls } from "../../ui";

export const ItemsPickerCard: React.FC<{
  fskuId: number | null;
  readOnly: boolean;

  I: UseItemsPickerState;
  C: UseFskuComponentsState;

  selectedItemIds: Set<number>;
}> = ({ fskuId, readOnly, I, C, selectedItemIds }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">主商品数据（items）</div>
          <div className="text-[11px] text-slate-500">勾选即加入左侧 components（qty 默认 1），取消勾选即移除。</div>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          onClick={() => void I.refresh()}
          disabled={I.loading}
        >
          {I.loading ? "加载中…" : "刷新"}
        </button>
      </div>

      {I.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{I.error}</div>
      ) : null}

      <label className="block space-y-1">
        <div className="text-[11px] text-slate-500">搜索（按 SKU / 名称 / 主条码 / 品牌 / id）</div>
        <input
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          value={I.query}
          onChange={(e) => I.setQuery(e.target.value)}
          placeholder="例如：SKU-0001 / 笔记本 / 690... / 得力 / 12"
        />
      </label>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700">
          可选 items（{I.filtered.length}）
        </div>

        <div className="max-h-[360px] overflow-auto">
          {I.filtered.length ? (
            <table className="min-w-full table-fixed border-collapse text-xs">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-[11px] text-slate-600 border-b border-slate-200">
                  <th className="px-2 py-2 text-left border-r border-slate-200 w-[110px]">SKU</th>
                  <th className="px-2 py-2 text-left border-r border-slate-200 w-[240px]">商品名称</th>
                  <th className="px-2 py-2 text-left border-r border-slate-200 w-[180px]">主条码</th>
                  <th className="px-2 py-2 text-left border-r border-slate-200 w-[110px]">品牌</th>
                  <th className="px-2 py-2 text-left border-r border-slate-200 w-[80px]">单位</th>
                  <th className="px-2 py-2 text-center w-[70px]">选择</th>
                </tr>
              </thead>

              <tbody>
                {I.filtered.map((it) => {
                  const checked = selectedItemIds.has(it.id);

                  return (
                    <tr key={it.id} className={cls("border-b border-slate-100", checked && "bg-emerald-50")}>
                      <td className="px-2 py-2 align-top border-r border-slate-100 font-mono text-[11px] text-slate-900 break-words whitespace-normal">
                        {it.sku}
                      </td>

                      <td className="px-2 py-2 align-top border-r border-slate-100 text-[12px] text-slate-900 break-words whitespace-normal">
                        {it.name || "—"}
                      </td>

                      <td className="px-2 py-2 align-top border-r border-slate-100 font-mono text-[11px] text-slate-700 break-words whitespace-normal">
                        {it.barcode ?? "—"}
                      </td>

                      <td className="px-2 py-2 align-top border-r border-slate-100 text-[11px] text-slate-700 break-words whitespace-normal">
                        {it.brand ?? "—"}
                      </td>

                      <td className="px-2 py-2 align-top border-r border-slate-100 text-[11px] text-slate-700 break-words whitespace-normal">
                        {it.uom ?? "—"}
                      </td>

                      <td className="px-2 py-2 align-top text-center">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={readOnly || fskuId == null}
                            onChange={(e) => {
                              const next = e.target.checked;
                              if (next) C.addItem(it.id, 1);
                              else C.removeItem(it.id);
                            }}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <span className={checked ? "text-[11px] text-emerald-700" : "text-[11px] text-slate-500"}>
                            {checked ? "已选" : "选择"}
                          </span>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-3 py-3 text-[12px] text-slate-500">无匹配项。</div>
          )}
        </div>
      </div>

      {readOnly ? (
        <div className="text-[11px] text-slate-500">当前 FSKU 不是 draft（已冻结），右侧选择不可用。</div>
      ) : fskuId == null ? (
        <div className="text-[11px] text-slate-500">未选择 FSKU，先在上方新建草稿或选择一个草稿。</div>
      ) : null}
    </section>
  );
};
