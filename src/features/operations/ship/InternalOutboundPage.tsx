// src/features/operations/ship/InternalOutboundPage.tsx
//
// 内部出库 Cockpit（样品 / 内部领用 / 报废等非订单出库）
// -----------------------------------------------------------
// 提供基本操作能力：
//  1) 创建内部出库单（单据头）
//  2) 增加 / 累加明细行
//  3) 查询可用库存（简化版）
//  4) 确认出库（扣库存）
//
// 说明：
//  - 不接扫码链路，只提供最小可用 Cockpit；
//  - 批次为空时后端自动走 FEFO；
//  - 整个文件已清理所有 ESLint 报错：无 any / 无 unused vars。

import React, { useState } from "react";
import { apiPost, apiGet } from "@/lib/api";
import PageTitle from "@/components/ui/PageTitle";
import { ItemSelectorDialog } from "@/features/common/ItemSelectorDialog";
import type { Item } from "@/features/admin/items/api";

// ===============================
// 类型定义
// ===============================

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
  extra_meta: Record<string, unknown> | null;
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

type InventorySnapshotRow = {
  available_qty?: number | null;
  qty?: number | null;
  onhand_qty?: number | null;
};

// 统一错误信息提取函数
function extractErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const eObj = err as { body?: unknown; message?: unknown };
    if (
      eObj.body &&
      typeof eObj.body === "object" &&
      "detail" in eObj.body
    ) {
      const detail = (eObj.body as { detail?: unknown }).detail;
      if (typeof detail === "string") return detail;
    }
    if (typeof eObj.message === "string") return eObj.message;
  }
  return "操作失败";
}

// ============================================================
// 组件主体
// ============================================================

