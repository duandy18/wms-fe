// src/features/purchase-orders/PurchaseOrderDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import {
  fetchPurchaseOrderV2,
  type PurchaseOrderWithLines,
  type PurchaseOrderLine,
} from "./api";

import { PurchaseOrderHeaderCard } from "./PurchaseOrderHeaderCard";
import { PurchaseOrderLinesTable } from "./PurchaseOrderLinesTable";
import { PurchaseOrderLinksCard } from "./PurchaseOrderLinksCard";

import {
  createReceiveTaskFromPo,
  type ReceiveTask,
} from "../receive-tasks/api";
import {
  createReturnTaskFromPo,
  type ReturnTask,
} from "../return-tasks/api";

const PurchaseOrderDetailPage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();

  const [po, setPo] = useState<PurchaseOrderWithLines | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 行表选中状态（纯展示，不再直接收货）
  const [selectedLineId, setSelectedLineId] = useState<number | null>(
    null,
  );

  // 收货任务创建状态
  const [creatingReceiveTask, setCreatingReceiveTask] = useState(false);
  const [createReceiveTaskError, setCreateReceiveTaskError] =
    useState<string | null>(null);

  // 退货任务创建状态
  const [creatingReturnTask, setCreatingReturnTask] = useState(false);
  const [createReturnTaskError, setCreateReturnTaskError] =
    useState<string | null>(null);

  const idNum = poId ? Number(poId) : NaN;
  const isIdValid = poId && Number.isFinite(idNum);

  async function loadPo() {
    if (!poId || !Number.isFinite(idNum)) {
      setError("无效的采购单 ID。");
      setPo(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPurchaseOrderV2(idNum);
      setPo(data);

      if (data.lines && data.lines.length > 0) {
        setSelectedLineId(data.lines[0].id);
      } else {
        setSelectedLineId(null);
      }
    } catch (err: any) {
      console.error("fetchPurchaseOrderV2 failed", err);
      setError(err?.message ?? "加载采购单失败");
      setPo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId]);

  const selectedLine: PurchaseOrderLine | null = useMemo(() => {
    if (!po || !po.lines || selectedLineId == null) return null;
    return po.lines.find((l) => l.id === selectedLineId) ?? null;
  }, [po, selectedLineId]);

  const totalQtyOrdered = useMemo(() => {
    if (!po) return 0;
    return po.lines.reduce((sum, l) => sum + l.qty_ordered, 0);
  }, [po]);

  const totalQtyReceived = useMemo(() => {
    if (!po) return 0;
    return po.lines.reduce((sum, l) => sum + l.qty_received, 0);
  }, [po]);

  async function handleCreateReceiveTask() {
    if (!po || !isIdValid) return;
    setCreatingReceiveTask(true);
    setCreateReceiveTaskError(null);
    try {
      const task: ReceiveTask = await createReceiveTaskFromPo(idNum, {
        warehouse_id: po.warehouse_id,
        include_fully_received: false,
      });
      navigate(`/receive-tasks/${task.id}`);
    } catch (err: any) {
      console.error("createReceiveTaskFromPo failed", err);
      setCreateReceiveTaskError(err?.message ?? "创建收货任务失败");
    } finally {
      setCreatingReceiveTask(false);
    }
  }

  async function handleCreateReturnTask() {
    if (!po || !isIdValid) return;
    setCreatingReturnTask(true);
    setCreateReturnTaskError(null);
    try {
      const task: ReturnTask = await createReturnTaskFromPo(idNum, {
        warehouse_id: po.warehouse_id,
        include_zero_received: false,
      });
      navigate(`/return-tasks/${task.id}`);
    } catch (err: any) {
      console.error("createReturnTaskFromPo failed", err);
      setCreateReturnTaskError(err?.message ?? "创建退货任务失败");
    } finally {
      setCreatingReturnTask(false);
    }
  }

  if (!isIdValid) {
    return (
      <div className="p-6 space-y-4">
        <PageTitle title="采购单详情" />
        <button
          type="button"
          className="mb-2 text-xs text-slate-600 hover:text-slate-900"
          onClick={() => navigate("/purchase-orders")}
        >
          ← 返回采购单列表
        </button>
        <div className="text-sm text-red-600">
          无效的采购单 ID（URL 中的 :poId 不是数字）。
        </div>
      </div>
    );
  }

  const poRef = `PO-${idNum}`;
  const ledgerUrl = `/tools/ledger?ref=${encodeURIComponent(poRef)}`;

  const firstLine = po?.lines[0] ?? null;
  const stockUrl =
    po != null && firstLine
      ? `/tools/stocks?warehouse_id=${po.warehouse_id}&item_id=${firstLine.item_id}`
      : undefined;

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title={`采购单详情 #${poId}`}
        description="多行采购单 → 收货任务 / 退货任务 → 扫码/录入 → commit → 库存 & 台账联动。"
      />

      <button
        type="button"
        className="mb-2 text-xs text-slate-600 hover:text-slate-900"
        onClick={() => navigate("/purchase-orders")}
      >
        ← 返回采购单列表
      </button>

      {loading && (
        <div className="text-sm text-slate-500">加载中…</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {po && (
        <>
          {/* 头部信息 */}
          <PurchaseOrderHeaderCard
            po={po}
            poRef={poRef}
            totalQtyOrdered={totalQtyOrdered}
            totalQtyReceived={totalQtyReceived}
          />

          {/* 行明细表 */}
          <PurchaseOrderLinesTable
            po={po}
            selectedLineId={selectedLineId}
            onSelectLine={setSelectedLineId}
          />

          {/* 收货任务入口 */}
          <section className="bg-white border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-emerald-800">
                收货任务（Receive Task）
              </h2>
              <div className="flex items-center gap-2 text-xs">
                {createReceiveTaskError && (
                  <span className="text-red-600">
                    {createReceiveTaskError}
                  </span>
                )}
                <button
                  type="button"
                  disabled={creatingReceiveTask}
                  onClick={handleCreateReceiveTask}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
                >
                  {creatingReceiveTask ? "创建收货任务中…" : "创建收货任务并进入收货"}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              创建收货任务后，将跳转到“收货任务详情页”，在那边通过扫码或行录入“实收数量”，最后点击
              commit 才真正入库并写入台账与库存。
            </p>
          </section>

          {/* 退货任务入口 */}
          <section className="bg-white border border-rose-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-rose-800">
                采购退货任务（Return Task）
              </h2>
              <div className="flex items-center gap-2 text-xs">
                {createReturnTaskError && (
                  <span className="text-red-600">
                    {createReturnTaskError}
                  </span>
                )}
                <button
                  type="button"
                  disabled={creatingReturnTask}
                  onClick={handleCreateReturnTask}
                  className="inline-flex items-center rounded-md bg-rose-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
                >
                  {creatingReturnTask ? "创建退货任务中…" : "创建退货任务并进入退货"}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              创建退货任务后，将跳转到“退货任务详情页”，在那边通过扫码或行录入“退货数量”，最后点击
              commit 才真正出库并写入台账与库存。
            </p>
          </section>

          {/* 联动视图 */}
          <PurchaseOrderLinksCard
            poRef={poRef}
            ledgerUrl={ledgerUrl}
            stockUrl={stockUrl}
            warehouseId={po.warehouse_id}
            itemId={firstLine?.item_id}
          />
        </>
      )}
    </div>
  );
};

export default PurchaseOrderDetailPage;
