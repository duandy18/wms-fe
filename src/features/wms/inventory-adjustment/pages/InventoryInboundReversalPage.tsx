import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import {
  formatDateTime,
  formatQty,
  formatInboundReversalSourceType,
  INBOUND_REVERSAL_RANGE_OPTIONS,
} from "../contracts/inboundReversal";
import { useInventoryInboundReversalPage } from "../model/useInventoryInboundReversalPage";

const InventoryInboundReversalPage: React.FC = () => {
  const m = useInventoryInboundReversalPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="入库冲回"
        description="第一张卡按时间段与来源类型筛选原入库事件，第二张卡查看事件详情并执行整事件冲回；不做兼容双轨，不做部分行冲回。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">原入库事件选择</div>

        {m.optionsError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.optionsError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_220px_1fr]">
          <label className="space-y-1">
            <div className="text-xs text-slate-500">时间段</div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={String(m.rangeDays)}
              onChange={(e) => m.selectRangeDays(e.target.value)}
              disabled={m.optionsLoading}
            >
              {INBOUND_REVERSAL_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-xs text-slate-500">来源类型</div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.sourceType ?? ""}
              onChange={(e) => m.selectSourceType(e.target.value)}
              disabled={m.optionsLoading}
            >
              <option value="">全部</option>
              <option value="PURCHASE_ORDER">采购入库</option>
              <option value="MANUAL">手动入库</option>
              <option value="RETURN">退货入库</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-xs text-slate-500">原入库事件</div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.selectedEventId != null ? String(m.selectedEventId) : ""}
              onChange={(e) => m.selectEventId(e.target.value)}
              disabled={m.optionsLoading}
            >
              <option value="">
                {m.options.length > 0 ? "请选择原入库事件" : "当前筛选条件下没有候选事件"}
              </option>
              {m.options.map((option) => (
                <option key={option.event_id} value={option.event_id}>
                  {m.optionLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">详情与执行区</div>

        {m.detailError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.detailError}
          </div>
        ) : null}

        {m.submitError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.submitError}
          </div>
        ) : null}

        {m.submitSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {m.submitSuccess}
          </div>
        ) : null}

        {m.detailLoading ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
            详情加载中…
          </div>
        ) : m.detail == null ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
            请先在上卡选择原入库事件。
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-500">原事件单号</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{m.detail.event_no}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-500">仓库 ID</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {m.detail.warehouse_id}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-500">来源类型</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {formatInboundReversalSourceType(m.detail.source_type)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-500">来源引用</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {m.detail.source_ref || "-"}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-500">业务发生时间</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {formatDateTime(m.detail.occurred_at)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-500">提交时间</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {formatDateTime(m.detail.committed_at)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-500">当前状态</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{m.detail.status}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-500">base 数量合计</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {formatQty(m.detail.qty_base_total)}
                </div>
              </div>
            </div>

            {m.detail.remark ? (
              <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <div className="mb-1 text-xs text-slate-500">原事件备注</div>
                <div>{m.detail.remark}</div>
              </div>
            ) : null}

            {!m.detail.reversible ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {m.detail.non_reversible_reason ?? "当前事件不允许冲回。"}
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">行号</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">商品</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">规格</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">单位</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-600">输入数量</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-600">base 数量</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">批次号</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">生产日期</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">到期日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {m.detail.lines.map((line) => (
                    <tr key={`${line.line_no}-${line.item_id}`}>
                      <td className="px-3 py-2 text-slate-700">{line.line_no}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <div className="font-medium text-slate-900">
                          {line.item_name_snapshot || `商品 #${line.item_id}`}
                        </div>
                        <div className="text-xs text-slate-500">ID: {line.item_id}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {line.item_spec_snapshot || "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {line.actual_uom_name_snapshot || `单位 #${line.actual_uom_id}`}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {formatQty(line.actual_qty_input)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {formatQty(line.qty_base)}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{line.lot_code_input || "-"}</td>
                      <td className="px-3 py-2 text-slate-700">{line.production_date || "-"}</td>
                      <td className="px-3 py-2 text-slate-700">{line.expiry_date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_220px_1fr]">
              <label className="space-y-1">
                <div className="text-xs text-slate-500">冲回时间</div>
                <input
                  type="datetime-local"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={m.occurredAt}
                  disabled={m.submitLoading}
                  onChange={(e) => m.setOccurredAt(e.target.value)}
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs text-slate-500">操作人员姓名</div>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={m.operatorName}
                  disabled={m.submitLoading}
                  maxLength={64}
                  placeholder="必填：请输入操作人员姓名"
                  onChange={(e) => m.setOperatorName(e.target.value)}
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs text-slate-500">冲回备注</div>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={m.remark}
                  disabled={m.submitLoading}
                  placeholder="可选：说明本次入库冲回原因"
                  onChange={(e) => m.setRemark(e.target.value)}
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={() => {
                  void m.submitCurrent();
                }}
                disabled={
                  m.submitLoading || !m.detail.reversible || m.operatorName.trim() === ""
                }
              >
                {m.submitLoading ? "冲回中…" : "执行入库冲回"}
              </button>
            </div>

            {m.submitResult ? (
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-900">冲回结果</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <div className="text-xs text-emerald-700">冲回事件单号</div>
                    <div className="text-sm font-medium text-emerald-900">
                      {m.submitResult.event_no}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-700">目标原事件 ID</div>
                    <div className="text-sm font-medium text-emerald-900">
                      {m.submitResult.target_event_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-700">冲回时间</div>
                    <div className="text-sm font-medium text-emerald-900">
                      {formatDateTime(m.submitResult.occurred_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-700">Trace ID</div>
                    <div className="text-sm font-medium text-emerald-900">
                      {m.submitResult.trace_id}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-emerald-200 bg-white">
                  <table className="min-w-full divide-y divide-emerald-100 text-sm">
                    <thead className="bg-emerald-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-emerald-700">行号</th>
                        <th className="px-3 py-2 text-left font-medium text-emerald-700">商品 ID</th>
                        <th className="px-3 py-2 text-left font-medium text-emerald-700">lot_id</th>
                        <th className="px-3 py-2 text-right font-medium text-emerald-700">base 数量</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {m.submitResult.rows.map((row) => (
                        <tr key={`${row.line_no}-${row.item_id}-${row.lot_id}`}>
                          <td className="px-3 py-2 text-slate-700">{row.line_no}</td>
                          <td className="px-3 py-2 text-slate-700">{row.item_id}</td>
                          <td className="px-3 py-2 text-slate-700">{row.lot_id}</td>
                          <td className="px-3 py-2 text-right text-slate-700">
                            {formatQty(row.qty_base)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
};

export default InventoryInboundReversalPage;
