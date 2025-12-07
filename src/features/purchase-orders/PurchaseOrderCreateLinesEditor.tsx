// src/features/purchase-orders/PurchaseOrderCreateLinesEditor.tsx

import React from "react";
import type { LineDraft } from "./usePurchaseOrderCreatePresenter";
import type { ItemBasic } from "../../master-data/itemsApi";

interface PurchaseOrderCreateLinesEditorProps {
  lines: LineDraft[];
  items: ItemBasic[];
  itemsLoading: boolean;
  onChangeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  onSelectItem: (lineId: number, itemId: number | null) => void;
  onAddLine: () => void;
  onRemoveLine: (lineId: number) => void;
}

/**
 * 多行编辑区域：
 * - 使用商品主数据下拉选择系统商品（ItemBasic）；
 * - 选中后，自动联动 item_id + item_name + spec_text + 最小单位；
 * - 金额预估使用：qty_ordered(件) × units_per_case(件内最小单位数量) × supply_price(最小单位单价)。
 */
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
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          行明细（多行编辑）
        </h2>
        <button
          type="button"
          onClick={onAddLine}
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
        >
          + 添加一行
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500">
              <th className="px-2 py-1 text-left">#</th>
              <th className="px-2 py-1 text-left">系统商品</th>
              <th className="px-2 py-1 text-left">商品名称</th>
              <th className="px-2 py-1 text-left">规格</th>
              <th className="px-2 py-1 text-left">最小单位</th>
              <th className="px-2 py-1 text-right">每件数量</th>
              <th className="px-2 py-1 text-left">分类</th>
              <th className="px-2 py-1 text-right">订购件数</th>
              <th className="px-2 py-1 text-right">采购单价(每最小单位)</th>
              <th className="px-2 py-1 text-right">行金额(预估)</th>
              <th className="px-2 py-1 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-2 py-4 text-center text-slate-400"
                >
                  暂无行，请点击“添加一行”
                </td>
              </tr>
            )}
            {lines.map((line, idx) => {
              const qty = Number(line.qty_ordered || "0");
              const units = Number(line.units_per_case || "1");
              const price = Number(line.supply_price || "0");
              const estAmount =
                !Number.isNaN(qty) &&
                !Number.isNaN(units) &&
                !Number.isNaN(price)
                  ? qty * units * price
                  : 0;

              const selectedItemId = line.item_id
                ? Number(line.item_id)
                : null;

              return (
                <tr key={line.id} className="border-b border-slate-100">
                  {/* 行号 */}
                  <td className="px-2 py-1 text-left font-mono text-[11px]">
                    {idx + 1}
                  </td>

                  {/* 系统商品下拉 */}
                  <td className="px-2 py-1">
                    <select
                      className="w-48 rounded-md border border-slate-300 px-2 py-1 text-xs"
                      value={selectedItemId ?? ""}
                      disabled={itemsLoading}
                      onChange={(e) =>
                        onSelectItem(
                          line.id,
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">
                        {itemsLoading ? "加载中…" : "请选择商品"}
                      </option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {`[${it.id}] ${it.name}${
                            it.spec ? ` ｜ ${it.spec}` : ""
                          }`}
                        </option>
                      ))}
                    </select>
                    {line.item_id && (
                      <div className="mt-1 text-[10px] text-slate-500">
                        系统商品 ID：{line.item_id}
                      </div>
                    )}
                  </td>

                  {/* 商品名称 */}
                  <td className="px-2 py-1">
                    <input
                      className="w-40 rounded-md border border-slate-300 px-2 py-1 text-xs"
                      value={line.item_name}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "item_name",
                          e.target.value,
                        )
                      }
                      placeholder="商品名称（供货商单据）"
                    />
                  </td>

                  {/* 规格 */}
                  <td className="px-2 py-1">
                    <input
                      className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                      value={line.spec_text}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "spec_text",
                          e.target.value,
                        )
                      }
                      placeholder="如 1.5kg*8入"
                    />
                  </td>

                  {/* 最小单位 */}
                  <td className="px-2 py-1">
                    <input
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs"
                      value={line.purchase_uom}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "purchase_uom",
                          e.target.value,
                        )
                      }
                      placeholder="PCS / 袋 / 箱"
                    />
                  </td>

                  {/* 每件数量 */}
                  <td className="px-2 py-1 text-right">
                    <input
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs text-right"
                      value={line.units_per_case}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "units_per_case",
                          e.target.value,
                        )
                      }
                      placeholder="每件数量"
                    />
                  </td>

                  {/* 分类 */}
                  <td className="px-2 py-1">
                    <input
                      className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                      value={line.category}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "category",
                          e.target.value,
                        )
                      }
                      placeholder="分类（可选）"
                    />
                  </td>

                  {/* 订购件数 */}
                  <td className="px-2 py-1 text-right">
                    <input
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs text-right"
                      value={line.qty_ordered}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "qty_ordered",
                          e.target.value,
                        )
                      }
                      placeholder="件数"
                    />
                  </td>

                  {/* 采购单价（每最小单位） */}
                  <td className="px-2 py-1 text-right">
                    <input
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs text-right"
                      value={line.supply_price}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "supply_price",
                          e.target.value,
                        )
                      }
                      placeholder="每袋单价"
                    />
                  </td>

                  {/* 行金额（只读预估） */}
                  <td className="px-2 py-1 text-right text-slate-700">
                    {estAmount > 0 ? estAmount.toFixed(2) : "-"}
                  </td>

                  {/* 操作 */}
                  <td className="px-2 py-1">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(line.id)}
                      className="text-[11px] text-red-600 hover:underline disabled:opacity-40"
                      disabled={lines.length <= 1}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
