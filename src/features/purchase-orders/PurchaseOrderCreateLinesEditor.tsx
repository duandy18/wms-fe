// src/features/purchase-orders/PurchaseOrderCreateLinesEditor.tsx
// 多行采购明细编辑（大字号 Cockpit 版 + 最小单位 + 数量（最小单位））

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
 * 多行编辑区域（大号版）：
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
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          行明细（多行编辑）
        </h2>
        <button
          type="button"
          onClick={onAddLine}
          className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-base font-medium text-slate-800 hover:bg-slate-50"
        >
          + 添加一行
        </button>
      </div>

      <p className="text-base text-slate-600">
        每一行代表一个 SKU 的采购计划：选择系统商品 → 填写规格、最小单位与采购单位 →
        输入订购件数和每件包含的最小单位数量，系统会实时预估行金额并显示按最小单位折算后的数量。
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-base border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-sm uppercase text-slate-600">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">系统商品</th>
              <th className="px-3 py-2 text-left">商品名称</th>
              <th className="px-3 py-2 text-left">规格</th>
              <th className="px-3 py-2 text-left">最小单位</th>
              <th className="px-3 py-2 text-left">采购单位</th>
              <th className="px-3 py-2 text-right">每件数量</th>
              <th className="px-3 py-2 text-right">订购件数</th>
              <th className="px-3 py-2 text-right">数量（最小单位）</th>
              <th className="px-3 py-2 text-right">采购单价(每最小单位)</th>
              <th className="px-3 py-2 text-right">行金额(预估)</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="px-3 py-6 text-center text-base text-slate-400"
                >
                  暂无行，请点击右上角“添加一行”
                </td>
              </tr>
            )}
            {lines.map((line, idx) => {
              const qty = Number(line.qty_ordered || "0");
              const units = Number(line.units_per_case || "1");
              const price = Number(line.supply_price || "0");

              const qtyBase =
                !Number.isNaN(qty) && !Number.isNaN(units)
                  ? qty * units
                  : null;

              const estAmount =
                qtyBase !== null && !Number.isNaN(price)
                  ? qtyBase * price
                  : 0;

              const selectedItemId = line.item_id
                ? Number(line.item_id)
                : null;

              return (
                <tr key={line.id} className="border-b border-slate-100">
                  {/* 行号 */}
                  <td className="px-3 py-3 text-left font-mono text-base">
                    {idx + 1}
                  </td>

                  {/* 系统商品下拉 */}
                  <td className="px-3 py-3">
                    <select
                      className="w-64 rounded-xl border border-slate-300 px-3 py-2 text-base"
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
                      <div className="mt-1 text-sm text-slate-500">
                        系统商品 ID：{line.item_id}
                      </div>
                    )}
                  </td>

                  {/* 商品名称 */}
                  <td className="px-3 py-3">
                    <input
                      className="w-56 rounded-xl border border-slate-300 px-3 py-2 text-base"
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
                  <td className="px-3 py-3">
                    <input
                      className="w-48 rounded-xl border border-slate-300 px-3 py-2 text-base"
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
                  <td className="px-3 py-3">
                    <input
                      className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-base"
                      value={line.base_uom}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "base_uom",
                          e.target.value,
                        )
                      }
                      placeholder="袋 / 罐 / PCS"
                    />
                  </td>

                  {/* 采购单位 */}
                  <td className="px-3 py-3">
                    <input
                      className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-base"
                      value={line.purchase_uom}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "purchase_uom",
                          e.target.value,
                        )
                      }
                      placeholder="件 / 箱 / 托"
                    />
                  </td>

                  {/* 每件数量 */}
                  <td className="px-3 py-3 text-right">
                    <input
                      className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
                      value={line.units_per_case}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "units_per_case",
                          e.target.value,
                        )
                      }
                      placeholder="每件包含数量"
                    />
                  </td>

                  {/* 订购件数 */}
                  <td className="px-3 py-3 text-right">
                    <input
                      className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
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

                  {/* 数量（最小单位） */}
                  <td className="px-3 py-3 text-right text-slate-900 font-mono">
                    {qtyBase !== null ? qtyBase : "-"}
                  </td>

                  {/* 采购单价（每最小单位） */}
                  <td className="px-3 py-3 text-right">
                    <input
                      className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-right text-base"
                      value={line.supply_price}
                      onChange={(e) =>
                        onChangeLineField(
                          line.id,
                          "supply_price",
                          e.target.value,
                        )
                      }
                      placeholder="每最小单位单价"
                    />
                  </td>

                  {/* 行金额（只读预估） */}
                  <td className="px-3 py-3 text-right text-slate-800">
                    {qtyBase !== null && estAmount > 0
                      ? estAmount.toFixed(2)
                      : "-"}
                  </td>

                  {/* 操作 */}
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(line.id)}
                      className="text-base text-red-600 hover:underline disabled:opacity-40"
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
