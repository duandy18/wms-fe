import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import {
  formatDateTime,
  formatManualOutboundDocStatus,
  type PublicItemBasicOut,
  type PublicSupplierBasicOut,
} from "../contracts/outbound";
import { useOutboundManualDocsPage } from "../model/useOutboundManualDocsPage";

function warehouseLabel(item: { id: number; name: string; code?: string | null }) {
  const code =
    typeof item.code === "string" && item.code.trim() ? item.code.trim() : "";
  return code ? `${item.name}（${code}）` : item.name;
}

function supplierLabel(item: PublicSupplierBasicOut) {
  const code =
    typeof item.code === "string" && item.code.trim() ? item.code.trim() : "";
  return code ? `${item.name}（${code}）` : item.name;
}

function itemLabel(item: PublicItemBasicOut) {
  return item.name;
}

function itemSkuText(item: PublicItemBasicOut | null) {
  if (!item?.sku || !item.sku.trim()) return "-";
  return item.sku.trim();
}

function itemSpecText(item: PublicItemBasicOut | null) {
  if (!item?.spec || !item.spec.trim()) return "-";
  return item.spec.trim();
}

const readonlyFieldClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700";

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

        {m.suppliersError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.suppliersError}
          </div>
        ) : null}

        {m.itemsError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.itemsError}
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
            <div className="mb-1 text-xs text-slate-500">收件人</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.recipientName}
              onChange={(e) => m.setRecipientName(e.target.value)}
              disabled={m.creating}
              placeholder="请输入收件人"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">收件电话</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.receiverPhone}
              onChange={(e) => m.setReceiverPhone(e.target.value)}
              disabled={m.creating}
              placeholder="请输入收件电话"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">省</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.receiverProvince}
              onChange={(e) => m.setReceiverProvince(e.target.value)}
              disabled={m.creating}
              placeholder="例如：浙江省"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">市</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.receiverCity}
              onChange={(e) => m.setReceiverCity(e.target.value)}
              disabled={m.creating}
              placeholder="例如：杭州市"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">区/县</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.receiverDistrict}
              onChange={(e) => m.setReceiverDistrict(e.target.value)}
              disabled={m.creating}
              placeholder="可选"
            />
          </div>

          <div className="xl:col-span-2">
            <div className="mb-1 text-xs text-slate-500">详细地址</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.receiverAddress}
              onChange={(e) => m.setReceiverAddress(e.target.value)}
              disabled={m.creating}
              placeholder="请输入详细地址"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">邮编</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.receiverPostcode}
              onChange={(e) => m.setReceiverPostcode(e.target.value)}
              disabled={m.creating}
              placeholder="可选"
            />
          </div>

          <div className="xl:col-span-3">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-slate-500">供货商筛选</div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.supplierId}
              onChange={(e) => m.setSupplierId(e.target.value)}
              disabled={m.creating || m.suppliersLoading}
            >
              <option value="">
                {m.suppliersLoading ? "供应商加载中…" : "全部供应商"}
              </option>
              {m.suppliers.map((supplier) => (
                <option key={supplier.id} value={String(supplier.id)}>
                  {supplierLabel(supplier)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500">商品搜索</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={m.itemQuery}
              onChange={(e) => m.setItemQuery(e.target.value)}
              disabled={m.creating}
              placeholder="按商品名 / SKU / 规格搜索"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-wide text-slate-500">
            单据行
          </div>

          <div className="space-y-3">
            {m.lineDrafts.map((line, index) => {
              const selectedItem = m.getItemOptionById(line.itemId);
              const uoms = m.getUomOptionsByItemId(line.itemId);

              return (
                <div
                  key={`line-${index}`}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto]"
                >
                  <div>
                    <div className="mb-1 text-xs text-slate-500">商品</div>
                    <select
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={line.itemId}
                      onChange={(e) => {
                        void m.selectLineItem(index, e.target.value);
                      }}
                      disabled={m.creating || m.itemsLoading}
                    >
                      <option value="">
                        {m.itemsLoading ? "商品加载中…" : "请选择商品"}
                      </option>
                      {m.items.map((item) => (
                        <option key={item.id} value={String(item.id)}>
                          {itemLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-slate-500">SKU</div>
                    <div className={readonlyFieldClassName}>
                      {itemSkuText(selectedItem)}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-slate-500">规格</div>
                    <div className={readonlyFieldClassName}>
                      {itemSpecText(selectedItem)}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-slate-500">包装单位</div>
                    <select
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={line.itemUomId}
                      onChange={(e) => {
                        m.updateLineDraft(index, { itemUomId: e.target.value });
                      }}
                      disabled={m.creating || !line.itemId}
                    >
                      <option value="">
                        {line.itemId ? "请选择包装单位" : "先选择商品"}
                      </option>
                      {uoms.map((uom) => (
                        <option key={uom.id} value={String(uom.id)}>
                          {uom.display_name || uom.uom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-slate-500">数量</div>
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
              );
            })}
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
                <th className="px-3 py-2 text-left">仓库</th>
                <th className="px-3 py-2 text-left">收件人 / 电话</th>
                <th className="px-3 py-2 text-left">收件地址</th>
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
                    <td className="px-3 py-2">仓库 {row.warehouse_id}</td>
                    <td className="px-3 py-2">
                      <div>{row.recipient_name || "-"}</div>
                      <div className="font-mono text-xs text-slate-500">
                        {row.receiver_phone || "-"}
                      </div>
                    </td>
                    <td className="min-w-[320px] max-w-[520px] break-words px-3 py-2 text-xs">
                      {[row.receiver_province, row.receiver_city, row.receiver_district, row.receiver_address]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </td>
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
                <div className="text-xs text-slate-500">创建时间</div>
                <div className="text-sm text-slate-900">
                  {formatDateTime(m.detail.created_at)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">收件人</div>
                <div className="text-sm text-slate-900">
                  {m.detail.recipient_name || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">收件电话</div>
                <div className="font-mono text-sm text-slate-900">
                  {m.detail.receiver_phone || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">省 / 市 / 区</div>
                <div className="text-sm text-slate-900">
                  {[m.detail.receiver_province, m.detail.receiver_city, m.detail.receiver_district]
                    .filter(Boolean)
                    .join(" / ") || "-"}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-slate-500">详细地址</div>
                <div className="text-sm text-slate-900">
                  {m.detail.receiver_address || "-"}
                  {m.detail.receiver_postcode ? `（${m.detail.receiver_postcode}）` : ""}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left">line_no</th>
                    <th className="px-3 py-2 text-left">商品</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-left">规格</th>
                    <th className="px-3 py-2 text-left">包装单位</th>
                    <th className="px-3 py-2 text-right">数量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {m.detail.lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-8 text-center text-slate-500"
                      >
                        当前单据暂无行
                      </td>
                    </tr>
                  ) : (
                    m.detail.lines.map((line) => (
                      <tr key={line.id} className="text-slate-800">
                        <td className="px-3 py-2 font-mono">{line.line_no}</td>
                        <td className="px-3 py-2">
                          {line.item_name_snapshot || `item_id: ${line.item_id}`}
                        </td>
                        <td className="px-3 py-2">
                          {line.item_sku_snapshot || "-"}
                        </td>
                        <td className="px-3 py-2">
                          {line.item_spec_snapshot || "-"}
                        </td>
                        <td className="px-3 py-2">
                          {line.uom_name_snapshot || `uom_id: ${line.item_uom_id}`}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {line.requested_qty}
                        </td>
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
