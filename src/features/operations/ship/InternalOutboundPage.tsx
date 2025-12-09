// src/features/operations/ship/InternalOutboundPage.tsx
//
// 内部出库 Cockpit（样品 / 内部领用 / 报废等非订单出库）
//
// 功能：
//  1) 填写单据头（仓库 / 类型 / 领取人 / 备注）→ 创建内部出库单
//  2) 通过 Item ID 或「选择商品」添加/累加行（item_id + qty + 批次 + 单位 + 行备注）
//  3) 显示简单可用库存提示（从 /inventory/snapshot 查询）
//  4) 一键确认 → 调 /internal-outbound/docs/{id}/confirm 扣库存
//
// 说明：
//  - 这里不接扫码链路，只提供最小可用 Cockpit；
//  - 批次留空时，后端按 FEFO 扣减；填了批次则按指定批次扣。

import React, { useState } from "react";
import { apiPost, apiGet } from "@/lib/api";
import PageTitle from "@/components/ui/PageTitle";
import { ItemSelectorDialog } from "@/features/common/ItemSelectorDialog";
import type { Item } from "@/features/admin/items/api";

type InternalOutboundLine = {
  id: number;
  doc_id: number;
  line_no: number;
  item_id: number;
  batch_code: string | null;
  requested_qty: number;
  confirmed_qty: number | null;
  uom: string | null;
  note: string | null;
  extra_meta: any | null;
};

type InternalOutboundDoc = {
  id: number;
  warehouse_id: number;
  doc_no: string;
  doc_type: string;
  status: string;
  recipient_name: string | null;
  recipient_type: string | null;
  recipient_note: string | null;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
  trace_id: string | null;
  lines: InternalOutboundLine[];
};

const DOC_TYPES = [
  { value: "SAMPLE_OUT", label: "样品出库" },
  { value: "INTERNAL_USE", label: "内部领用" },
  { value: "SCRAP", label: "报废/损毁" },
];

type StockHint = {
  loading: boolean;
  qty: number | null;
  batches: number | null;
};

