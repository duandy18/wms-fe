// src/features/purchase-orders/PurchaseOrderCreateLinesEditor.tsx
// 多行采购明细编辑（大字号 Cockpit 版）
//
// 终态：行输入使用 uom_id + qty_input；qty_base 由后端通过 item_uoms.ratio_to_base 推导。
// 前端仅做“预计 base”提示，不作为事实口径。

import React, { useEffect, useMemo, useState } from "react";
import type { LineDraft } from "./usePurchaseOrderCreatePresenter";
import type { ItemBasic } from "../../master-data/itemsApi";
import { PurchaseOrderCreateLineRow } from "./createV2/linesEditor/LineRow";
import { PurchaseOrderCreateLinesTableHead } from "./createV2/linesEditor/Columns";
import { PO_CREATE_LINE_COLSPAN } from "./createV2/linesEditor/columns.def";
import { fetchItemUomsByItems, type ItemUom } from "../../master-data/itemUomsApi";

interface PurchaseOrderCreateLinesEditorProps {
  lines: LineDraft[];
  items: ItemBasic[];
  itemsLoading: boolean;
  onChangeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  onSelectItem: (lineId: number, itemId: number | null) => void;
  onAddLine: () => void;
  onRemoveLine: (lineId: number) => void;
}

type UomsByItemId = Record<number, ItemUom[]>;

function sortUoms(uoms: ItemUom[]): ItemUom[] {
  const score = (u: ItemUom) => {
    // 越小越优先：purchase_default > base > others
    const purchase = u.is_purchase_default ? 0 : 10;
    const base = u.is_base ? 0 : 1;
    return purchase + base;
  };
  return [...uoms].sort((a, b) => score(a) - score(b) || a.id - b.id);
}

export const PurchaseOrderCreateLinesEditor: React.FC<PurchaseOrderCreateLinesEditorProps> = ({
  lines,
  items,
  itemsLoading,
  onChangeLineField,
  onSelectItem,
  onAddLine,
  onRemoveLine,
}) => {
  const itemMap = useMemo(() => {
    const m = new Map<number, ItemBasic>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  // ---- item_uoms 批量缓存（避免 N+1）----
  const [uomsByItemId, setUomsByItemId] = useState<UomsByItemId>({});
  const [uomsLoading, setUomsLoading] = useState(false);
  const [uomsError, setUomsError] = useState<string | null>(null);

  const itemIds = useMemo(() => {
    const ids = items.map((x) => x.id).filter((x) => Number.isFinite(x) && x > 0);
    return Array.from(new Set(ids)).sort((a, b) => a - b);
  }, [items]);

  useEffect(() => {
    let alive = true;

    async function run() {
      // items 还在加载时，不要发 uoms 请求
      if (itemsLoading) return;

      if (itemIds.length === 0) {
        setUomsByItemId({});
        setUomsError(null);
        return;
      }

      setUomsLoading(true);
      setUomsError(null);

      try {
        const all = await fetchItemUomsByItems(itemIds);

        const m: UomsByItemId = {};
        for (const u of all) {
          const iid = Number(u.item_id);
          if (!Number.isFinite(iid) || iid <= 0) continue;
          (m[iid] ||= []).push(u);
        }

        for (const k of Object.keys(m)) {
          const iid = Number(k);
          m[iid] = sortUoms(m[iid]);
        }

        if (!alive) return;
        setUomsByItemId(m);
      } catch (e) {
        if (!alive) return;
        console.error("fetchItemUomsByItems failed:", e);
        setUomsError("单位加载失败（item_uoms）");
        setUomsByItemId({});
      } finally {
        if (alive) {
          setUomsLoading(false);
        }
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [itemIds, itemsLoading]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">行明细（多行编辑）</h2>
        <button
          type="button"
          onClick={onAddLine}
          className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-base font-medium text-slate-800 hover:bg-slate-50"
        >
          + 添加一行
        </button>
      </div>

      <p className="text-base text-slate-600">
        每一行代表一个 SKU 的采购计划：选择系统商品 → 选择输入单位（item_uoms）→ 输入数量（qty_input）。
        系统会展示预计的 base 数量（仅提示），实际 base 由后端按单位倍率推导。
      </p>

      {uomsError ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-base text-amber-900">
          {uomsError}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-base border-collapse">
          <PurchaseOrderCreateLinesTableHead />

          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={PO_CREATE_LINE_COLSPAN} className="px-3 py-6 text-center text-base text-slate-400">
                  暂无行，请点击右上角“添加一行”
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => {
                const selectedItemId = line.item_id ? Number(line.item_id) : null;
                const selectedItem = selectedItemId != null ? itemMap.get(selectedItemId) : undefined;

                const uomsForSelectedItem =
                  selectedItemId != null && Number.isFinite(selectedItemId) && selectedItemId > 0
                    ? (uomsByItemId[selectedItemId] ?? [])
                    : [];

                return (
                  <PurchaseOrderCreateLineRow
                    key={line.id}
                    line={line}
                    idx={idx}
                    items={items}
                    itemsLoading={itemsLoading}
                    selectedItem={selectedItem}
                    uomsForSelectedItem={uomsForSelectedItem}
                    uomsLoading={uomsLoading}
                    onChangeLineField={onChangeLineField}
                    onSelectItem={onSelectItem}
                    onRemoveLine={onRemoveLine}
                    canRemove={lines.length > 1}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
