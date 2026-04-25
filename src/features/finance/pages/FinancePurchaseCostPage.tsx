import { useCallback, useEffect, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchFinanceSkuPurchaseLedger,
  fetchFinanceSkuPurchaseLedgerOptions,
} from "../api/financeApi";
import type {
  SkuPurchaseLedgerOptionsResponse,
  SkuPurchaseLedgerRow,
} from "../contracts/finance";
import { formatCurrency } from "../model/formatters";

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

const emptyOptions: SkuPurchaseLedgerOptionsResponse = {
  items: [],
  suppliers: [],
  warehouses: [],
};

function itemLabel(item: SkuPurchaseLedgerOptionsResponse["items"][number]) {
  const parts = [
    item.item_name || `Item #${item.item_id}`,
    `ID:${item.item_id}`,
    item.item_sku ? `SKU:${item.item_sku}` : "",
    item.spec_text ? `规格:${item.spec_text}` : "",
  ].filter(Boolean);
  return parts.join(" · ");
}

function supplierLabel(
  supplier: SkuPurchaseLedgerOptionsResponse["suppliers"][number],
) {
  return `${supplier.supplier_name || "-"} · ID:${supplier.supplier_id}`;
}

function warehouseLabel(
  warehouse: SkuPurchaseLedgerOptionsResponse["warehouses"][number],
) {
  return `${warehouse.warehouse_name || `仓库 ${warehouse.warehouse_id}`} · ID:${warehouse.warehouse_id}`;
}

function parseOptionalId(value: string, label: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} 必须是正整数`);
  }
  return parsed;
}

function formatMoney(value: number | null | undefined) {
  return value == null ? "-" : formatCurrency(value);
}

export default function FinancePurchaseCostPage() {
  const [ledgerRows, setLedgerRows] = useState<SkuPurchaseLedgerRow[]>([]);
  const [options, setOptions] =
    useState<SkuPurchaseLedgerOptionsResponse>(emptyOptions);

  const [itemKeyword, setItemKeyword] = useState("");
  const [supplierIdText, setSupplierIdText] = useState("");
  const [warehouseIdText, setWarehouseIdText] = useState("");

  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError(null);
    try {
      const data = await fetchFinanceSkuPurchaseLedgerOptions();
      setOptions(data);
    } catch (err: unknown) {
      console.error("load finance purchase ledger options failed", err);
      setOptions(emptyOptions);
      setOptionsError(errorMessage(err, "加载筛选选项失败"));
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supplierId = parseOptionalId(supplierIdText, "供应商");
      const warehouseId = parseOptionalId(warehouseIdText, "仓库");

      const ledger = await fetchFinanceSkuPurchaseLedger({
        item_keyword: itemKeyword.trim() || undefined,
        supplier_id: supplierId,
        warehouse_id: warehouseId,
      });

      setLedgerRows(ledger.rows);
    } catch (err: unknown) {
      console.error("load finance purchase ledger failed", err);
      setError(errorMessage(err, "加载 SKU 采购价格核算表失败"));
      setLedgerRows([]);
    } finally {
      setLoading(false);
    }
  }, [itemKeyword, supplierIdText, warehouseIdText]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="财务分析 · 采购成本"
        description="按商品、供应商和仓库查询 SKU 采购价格核算表。核算单价由后端按同一 SKU 的采购总价 / 折算基础数量合计计算。"
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3 text-xs text-slate-700">
            <div className="text-xs font-semibold text-slate-800">
              筛选条件
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1">
                <span>商品</span>
                <select
                  className="w-72 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={itemKeyword}
                  disabled={optionsLoading}
                  onChange={(e) => setItemKeyword(e.target.value)}
                >
                  <option value="">
                    {optionsLoading ? "商品加载中…" : "全部商品"}
                  </option>
                  {options.items.map((item) => (
                    <option key={item.item_id} value={String(item.item_id)}>
                      {itemLabel(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1">
                <span>供应商</span>
                <select
                  className="w-56 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={supplierIdText}
                  disabled={optionsLoading}
                  onChange={(e) => setSupplierIdText(e.target.value)}
                >
                  <option value="">
                    {optionsLoading ? "供应商加载中…" : "全部供应商"}
                  </option>
                  {options.suppliers.map((supplier) => (
                    <option
                      key={supplier.supplier_id}
                      value={String(supplier.supplier_id)}
                    >
                      {supplierLabel(supplier)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1">
                <span>仓库</span>
                <select
                  className="w-56 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={warehouseIdText}
                  disabled={optionsLoading}
                  onChange={(e) => setWarehouseIdText(e.target.value)}
                >
                  <option value="">
                    {optionsLoading ? "仓库加载中…" : "全部仓库"}
                  </option>
                  {options.warehouses.map((warehouse) => (
                    <option
                      key={warehouse.warehouse_id}
                      value={String(warehouse.warehouse_id)}
                    >
                      {warehouseLabel(warehouse)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {optionsError && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] text-amber-700">
                {optionsError}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className={
                "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white " +
                (loading
                  ? "bg-sky-400 opacity-70"
                  : "bg-sky-600 hover:bg-sky-700")
              }
            >
              {loading ? "加载中…" : "查询"}
            </button>
            {error && (
              <div className="max-w-xs rounded-md border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              SKU 采购价格核算表
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              一行代表一条采购单行；核算单价 = 同一 SKU 在当前筛选结果中的采购总价 ÷ 折算基础数量合计。
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            当前行数：
            <span className="ml-1 font-mono font-semibold text-slate-900">
              {ledgerRows.length}
            </span>
          </span>
        </div>

        <div className="overflow-auto rounded-xl border border-slate-100">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  商品名称
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  商品 ID
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  SKU
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  规格
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  供应商
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  仓库
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  采购日期
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  采购单号
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  采购数量
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  采购单位
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  折算基础数量
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  采购单价
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  采购总价
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  核算单价
                </th>
              </tr>
            </thead>
            <tbody>
              {ledgerRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="px-3 py-8 text-center text-xs text-slate-500"
                  >
                    当前筛选条件下暂无 SKU 采购价格核算数据。
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row) => (
                  <tr
                    key={row.po_line_id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-slate-800">
                      {row.item_name || "-"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {row.item_id}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {row.item_sku || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.spec_text || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.supplier_name || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.warehouse_name || `仓库 ${row.warehouse_id}`}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                      {row.purchase_date}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-slate-800">
                          {row.po_no}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          line: {row.line_no}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {row.qty_ordered_input}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.purchase_uom_name_snapshot}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <div className="flex flex-col">
                        <span>{row.qty_ordered_base}</span>
                        <span className="text-[10px] text-slate-500">
                          ×{row.purchase_ratio_to_base_snapshot}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatMoney(row.purchase_unit_price)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatMoney(row.planned_line_amount)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">
                      {formatMoney(row.accounting_unit_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
