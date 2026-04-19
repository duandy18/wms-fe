import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import {
  createInboundReceiptFromReturnOrder,
  fetchInboundReceiptDetail,
  fetchInboundReceiptProgress,
  fetchInboundReceiptReturnSource,
  releaseInboundReceipt,
  type InboundReceiptCreateFromReturnOrderLineIn,
} from "../api/inboundReceiptsApi";
import {
  formatInboundStatus,
  type InboundReceiptProgressOut,
  type InboundReceiptReadOut,
  type InboundReceiptReturnSourceOut,
} from "../contracts/inboundReceipt";

type QtyMap = Record<number, string>;
type SelectedMap = Record<number, boolean>;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function formatQty(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(4).replace(/\.?0+$/, "");
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

const InboundReceiptsReturnsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orderKey, setOrderKey] = useState(
    (searchParams.get("order_key") ?? "").trim(),
  );
  const [remark, setRemark] = useState("");

  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [source, setSource] = useState<InboundReceiptReturnSourceOut | null>(null);

  const [selectedByLineId, setSelectedByLineId] = useState<SelectedMap>({});
  const [qtyByLineId, setQtyByLineId] = useState<QtyMap>({});

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [receiptLoading, setReceiptLoading] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<InboundReceiptReadOut | null>(
    null,
  );
  const [currentProgress, setCurrentProgress] =
    useState<InboundReceiptProgressOut | null>(null);

  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseError, setReleaseError] = useState("");
  const [releaseSuccess, setReleaseSuccess] = useState("");

  const lastAutoLoadedKeyRef = useRef("");

  const progressByLineNo = useMemo(() => {
    const map = new Map<number, { received_qty: string; remaining_qty: string }>();
    for (const row of currentProgress?.lines ?? []) {
      map.set(row.line_no, {
        received_qty: row.received_qty,
        remaining_qty: row.remaining_qty,
      });
    }
    return map;
  }, [currentProgress]);

  const loadCurrentReceipt = useCallback(async (receiptId: number) => {
    setReceiptLoading(true);
    try {
      const [detail, progress] = await Promise.all([
        fetchInboundReceiptDetail(receiptId),
        fetchInboundReceiptProgress(receiptId),
      ]);
      setCurrentReceipt(detail);
      setCurrentProgress(progress);
    } finally {
      setReceiptLoading(false);
    }
  }, []);

  const handlePreviewSource = useCallback(
    async (orderKeyInput?: string) => {
      const key = (orderKeyInput ?? orderKey).trim();
      if (!key) {
        setSourceError("请先输入原订单号。");
        setSource(null);
        setCurrentReceipt(null);
        setCurrentProgress(null);
        return;
      }

      setSourceLoading(true);
      setSourceError("");
      setCreateError("");
      setCreateSuccess("");
      setReleaseError("");
      setReleaseSuccess("");
      setCurrentReceipt(null);
      setCurrentProgress(null);

      try {
        setSearchParams({ order_key: key });
        const data = await fetchInboundReceiptReturnSource(key);

        setOrderKey(key);
        setSource(data);

        const nextSelected: SelectedMap = {};
        const nextQty: QtyMap = {};
        for (const line of data.lines) {
          nextSelected[line.order_line_id] = Number(line.suggested_planned_qty) > 0;
          nextQty[line.order_line_id] = formatQty(line.suggested_planned_qty);
        }
        setSelectedByLineId(nextSelected);
        setQtyByLineId(nextQty);

        if (data.existing_receipt_id != null) {
          await loadCurrentReceipt(data.existing_receipt_id);
        }
      } catch (err) {
        setSource(null);
        setSourceError(getErrorMessage(err, "查询原订单失败"));
      } finally {
        setSourceLoading(false);
      }
    },
    [loadCurrentReceipt, orderKey, setSearchParams],
  );

  useEffect(() => {
    const key = (searchParams.get("order_key") ?? "").trim();
    if (!key) return;
    if (key === lastAutoLoadedKeyRef.current) return;
    lastAutoLoadedKeyRef.current = key;
    setOrderKey(key);
    void handlePreviewSource(key);
  }, [handlePreviewSource, searchParams]);

  async function handleCreateReceipt() {
    if (!source) {
      setCreateError("请先查询原订单。");
      return;
    }

    if (source.existing_receipt_id != null) {
      setCreateError(
        `该订单已存在退货入库单：${source.existing_receipt_no || source.existing_receipt_id}`,
      );
      if (!currentReceipt) {
        await loadCurrentReceipt(source.existing_receipt_id);
      }
      return;
    }

    setCreateError("");
    setCreateSuccess("");
    setReleaseError("");
    setReleaseSuccess("");

    const lines: InboundReceiptCreateFromReturnOrderLineIn[] = [];

    for (const line of source.lines) {
      const selected = Boolean(selectedByLineId[line.order_line_id]);
      if (!selected) continue;

      const qtyText = (qtyByLineId[line.order_line_id] ?? "").trim();
      if (!qtyText) {
        setCreateError(`订单行 ${line.order_line_id} 缺少本次生成数量`);
        return;
      }

      const qty = Number(qtyText);
      const remaining = Number(line.qty_remaining_refundable);

      if (!Number.isFinite(qty) || qty <= 0) {
        setCreateError(`订单行 ${line.order_line_id} 的本次生成数量非法`);
        return;
      }

      if (Number.isFinite(remaining) && qty > remaining) {
        setCreateError(
          `订单行 ${line.order_line_id} 的本次生成数量 ${formatQty(qty)} 不能超过剩余可退数量 ${formatQty(
            remaining,
          )}`,
        );
        return;
      }

      lines.push({
        order_line_id: line.order_line_id,
        item_id: line.item_id,
        planned_qty: qtyText,
      });
    }

    if (!lines.length) {
      setCreateError("请至少选择一行并填写大于 0 的本次生成数量。");
      return;
    }

    setCreating(true);
    try {
      const created = await createInboundReceiptFromReturnOrder({
        order_key: source.order_ref,
        remark: remark.trim() || null,
        lines,
      });

      setCreateSuccess(`已生成退货入库单：${created.receipt_no}`);
      setSource((prev) =>
        prev
          ? {
              ...prev,
              existing_receipt_id: created.id,
              existing_receipt_no: created.receipt_no,
              existing_receipt_status: created.status,
            }
          : prev,
      );
      await loadCurrentReceipt(created.id);
    } catch (err) {
      setCreateError(getErrorMessage(err, "生成退货入库单失败"));
    } finally {
      setCreating(false);
    }
  }

  async function handleReleaseReceipt() {
    if (!currentReceipt) {
      setReleaseError("当前没有可发布的退货入库单。");
      return;
    }
    if (currentReceipt.status === "RELEASED") {
      setReleaseSuccess("当前退货入库单已发布。");
      return;
    }

    setReleaseLoading(true);
    setReleaseError("");
    setReleaseSuccess("");
    try {
      const out = await releaseInboundReceipt(currentReceipt.id);
      await loadCurrentReceipt(currentReceipt.id);
      setSource((prev) =>
        prev
          ? {
              ...prev,
              existing_receipt_id: out.receipt_id,
              existing_receipt_no: out.receipt_no,
              existing_receipt_status: out.status,
            }
          : prev,
      );
      setReleaseSuccess(`发布成功：${out.receipt_no}`);
    } catch (err) {
      setReleaseError(getErrorMessage(err, "发布退货入库单失败"));
    } finally {
      setReleaseLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="退货入库单"
        description="输入原订单号，自动解析可退商品与数量，直接生成当前这一张退货入库单。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">退货来源生成区</div>
          <div className="text-xs text-slate-500">
            一张原订单只生成一张退货入库单，不与别的订单合单；商品、单位、数量都由原订单与可退数量带出。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>原订单号</span>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={orderKey}
                onChange={(e) => setOrderKey(e.target.value)}
                placeholder="支持 ORD:PLAT:SHOP:EXT / PLAT:SHOP:EXT / 唯一原订单号"
              />
              <button
                type="button"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                disabled={sourceLoading}
                onClick={() => {
                  void handlePreviewSource();
                }}
              >
                {sourceLoading ? "查询中…" : "查询原订单"}
              </button>
            </div>
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>平台</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={source?.platform || ""}
              readOnly
              placeholder="自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>店铺</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={source?.shop_id || ""}
              readOnly
              placeholder="自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>退货入库仓库</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={source?.warehouse_name_snapshot || ""}
              readOnly
              placeholder="自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>规范订单键</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={source?.order_ref || ""}
              readOnly
              placeholder="自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>来源说明</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={
                source
                  ? `${source.ext_order_no || "-"} · 剩余可退 ${formatQty(source.remaining_qty)}`
                  : ""
              }
              readOnly
              placeholder="自动带出原订单与可退信息"
            />
          </label>
        </div>

        {sourceError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {sourceError}
          </div>
        ) : null}

        {source ? (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-900">原订单商品与数量</div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">生成</th>
                    <th className="px-3 py-2 text-left">商品</th>
                    <th className="px-3 py-2 text-left">规格</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-right">下单数量</th>
                    <th className="px-3 py-2 text-right">已发数量</th>
                    <th className="px-3 py-2 text-right">已退数量</th>
                    <th className="px-3 py-2 text-right">剩余可退数量</th>
                    <th className="px-3 py-2 text-right">本次生成数量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {source.lines.map((line) => (
                    <tr key={line.order_line_id}>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedByLineId[line.order_line_id])}
                          onChange={(e) => {
                            setSelectedByLineId((prev) => ({
                              ...prev,
                              [line.order_line_id]: e.target.checked,
                            }));
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">{line.item_name_snapshot || `商品 ${line.item_id}`}</td>
                      <td className="px-3 py-2">{line.item_spec_snapshot || "-"}</td>
                      <td className="px-3 py-2">{line.uom_name_snapshot || "-"}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatQty(line.qty_ordered)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatQty(line.qty_shipped)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatQty(line.qty_returned)}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatQty(line.qty_remaining_refundable)}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-28 rounded-md border border-slate-300 px-2 py-1 text-right font-mono"
                          value={qtyByLineId[line.order_line_id] ?? ""}
                          onChange={(e) => {
                            setQtyByLineId((prev) => ({
                              ...prev,
                              [line.order_line_id]: e.target.value,
                            }));
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-slate-500">
              终态规则：不允许手工补商品，不允许跨订单合单；本次生成数量不能超过剩余可退数量。
            </div>
          </div>
        ) : null}

        <label className="block space-y-1 text-xs text-slate-600">
          <span>整单备注</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="整单备注（可选）"
          />
        </label>

        {createError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {createError}
          </div>
        ) : null}

        {createSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {createSuccess}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
            disabled={creating || !source}
            onClick={() => {
              void handleCreateReceipt();
            }}
          >
            {creating ? "生成中…" : "生成退货入库单"}
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">当前退货入库单</div>
          <div className="text-xs text-slate-500">
            这里只展示当前这一张真实退货入库单；生成后可发布，发布后直接进入收货。
          </div>
        </div>

        {receiptLoading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            正在加载当前退货入库单…
          </div>
        ) : null}

        {!receiptLoading && !currentReceipt ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            当前还没有可展示的退货入库单。先在上方输入订单号，查询后生成。
          </div>
        ) : null}

        {currentReceipt ? (
          <>
            <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-xs text-slate-500">来源类型</div>
                <div className="text-sm text-slate-900">退货</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">退货入库单号</div>
                <div className="text-sm text-slate-900">{currentReceipt.receipt_no}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">原订单号</div>
                <div className="text-sm text-slate-900">
                  {currentReceipt.source_doc_no_snapshot || source?.ext_order_no || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">状态</div>
                <div className="text-sm text-slate-900">{formatInboundStatus(currentReceipt.status)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">仓库</div>
                <div className="text-sm text-slate-900">
                  {currentReceipt.warehouse_name_snapshot || `仓库 ${currentReceipt.warehouse_id}`}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">发布时间</div>
                <div className="text-sm text-slate-900">{formatDateTime(currentReceipt.released_at)}</div>
              </div>
              <div className="xl:col-span-2">
                <div className="text-xs text-slate-500">备注</div>
                <div className="text-sm text-slate-900">{currentReceipt.remark || "-"}</div>
              </div>
            </section>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left">商品</th>
                    <th className="px-3 py-2 text-left">规格</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-right">计划数量</th>
                    <th className="px-3 py-2 text-right">累计已收</th>
                    <th className="px-3 py-2 text-right">剩余待收</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentReceipt.lines.map((line) => {
                    const progress = progressByLineNo.get(line.line_no);
                    return (
                      <tr key={line.id}>
                        <td className="px-3 py-2">{line.item_name_snapshot || `商品 ${line.item_id}`}</td>
                        <td className="px-3 py-2">{line.item_spec_snapshot || "-"}</td>
                        <td className="px-3 py-2">{line.uom_name_snapshot || "-"}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatQty(line.planned_qty)}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatQty(progress?.received_qty)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatQty(progress?.remaining_qty)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {releaseError ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {releaseError}
              </div>
            ) : null}

            {releaseSuccess ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {releaseSuccess}
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                disabled={receiptLoading}
                onClick={() => {
                  void loadCurrentReceipt(currentReceipt.id);
                }}
              >
                刷新当前单据
              </button>
              <button
                type="button"
                className="rounded-md border border-indigo-300 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
                disabled={releaseLoading || currentReceipt.status === "RELEASED"}
                onClick={() => {
                  void handleReleaseReceipt();
                }}
              >
                {releaseLoading
                  ? "发布中…"
                  : currentReceipt.status === "RELEASED"
                    ? "已发布"
                    : "发布退货入库单"}
              </button>
              <button
                type="button"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                disabled={currentReceipt.status !== "RELEASED"}
                onClick={() => navigate(`/receiving/${currentReceipt.receipt_no}`)}
              >
                前往退货收货
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
};

export default InboundReceiptsReturnsPage;
