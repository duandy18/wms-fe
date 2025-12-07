// src/features/receive-tasks/ReceiveTaskDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import {
  StandardTable,
  type ColumnDef,
} from "../../components/wmsdu/StandardTable";
import {
  fetchReceiveTask,
  recordReceiveScan,
  commitReceiveTask,
  type ReceiveTask,
  type ReceiveTaskLine,
} from "./api";

const formatTs = (ts: string | null | undefined) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

const ReceiveTaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const idNum = taskId ? Number(taskId) : NaN;
  const isIdValid = taskId && Number.isFinite(idNum);

  const [task, setTask] = useState<ReceiveTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updatingLineId, setUpdatingLineId] = useState<number | null>(
    null,
  );
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  async function loadTask() {
    if (!isIdValid) {
      setError("无效的收货任务 ID。");
      setTask(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReceiveTask(idNum);
      setTask(data);
    } catch (err: any) {
      console.error("fetchReceiveTask failed", err);
      setError(err?.message ?? "加载收货任务失败");
      setTask(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const isCommitted = task?.status === "COMMITTED";

  const varianceSummary = useMemo(() => {
    if (!task) return { totalExpected: 0, totalScanned: 0, totalVariance: 0 };
    let totalExpected = 0;
    let totalScanned = 0;
    for (const l of task.lines) {
      totalScanned += l.scanned_qty;
      if (l.expected_qty != null) {
        totalExpected += l.expected_qty;
      }
    }
    return {
      totalExpected,
      totalScanned,
      totalVariance: totalScanned - totalExpected,
    };
  }, [task]);

  // 把 scanned 修改为目标值：调用 scan 接口增量调整
  async function handleChangeScanned(
    line: ReceiveTaskLine,
    nextScanned: number,
  ) {
    if (!task) return;
    if (isCommitted) return;

    const normalized = Math.max(0, Math.floor(nextScanned));
    const delta = normalized - line.scanned_qty;
    if (delta === 0) return;

    setUpdatingLineId(line.id);
    try {
      const updated = await recordReceiveScan(task.id, {
        item_id: line.item_id,
        qty: delta,
        batch_code: line.batch_code ?? undefined,
      });
      setTask(updated);
    } catch (err: any) {
      console.error("recordReceiveScan failed", err);
      setError(err?.message ?? "更新实收数量失败");
    } finally {
      setUpdatingLineId(null);
    }
  }

  async function handleCommit() {
    if (!task) return;
    if (isCommitted) return;
    setCommitting(true);
    setCommitError(null);
    try {
      const updated = await commitReceiveTask(task.id, {});
      setTask(updated);
    } catch (err: any) {
      console.error("commitReceiveTask failed", err);
      setCommitError(err?.message ?? "确认入库失败");
    } finally {
      setCommitting(false);
    }
  }

  if (!isIdValid) {
    return (
      <div className="p-6 space-y-4">
        <PageTitle title="收货任务详情" />
        <button
          type="button"
          className="mb-2 text-xs text-slate-600 hover:text-slate-900"
          onClick={() => navigate("/purchase-orders")}
        >
          ← 返回采购单列表
        </button>
        <div className="text-sm text-red-600">
          无效的收货任务 ID（URL 中的 :taskId 不是数字）。
        </div>
      </div>
    );
  }

  const columns: ColumnDef<ReceiveTaskLine>[] = [
    {
      key: "item_id",
      header: "Item ID",
      render: (l) => (
        <span className="font-mono text-[11px]">{l.item_id}</span>
      ),
    },
    {
      key: "item_name",
      header: "商品名",
      render: (l) => l.item_name ?? "-",
    },
    {
      key: "expected_qty",
      header: "应收数量",
      align: "right",
      render: (l) => l.expected_qty ?? "-",
    },
    {
      key: "scanned_qty",
      header: "实收数量",
      align: "right",
      render: (l) => {
        const disabled = isCommitted || updatingLineId === l.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              disabled={disabled}
              className="px-1 text-xs border rounded disabled:opacity-50"
              onClick={() =>
                handleChangeScanned(l, Math.max(0, l.scanned_qty - 1))
              }
            >
              -
            </button>
            <input
              className="w-16 text-right rounded border border-slate-300 px-1 py-0.5 text-xs"
              type="number"
              value={l.scanned_qty}
              disabled={disabled}
              onChange={(e) =>
                handleChangeScanned(
                  l,
                  Number(e.target.value || "0"),
                )
              }
            />
            <button
              type="button"
              disabled={disabled}
              className="px-1 text-xs border rounded disabled:opacity-50"
              onClick={() => handleChangeScanned(l, l.scanned_qty + 1)}
            >
              +
            </button>
          </div>
        );
      },
    },
    {
      key: "variance",
      header: "差异(实收-应收)",
      align: "right",
      render: (l) => {
        if (l.expected_qty == null) return "-";
        const v = l.scanned_qty - l.expected_qty;
        const cls =
          v === 0
            ? "text-emerald-700"
            : v > 0
            ? "text-amber-700"
            : "text-rose-700";
        return <span className={cls}>{v}</span>;
      },
    },
    {
      key: "status",
      header: "状态",
      render: (l) => l.status,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title={`收货任务 #${taskId}`}
        description="采购单收货 → 收货任务 → 扫码/录入实收 → 确认入库（commit） → 写入台账与库存。"
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

      {task && (
        <>
          {/* 头部信息 */}
          <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">
                基本信息
              </h2>
              <span className="text-xs text-slate-500">
                创建时间：{formatTs(task.created_at)}，状态：
                <span className="font-medium">{task.status}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">
              <div>
                <div className="text-[11px] text-slate-500">
                  收货任务 ID
                </div>
                <div className="font-mono text-[13px]">
                  {task.id}
                  {task.po_id != null && (
                    <span className="ml-2 text-xs text-slate-600">
                      (PO-{task.po_id})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  供应商
                </div>
                <div>
                  {task.supplier_name ??
                    (task.supplier_id != null
                      ? `ID=${task.supplier_id}`
                      : "-")}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  仓库 ID
                </div>
                <div>{task.warehouse_id}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  应收 vs 实收
                </div>
                <div>
                  应收：{varianceSummary.totalExpected}，实收：
                  {varianceSummary.totalScanned}，
                  差异：
                  <span
                    className={
                      varianceSummary.totalVariance === 0
                        ? "text-emerald-700"
                        : varianceSummary.totalVariance > 0
                        ? "text-amber-700"
                        : "text-rose-700"
                    }
                  >
                    {varianceSummary.totalVariance}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 行表 + commit 区 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                行明细（应收 / 实收 / 差异）
              </h2>
              <div className="flex items-center gap-2 text-xs">
                {commitError && (
                  <span className="text-red-600">{commitError}</span>
                )}
                <button
                  type="button"
                  disabled={isCommitted || committing}
                  onClick={handleCommit}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
                >
                  {isCommitted
                    ? "已入库（COMMITTED）"
                    : committing
                    ? "确认入库中…"
                    : "确认入库（commit）"}
                </button>
              </div>
            </div>

            <StandardTable<ReceiveTaskLine>
              columns={columns}
              data={task.lines}
              dense
              getRowKey={(l) => l.id}
              emptyText="暂无行数据"
              footer={
                <span className="text-xs text-slate-500">
                  共 {task.lines.length} 行
                </span>
              }
            />
          </section>
        </>
      )}
    </div>
  );
};

export default ReceiveTaskDetailPage;
