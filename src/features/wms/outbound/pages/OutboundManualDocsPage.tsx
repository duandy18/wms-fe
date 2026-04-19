import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import {
  formatDateTime,
  formatManualOutboundDocStatus,
} from "../contracts/outbound";
import { useOutboundManualDocsPage } from "../model/useOutboundManualDocsPage";

function warehouseLabel(item: { id: number; name: string; code?: string | null }) {
  const code =
    typeof item.code === "string" && item.code.trim() ? item.code.trim() : "";
  return code ? `${item.name}（${code}）` : item.name;
}

const OutboundManualDocsPage: React.FC = () => {
  const navigate = useNavigate();
  const m = useOutboundManualDocsPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="手动出库单据"
        description="手动出库来源层页面：本页只负责建单、查看、发布、作废，不在此页执行出库提交。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">
          新建手动出库单据
        </div>

        {m.createError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.createError}
          </div>
        ) : null}

        {m.createSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {m.createSuccess}
          </div>
        ) : null}

        {m.warehousesError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.warehousesError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <div className="mb-1 text-xs text-slate-500">仓库</div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.warehouseId}
              onChange={(e) => m.setWarehouseId(e.target.value)}
              disabled={m.creating || m.warehousesLoading}
            >
              <option value="">
                {m.warehousesLoading ? "仓库加载中…" : "请选择仓库"}
              </option>
              {m.warehouses.map((warehouse) => (
                <option key={warehouse.id} value={String(warehouse.id)}>
                  {warehouseLabel(warehouse)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">单据类型</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.docType}
              onChange={(e) => m.setDocType(e.target.value)}
              disabled={m.creating}
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">领用/收件人</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.recipientName}
              onChange={(e) => m.setRecipientName(e.target.value)}
              disabled={m.creating}
              placeholder="请输入领用/收件人"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">领用类型</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.recipientType}
              onChange={(e) => m.setRecipientType(e.target.value)}
              disabled={m.creating}
              placeholder="可选"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">领用备注</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.recipientNote}
              onChange={(e) => m.setRecipientNote(e.target.value)}
              disabled={m.creating}
              placeholder="可选"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">单据备注</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.remark}
              onChange={(e) => m.setRemark(e.target.value)}
              disabled={m.creating}
              placeholder="可选"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-wide text-slate-500">
            单据行
          </div>

          <div className="space-y-3">
            {m.lineDrafts.map((line, index) => (
              <div
                key={`line-${index}`}
                className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_2fr_auto]"
              >
                <div>
                  <div className="mb-1 text-xs text-slate-500">item_id</div>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={line.itemId}
                    onChange={(e) => {
                      m.updateLineDraft(index, { itemId: e.target.value });
                    }}
                    disabled={m.creating}
                    placeholder="请输入商品 ID"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs text-slate-500">requested_qty</div>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={line.requestedQty}
                    onChange={(e) => {
                      m.updateLineDraft(index, { requestedQty: e.target.value });
                    }}
                    disabled={m.creating}
                    placeholder="请输入数量"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs text-slate-500">行备注</div>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={line.remark}
                    onChange={(e) => {
                      m.updateLineDraft(index, { remark: e.target.value });
                    }}
                    disabled={m.creating}
                    placeholder="可选"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-100 disabled:opacity-60"
                    onClick={() => m.removeLineDraft(index)}
                    disabled={m.creating || m.lineDrafts.length <= 1}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-60"
              onClick={m.addLineDraft}
              disabled={m.creating}
            >
              增加一行
            </button>
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={() => {
                void m.createDoc();
              }}
              disabled={m.creating}
            >
              {m.creating ? "建单中…" : "创建手动出库单据"}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-900">
            手动出库单据列表
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
            onClick={m.reload}
            disabled={m.loading}
          >
            {m.loading ? "刷新中…" : "刷新"}
          </button>
        </div>

        {m.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">单据号</th>
                <th className="px-3 py-2 text-left">类型</th>
                <th className="px-3 py-2 text-left">仓库</th>
                <th className="px-3 py-2 text-left">领用/收件人</th>
                <th className="px-3 py-2 text-left">状态</th>
                <th className="px-3 py-2 text-left">创建时间</th>
                <th className="px-3 py-2 text-right">行数</th>
                <th className="px-3 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {m.loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                    正在加载手动出库单据…
                  </td>
                </tr>
              ) : m.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                    暂无手动出库单据
                  </td>
                </tr>
              ) : (
                m.rows.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      m.selectedDocId === row.id ? "bg-slate-50 text-slate-800" : "text-slate-800"
                    }
                  >
                    <td className="px-3 py-2 font-mono">{row.doc_no}</td>
                    <td className="px-3 py-2">{row.doc_type}</td>
                    <td className="px-3 py-2">仓库 {row.warehouse_id}</td>
                    <td className="px-3 py-2">{row.recipient_name || "-"}</td>
                    <td className="px-3 py-2">
                      {formatManualOutboundDocStatus(row.status)}
                    </td>
                    <td className="px-3 py-2">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {row.lines.length}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                          onClick={() => {
                            void m.selectDoc(row.id);
                          }}
                        >
                          查看
                        </button>
                        {row.status === "RELEASED" ? (
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                            onClick={() => {
                              navigate(`/outbound/manual?docId=${row.id}`);
                            }}
                          >
                            去执行
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {m.detailError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.detailError}
          </div>
        ) : null}

        {m.detailLoading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            正在加载单据详情…
          </div>
        ) : null}

        {m.detail ? (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  当前单据：{m.detail.doc_no}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  本页只负责来源层单据管理，不做执行提交。
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-white disabled:opacity-60"
                  disabled={m.detail.status !== "DRAFT"}
                  onClick={() => {
                    void m.releaseDoc(m.detail!.id);
                  }}
                >
                  发布单据
                </button>
                <button
                  type="button"
                  className="rounded-md border border-rose-300 px-3 py-2 text-xs text-rose-700 hover:bg-white disabled:opacity-60"
                  disabled={m.detail.status === "VOIDED"}
                  onClick={() => {
                    void m.voidDoc(m.detail!.id);
                  }}
                >
                  作废单据
                </button>
                {m.detail.status === "RELEASED" ? (
                  <button
                    type="button"
                    className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800"
                    onClick={() => {
                      navigate(`/outbound/manual?docId=${m.detail!.id}`);
                    }}
                  >
                    前往执行
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <div className="text-xs text-slate-500">单据号</div>
                <div className="text-sm text-slate-900">{m.detail.doc_no}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">状态</div>
                <div className="text-sm text-slate-900">
                  {formatManualOutboundDocStatus(m.detail.status)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">仓库</div>
                <div className="text-sm text-slate-900">
                  仓库 {m.detail.warehouse_id}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">领用/收件人</div>
                <div className="text-sm text-slate-900">
                  {m.detail.recipient_name || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">创建时间</div>
                <div className="text-sm text-slate-900">
                  {formatDateTime(m.detail.created_at)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left">line_no</th>
                    <th className="px-3 py-2 text-left">item_id</th>
                    <th className="px-3 py-2 text-right">requested_qty</th>
                    <th className="px-3 py-2 text-left">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {m.detail.lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-8 text-center text-slate-500"
                      >
                        当前单据暂无行
                      </td>
                    </tr>
                  ) : (
                    m.detail.lines.map((line) => (
                      <tr key={line.id} className="text-slate-800">
                        <td className="px-3 py-2 font-mono">{line.line_no}</td>
                        <td className="px-3 py-2 font-mono">{line.item_id}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {line.requested_qty}
                        </td>
                        <td className="px-3 py-2">{line.remark || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default OutboundManualDocsPage;
