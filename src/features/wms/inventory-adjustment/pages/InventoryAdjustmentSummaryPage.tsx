import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import type { InventoryAdjustmentSummaryDetail } from "../model/useInventoryAdjustmentSummaryPage";
import {
  formatDateTime,
  formatInventoryAdjustmentSourceType,
  formatInventoryAdjustmentStatus,
  formatInventoryAdjustmentType,
  formatLedgerAction,
  formatQty,
  formatQtyWithUnit,
  INVENTORY_ADJUSTMENT_TYPE_OPTIONS,
} from "../contracts/inventoryAdjustmentSummary";
import { useInventoryAdjustmentSummaryPage } from "../model/useInventoryAdjustmentSummaryPage";

function DetailShell({
  loading,
  error,
  detail,
}: {
  loading: boolean;
  error: string;
  detail: InventoryAdjustmentSummaryDetail | null;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
        详情加载中…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  const ledgerRows = detail?.ledger_rows ?? [];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-600">
                动作
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-600">
                商品名
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-600">
                商品ID
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-600">
                批次
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-600">
                单位
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium text-slate-600">
                变动
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium text-slate-600">
                变动后
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-600">
                追溯号
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ledgerRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500">
                  暂无台账明细。
                </td>
              </tr>
            ) : (
              ledgerRows.map((ledger) => (
                <tr key={ledger.id}>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {formatLedgerAction(ledger.sub_reason)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {ledger.item_name || "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-700">
                    {ledger.item_id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-700">
                    {ledger.lot_code || (ledger.lot_id != null ? `lot #${ledger.lot_id}` : "-")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {ledger.base_uom_name || "-"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2 text-right font-mono ${
                      ledger.delta >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {formatQtyWithUnit(ledger.delta, ledger.base_uom_name)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-slate-700">
                    {formatQtyWithUnit(ledger.after_qty, ledger.base_uom_name)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-700">
                    {ledger.trace_id || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const InventoryAdjustmentSummaryPage: React.FC = () => {
  const m = useInventoryAdjustmentSummaryPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="库存调节汇总"
        description="统一查看盘点、入库冲回、出库冲回三类库存调节动作；汇总页只读，不在此执行调节动作。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_240px]">
            <label className="space-y-1">
              <div className="text-xs text-slate-500">调节类型</div>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={m.adjustmentType ?? ""}
                disabled={m.loading}
                onChange={(e) => m.selectAdjustmentType(e.target.value)}
              >
                {INVENTORY_ADJUSTMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || "ALL"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-xs text-slate-500">仓库</div>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={m.warehouseIdText}
                disabled={m.loading || m.warehousesLoading}
                onChange={(e) => m.selectWarehouseId(e.target.value)}
              >
                <option value="">
                  {m.warehousesLoading ? "仓库加载中…" : "全部仓库"}
                </option>
                {m.warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {m.warehouseNameById[warehouse.id] ?? `仓库 ${warehouse.id}`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">共 {m.total} 条</div>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={m.loading}
              onClick={m.reload}
            >
              {m.loading ? "刷新中…" : "刷新"}
            </button>
          </div>
        </div>

        {m.warehousesError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.warehousesError}
          </div>
        ) : null}

        {m.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">类型</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">调节内容</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">编号</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">仓库</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">状态</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">来源</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">来源引用</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">业务时间</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">提交时间</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">行数</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">库存变动</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {m.loading ? (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-slate-500">
                    正在加载库存调节汇总…
                  </td>
                </tr>
              ) : m.rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-slate-500">
                    暂无库存调节记录
                  </td>
                </tr>
              ) : (
                m.rows.map((row) => {
                  const key = m.rowKey(row);
                  const expanded = m.expandedKey === key;

                  return (
                    <React.Fragment key={key}>
                      <tr className="text-slate-800">
                        <td className="px-3 py-2">
                          {formatInventoryAdjustmentType(row.adjustment_type)}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {row.action_summary}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{row.object_no}</td>
                        <td className="px-3 py-2">
                          {m.warehouseNameById[row.warehouse_id] ?? `仓库 ${row.warehouse_id}`}
                        </td>
                        <td className="px-3 py-2">
                          {formatInventoryAdjustmentStatus(row.status)}
                        </td>
                        <td className="px-3 py-2">
                          {formatInventoryAdjustmentSourceType(row.source_type)}
                        </td>
                        <td className="px-3 py-2">{row.source_ref || "-"}</td>
                        <td className="px-3 py-2">{formatDateTime(row.occurred_at)}</td>
                        <td className="px-3 py-2">{formatDateTime(row.committed_at)}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.line_count}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatQty(row.delta_total)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                            onClick={() => {
                              void m.toggleExpand(row);
                            }}
                          >
                            {expanded ? "收起" : "查看"}
                          </button>
                        </td>
                      </tr>

                      {expanded ? (
                        <tr>
                          <td colSpan={12} className="bg-white px-3 py-3">
                            <DetailShell
                              loading={Boolean(m.detailLoadingByRowKey[key])}
                              error={m.detailErrorByRowKey[key] ?? ""}
                              detail={m.detailByRowKey[key] ?? null}
                            />
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default InventoryAdjustmentSummaryPage;