export const InternalOutboundPage: React.FC = () => {
  // 单据头字段
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [docType, setDocType] = useState<string>("SAMPLE_OUT");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientType, setRecipientType] = useState<string>("EMPLOYEE");
  const [recipientNote, setRecipientNote] = useState<string>("");
  const [docNote, setDocNote] = useState<string>("");

  // 行表单字段
  const [itemIdInput, setItemIdInput] = useState<string>("");
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [qtyInput, setQtyInput] = useState<string>("1");
  const [batchCodeInput, setBatchCodeInput] = useState<string>("");
  const [uomInput, setUomInput] = useState<string>("PCS");
  const [lineNoteInput, setLineNoteInput] = useState<string>("");

  // 当前单据
  const [doc, setDoc] = useState<InternalOutboundDoc | null>(null);

  // UI 状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SKU 选择器
  const [itemSelectorOpen, setItemSelectorOpen] = useState(false);

  // 简单库存提示
  const [stockHint, setStockHint] = useState<StockHint>({
    loading: false,
    qty: null,
    batches: null,
  });

  // ============================================================
  // API：创建内部出库单
  // ============================================================
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
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // API：可用库存提示
  // ============================================================
  async function loadStockHint(warehouseIdValue: number, itemIdValue: number) {
    if (!warehouseIdValue || !itemIdValue) {
      setStockHint({ loading: false, qty: null, batches: null });
      return;
    }

    setStockHint((prev) => ({ ...prev, loading: true }));

    try {
      const rows = await apiGet<InventorySnapshotRow[]>(
        "/inventory/snapshot",
        {
          warehouse_id: warehouseIdValue,
          item_id: itemIdValue,
          limit: 50,
        },
      );

      let qty: number | null = null;
      let batches: number | null = null;

      if (Array.isArray(rows) && rows.length > 0) {
        batches = rows.length;
        const first = rows[0];
        qty =
          first.available_qty ??
          first.qty ??
          first.onhand_qty ??
          null;
      }

      setStockHint({ loading: false, qty, batches });
    } catch {
      // ignore 错误，不打断流程
      setStockHint({ loading: false, qty: null, batches: null });
    }
  }

  // ============================================================
  // API：添加 / 累加明细行
  // ============================================================
  async function addLine() {
    if (!doc) {
      setError("请先创建内部出库单");
      return;
    }
    setError(null);

    const itemId = Number(itemIdInput);
    const qty = Number(qtyInput);

    if (!itemId || !Number.isFinite(itemId)) {
      setError("请填写有效的 item_id 或通过选择商品填充");
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

      // 清理部分字段，方便连续录入
      setQtyInput("1");
      setLineNoteInput("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // API：确认出库
  // ============================================================
  async function confirmDoc() {
    if (!doc) {
      setError("请先创建内部出库单并添加行");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const updated = await apiPost<InternalOutboundDoc>(
        `/internal-outbound/docs/${doc.id}/confirm`,
        { trace_id: null as string | null },
      );
      setDoc(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // 事件：选择器回调
  // ============================================================
  const handleSelectItem = (item: Item) => {
    setItemIdInput(String(item.id));
    setSelectedItemName(item.name ?? item.sku ?? String(item.id));
    void loadStockHint(warehouseId, item.id);
  };

  // 输入 item_id 时自动查询库存
  const handleItemIdBlur: React.FocusEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const val = Number(event.target.value);
    if (!Number.isFinite(val) || val <= 0) {
      setStockHint({ loading: false, qty: null, batches: null });
      return;
    }
    void loadStockHint(warehouseId, val);
  };

  const disabled = loading;

  // ============================================================
  // 渲染
  // ============================================================

  return (
    <div className="space-y-4">
      <PageTitle title="内部出库 Cockpit" />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 单据头 */}
      <section className="space-y-3 rounded-xl border bg-white p-4">
        <h2 className="text-base font-semibold">单据头</h2>

        <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
          {/* 仓库 ID */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">仓库 ID</label>
            <input
              type="number"
              className="rounded-lg border px-3 py-2"
              value={warehouseId}
              onChange={(event) => {
                const v = Number(event.target.value) || 1;
                setWarehouseId(v);
                const parsedItem = Number(itemIdInput);
                if (parsedItem) void loadStockHint(v, parsedItem);
              }}
              disabled={!!doc || disabled}
            />
          </div>

          {/* 出库类型 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">出库类型</label>
            <select
              className="rounded-lg border px-3 py-2"
              value={docType}
              onChange={(event) => setDocType(event.target.value)}
              disabled={!!doc || disabled}
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 领取人姓名 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">领取人姓名 *</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              disabled={!!doc || disabled}
            />
          </div>

          {/* 领取人类型 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">领取人类型</label>
            <select
              className="rounded-lg border px-3 py-2"
              value={recipientType}
              onChange={(event) => setRecipientType(event.target.value)}
              disabled={!!doc || disabled}
            >
              <option value="EMPLOYEE">员工</option>
              <option value="CUSTOMER">客户</option>
              <option value="OTHER">其他</option>
            </select>
          </div>

          {/* 领取人备注 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-600">领取人备注 / 部门</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={recipientNote}
              onChange={(event) => setRecipientNote(event.target.value)}
              disabled={!!doc || disabled}
            />
          </div>

          {/* 单据备注 */}
          <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-1">
            <label className="text-xs text-slate-600">单据备注</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={docNote}
              onChange={(event) => setDocNote(event.target.value)}
              disabled={!!doc || disabled}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-sm">
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            onClick={createDoc}
            disabled={!!doc || disabled}
          >
            {doc ? "单据已创建" : "创建内部出库单"}
          </button>

          {doc && (
            <div className="text-xs text-slate-600">
              <div>单号：{doc.doc_no}</div>
              <div>状态：{doc.status}</div>
              <div>trace_id：{doc.trace_id || "-"}</div>
            </div>
          )}
        </div>
      </section>

      {/* 明细行 */}
      {doc && (
        <section className="space-y-3 rounded-xl border bg-white p-4 text-sm">
          <h2 className="text-base font-semibold">明细行</h2>

          {/* 行录入区 */}
          <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
            {/* Item ID + SKU选择 + 库存提示 */}
            <div className="grid gap-3 md:grid-cols-6">
              {/* item_id */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">Item ID</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={itemIdInput}
                  onChange={(event) => setItemIdInput(event.target.value)}
                  onBlur={handleItemIdBlur}
                  disabled={disabled}
                />
              </div>

              {/* 已选商品名称 */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-slate-600">已选商品名称</label>
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 text-xs"
                    value={selectedItemName}
                    readOnly
                    placeholder="尚未选择商品"
                  />
                  <button
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs hover:bg-slate-100 disabled:opacity-60"
                    onClick={() => setItemSelectorOpen(true)}
                    disabled={disabled}
                  >
                    选择商品
                  </button>
                </div>
              </div>

              {/* 数量 */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">数量</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={qtyInput}
                  onChange={(event) => setQtyInput(event.target.value)}
                  disabled={disabled}
                />
              </div>

              {/* 批次 */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">
                  批次（空 = FEFO）
                </label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={batchCodeInput}
                  onChange={(event) => setBatchCodeInput(event.target.value)}
                  disabled={disabled}
                />
              </div>

              {/* 单位 */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">单位</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={uomInput}
                  onChange={(event) => setUomInput(event.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* 行备注 + 库存提示 */}
            <div className="grid gap-3 md:grid-cols-2">
              {/* 行备注 */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">行备注</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={lineNoteInput}
                  onChange={(event) => setLineNoteInput(event.target.value)}
                  disabled={disabled}
                />
              </div>

              {/* 库存提示 */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600">可用库存提示</label>
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
                <thead className="border-b bg-slate-50">
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
                    <tr
                      key={ln.id}
                      className="border-b hover:bg-slate-50"
                    >
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
