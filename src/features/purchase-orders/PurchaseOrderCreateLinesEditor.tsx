// src/features/purchase-orders/PurchaseOrderCreateLinesEditor.tsx
// 多行采购明细编辑
//
// 当前 create 合同：
// - 必填：item_id + uom_id + qty_input
// - 可选商业字段：supply_price / discount_amount / discount_note / remark
// - qty_base 由后端通过 item_uoms.ratio_to_base 推导
// - 前端仅展示“预计 base”，不作为事实字段

import React, { useEffect, useMemo, useState } from "react";
import type { LineDraft } from "./create/presenter/lineDraft";
import type { ItemBasic } from "../../domains/pms/export/contracts/itemBasic";
import type {
  PublicItemAggregate,
  PublicAggregateUom,
} from "../../domains/pms/export/contracts/itemAggregate";
import { fetchItemAggregate } from "../../domains/pms/export/itemAggregateClient";
import { PurchaseOrderCreateLineRow } from "./create/linesEditor/LineRow";
import { PurchaseOrderCreateLinesTableHead } from "./create/linesEditor/columns/TableHead";
import { PO_CREATE_LINE_COLSPAN } from "./create/linesEditor/columns/defs";

interface PurchaseOrderCreateLinesEditorProps {
  lines: LineDraft[];
  items: ItemBasic[];
  itemsLoading: boolean;
  onChangeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  onSelectItem: (lineId: number, itemId: number | null) => void;
  onAddLine: () => void;
  onRemoveLine: (lineId: number) => void;
}

type AggregatesByItemId = Record<number, PublicItemAggregate>;

function sortUoms(uoms: PublicAggregateUom[]): PublicAggregateUom[] {
  const score = (u: PublicAggregateUom) => {
    const purchase = u.is_purchase_default ? 0 : 10;
    const base = u.is_base ? 0 : 1;
    return purchase + base;
  };
  return [...uoms].sort((a, b) => score(a) - score(b) || a.id - b.id);
}

function pickPrimaryBarcodeText(
  aggregate: PublicItemAggregate | undefined,
  loading: boolean,
): string {
  if (!aggregate) return loading ? "加载中…" : "—";
  const primary =
    aggregate.barcodes.find((x) => x.is_primary && x.active) ??
    aggregate.barcodes.find((x) => x.active) ??
    aggregate.barcodes[0];
  return primary?.barcode?.trim() ? primary.barcode : "—";
}

export const PurchaseOrderCreateLinesEditor: React.FC<
  PurchaseOrderCreateLinesEditorProps
> = ({
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

  const [aggregatesByItemId, setAggregatesByItemId] = useState<AggregatesByItemId>({});
  const [aggregatesLoading, setAggregatesLoading] = useState(false);
  const [aggregatesError, setAggregatesError] = useState<string | null>(null);

  const selectedItemIds = useMemo(() => {
    const ids = lines
      .map((x) => Number(x.item_id))
      .filter((x) => Number.isFinite(x) && x > 0);
    return Array.from(new Set(ids)).sort((a, b) => a - b);
  }, [lines]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (selectedItemIds.length === 0) {
        setAggregatesByItemId({});
        setAggregatesError(null);
        return;
      }

      setAggregatesLoading(true);
      setAggregatesError(null);

      try {
        const entries = await Promise.all(
          selectedItemIds.map(async (itemId) => {
            const aggregate = await fetchItemAggregate(itemId);
            return [itemId, aggregate] as const;
          }),
        );

        if (!alive) return;

        const next: AggregatesByItemId = {};
        for (const [itemId, aggregate] of entries) {
          next[itemId] = {
            ...aggregate,
            uoms: sortUoms(aggregate.uoms),
          };
        }
        setAggregatesByItemId(next);
      } catch (e) {
        if (!alive) return;
        console.error("fetchItemAggregate failed:", e);
        setAggregatesError("商品详情加载失败（public aggregate）");
        setAggregatesByItemId({});
      } finally {
        if (alive) {
          setAggregatesLoading(false);
        }
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [selectedItemIds]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">行明细（多行编辑）</h2>
          <p className="mt-1 text-sm text-slate-500">
            行输入负责计划数量与商业字段，不负责执行态收货信息。
          </p>
        </div>

        <button
          type="button"
          onClick={onAddLine}
          className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-base font-medium text-slate-800 hover:bg-slate-50"
        >
          + 添加一行
        </button>
      </div>

      <p className="text-base text-slate-600">
        每一行代表一个 SKU 的采购计划：选择系统商品 → 选择输入单位 → 输入数量与商业字段。
        系统会展示预计的 base 数量（仅提示），实际 base 由后端按单位倍率推导。
      </p>

      {aggregatesError ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-base text-amber-900">
          {aggregatesError}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-base border-collapse">
          <PurchaseOrderCreateLinesTableHead />

          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={PO_CREATE_LINE_COLSPAN}
                  className="px-3 py-6 text-center text-base text-slate-400"
                >
                  暂无行，请点击右上角“添加一行”
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => {
                const selectedItemId = line.item_id ? Number(line.item_id) : null;
                const selectedItem =
                  selectedItemId != null ? itemMap.get(selectedItemId) : undefined;
                const aggregate =
                  selectedItemId != null &&
                  Number.isFinite(selectedItemId) &&
                  selectedItemId > 0
                    ? aggregatesByItemId[selectedItemId]
                    : undefined;

                const uomsForSelectedItem = aggregate?.uoms ?? [];
                const primaryBarcodeText =
                  selectedItemId != null &&
                  Number.isFinite(selectedItemId) &&
                  selectedItemId > 0
                    ? pickPrimaryBarcodeText(aggregate, aggregatesLoading)
                    : "—";

                return (
                  <PurchaseOrderCreateLineRow
                    key={line.id}
                    line={line}
                    idx={idx}
                    items={items}
                    itemsLoading={itemsLoading}
                    selectedItem={selectedItem}
                    uomsForSelectedItem={uomsForSelectedItem}
                    primaryBarcodeText={primaryBarcodeText}
                    uomsLoading={aggregatesLoading}
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