export const InternalOutboundPage: React.FC = () => {
  // 单据头表单
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [docType, setDocType] = useState<string>("SAMPLE_OUT");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientType, setRecipientType] = useState<string>("EMPLOYEE");
  const [recipientNote, setRecipientNote] = useState<string>("");
  const [docNote, setDocNote] = useState<string>("");

  // 行表单
  const [itemIdInput, setItemIdInput] = useState<string>("");
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [qtyInput, setQtyInput] = useState<string>("1");
  const [batchCodeInput, setBatchCodeInput] = useState<string>("");
  const [uomInput, setUomInput] = useState<string>("PCS");
  const [lineNoteInput, setLineNoteInput] = useState<string>("");

  // 当前单据
  const [doc, setDoc] = useState<InternalOutboundDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SKU 选择器
  const [itemSelectorOpen, setItemSelectorOpen] =
    useState<boolean>(false);

  // 简单库存提示
  const [stockHint, setStockHint] = useState<StockHint>({
    loading: false,
    qty: null,
    batches: null,
  });

  async function createDoc() {
    setError(null);
    if (!recipientName.trim()) {
      setError("请填写领取人姓名");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        warehouse_id: warehouseId,
        doc_type: docType,
        recipient_name: recipientName.trim(),
        recipient_type: recipientType || null,
        recipient_note: recipientNote || null,
        note: docNote || null,
      };
      const data = await apiPost<InternalOutboundDoc>(
        "/internal-outbound/docs",
        payload,
      );
      setDoc(data);
    } catch (e: any) {
      setError(e?.body?.detail || e?.message || "创建内部出库单失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadStockHint(
    warehouseIdVal: number,
    itemIdVal: number,
  ) {
    if (!warehouseIdVal || !itemIdVal) {
      setStockHint({ loading: false, qty: null, batches: null });
      return;
    }

    setStockHint((prev) => ({ ...prev, loading: true }));
    try {
      const res = await apiGet<any>(
        "/inventory/snapshot",
        {
          warehouse_id: warehouseIdVal,
          item_id: itemIdVal,
          limit: 50,
        },
      );

      let qty: number | null = null;
      let batches: number | null = null;

      if (Array.isArray(res) && res.length > 0) {
        batches = res.length;
        const first = res[0] as Record<string, any>;
        qty =
          first.available_qty ??
          first.qty ??
          first.onhand_qty ??
          null;
      }

      setStockHint({
        loading: false,
        qty,
        batches,
      });
    } catch (_e) {
      setStockHint({ loading: false, qty: null, batches: null });
      // 不把错误抛到 UI，避免打断出库流程
    }
  }

  async function addLine() {
    if (!doc) {
      setError("请先创建内部出库单");
      return;
    }
    setError(null);

    const itemId = Number(itemIdInput);
    const qty = Number(qtyInput);
    if (!itemId || !Number.isFinite(itemId)) {
      setError("请填写有效的 item_id（整数）或通过选择商品填充");
      return;
    }
    if (!qty || !Number.isFinite(qty)) {
      setError("请填写有效的数量");
      return;
    }

    setLoading(true);
    try {
      const updated = await apiPost<InternalOutboundDoc>(
        `/internal-outbound/docs/${doc.id}/lines`,
        {
          item_id: itemId,
          qty,
          batch_code: batchCodeInput || null,
          uom: uomInput || null,
          note: lineNoteInput || null,
        },
      );
      setDoc(updated);

      // 重置数量和备注，保留 item 与单位，方便连续录入
      setQtyInput("1");
      setLineNoteInput("");
    } catch (e: any) {
      setError(e?.body?.detail || e?.message || "添加行失败");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDoc() {
    if (!doc) {
      setError("请先创建内部出库单并添加行");
      return;
    }
    setError(null);

    setLoading(true);
    try {
      const res = await apiPost<InternalOutboundDoc>(
        `/internal-outbound/docs/${doc.id}/confirm`,
        { trace_id: null },
      );
      setDoc(res);
    } catch (e: any) {
      setError(e?.body?.detail || e?.message || "确认内部出库失败");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading;

  // 选择器回调
  const handleSelectItem = (item: Item) => {
    setItemIdInput(String(item.id));
    setSelectedItemName(item.name ?? item.sku ?? String(item.id));
    void loadStockHint(warehouseId, item.id);
  };

  const handleItemIdBlur: React.FocusEventHandler<HTMLInputElement> = (
    e,
  ) => {
    const val = Number(e.target.value);
    if (!Number.isFinite(val) || val <= 0) {
      setStockHint({ loading: false, qty: null, batches: null });
      return;
    }
    void loadStockHint(warehouseId, val);
  };

  return (
    <div className="space-y-4">
      <PageTitle title="内部出库 Cockpit" />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 单据头 */}
      <section className="rounded-xl border bg白 p-4 space-y-3">
        <h2 className="text-base font-semibold">单据头</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">仓库 ID</label>
            <input
              type="number"
              className="rounded-lg border px-3 py-2"
              value={warehouseId}
              onChange={(e) => {
                const v = Number(e.target.value) || 1;
                setWarehouseId(v);
                // 仓库变化时，更新库存提示
                const itemVal = Number(itemIdInput);
                if (itemVal) {
                  void loadStockHint(v, itemVal);
                }
              }}
              disabled={!!doc || disabled}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">出库类型</label>
            <select
              className="rounded-lg border px-3 py-2"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              disabled={!!doc || disabled}
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">领取人姓名 *</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              disabled={!!doc || disabled}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">领取人类型</label>
            <select
              className="rounded-lg border px-3 py-2"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              disabled={!!doc || disabled}
            >
              <option value="EMPLOYEE">员工</option>
              <option value="CUSTOMER">客户</option>
              <option value="OTHER">其他</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">领取人备注 / 部门</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={recipientNote}
              onChange={(e) => setRecipientNote(e.target.value)}
              disabled={!!doc || disabled}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-1">
            <label className="text-xs text-slate-600">单据备注</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={docNote}
              onChange={(e) => setDocNote(e.target.value)}
              disabled={!!doc || disabled}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-sm">
          <div className="space-x-3">
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
              onClick={createDoc}
              disabled={!!doc || disabled}
            >
              {doc ? "单据已创建" : "创建内部出库单"}
            </button>
          </div>
          {doc && (
            <div className="text-xs text-slate-600">
              <div>单号：{doc.doc_no}</div>
              <div>状态：{doc.status}</div>
              <div>trace_id：{doc.trace_id || "-"}</div>
            </div>
          )}
        </div>
      </section>

      {/* 行编辑 & 列表 */}
      {doc && (
        <section className="rounded-xl border bg-white p-4 space-y-3 text-sm">
          <h2 className="text-base font-semibold">明细行</h2>

          {/* 行表单 + SKU选择 + 库存提示 */}
          <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Item ID</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={itemIdInput}
                  onChange={(e) => setItemIdInput(e.target.value)}
                  onBlur={handleItemIdBlur}
                  disabled={disabled}
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-slate-600">
                  已选商品名称
                </label>
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 text-xs text-slate-700"
                    value={selectedItemName}
                    readOnly
                    placeholder="尚未选择商品"
                  />
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                    onClick={() => setItemSelectorOpen(true)}
                    disabled={disabled}
                  >
                    选择商品
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">数量</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={qtyInput}
                  onChange={(e) => setQtyInput(e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">
                  批次（空=FEFO）
                </label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={batchCodeInput}
                  onChange={(e) => setBatchCodeInput(e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">单位</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={uomInput}
                  onChange={(e) => setUomInput(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">行备注</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={lineNoteInput}
                  onChange={(e) => setLineNoteInput(e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">
                  可用库存提示
                </label>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                  {stockHint.loading ? (
                    <span>查询中…</span>
                  ) : stockHint.qty == null ? (
                    <span className="text-slate-400">
                      暂无可用库存信息（请确保选中仓库 + 商品）
                    </span>
                  ) : (
                    <span>
                      估算可用数量：
                      <span className="font-mono text-slate-900">
                        {stockHint.qty}
                      </span>
                      {stockHint.batches != null && (
                        <span className="ml-2 text-slate-500">
                          批次数：{stockHint.batches}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
                onClick={addLine}
                disabled={disabled}
              >
                添加 / 累加行
              </button>
            </div>
          </div>

          {/* 行列表 */}
          <div className="overflow-auto rounded-lg border">
            {!doc.lines || doc.lines.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-500">
                暂无明细，请先添加行。
              </div>
            ) : (
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-2 py-1 text-left">行号</th>
                    <th className="px-2 py-1 text-left">Item ID</th>
                    <th className="px-2 py-1 text-left">批次</th>
                    <th className="px-2 py-1 text-right">数量</th>
                    <th className="px-2 py-1 text-left">单位</th>
                    <th className="px-2 py-1 text-left">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.lines.map((ln) => (
                    <tr key={ln.id} className="border-b hover:bg-slate-50">
                      <td className="px-2 py-1">{ln.line_no}</td>
                      <td className="px-2 py-1">{ln.item_id}</td>
                      <td className="px-2 py-1">
                        {ln.batch_code || (
                          <span className="text-slate-400">[FEFO]</span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {ln.requested_qty}
                      </td>
                      <td className="px-2 py-1">{ln.uom || "-"}</td>
                      <td className="px-2 py-1">{ln.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 确认按钮 */}
          <div className="flex justify-end pt-3">
            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
              onClick={confirmDoc}
              disabled={disabled || doc.status !== "DRAFT"}
            >
              确认出库
            </button>
          </div>
        </section>
      )}

      {/* SKU 选择对话框 */}
      <ItemSelectorDialog
        open={itemSelectorOpen}
        onClose={() => setItemSelectorOpen(false)}
        onSelect={handleSelectItem}
      />
    </div>
  );
};

export default InternalOutboundPage;
