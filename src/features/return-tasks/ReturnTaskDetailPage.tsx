// src/features/return-tasks/ReturnTaskDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import {
  StandardTable,
  type ColumnDef,
} from "../../components/wmsdu/StandardTable";
import {
  fetchReturnTask,
  commitReturnTask,
  type ReturnTask,
  type ReturnTaskLine,
} from "./api";

const formatTs = (ts: string | null | undefined) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

const ReturnTaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const idNum = taskId ? Number(taskId) : NaN;
  const isIdValid = taskId && Number.isFinite(idNum);

  const [task, setTask] = useState<ReturnTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  async function loadTask() {
    if (!isIdValid) {
      setError("无效的退货任务 ID。");
      setTask(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReturnTask(idNum);
      setTask(data);
    } catch (err) {
      console.error("fetchReturnTask failed", err);
      setError(getErrorMessage(err, "加载退货任务失败"));
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
    if (!task) {
      return {
        totalExpected: 0,
        totalPicked: 0,
        totalVariance: 0,
      };
    }
    let totalExpected = 0;
    let totalPicked = 0;
    for (const l of task.lines) {
      totalPicked += l.picked_qty;
      if (l.expected_qty != null) {
        totalExpected += l.expected_qty;
      }
    }
    return {
      totalExpected,
      totalPicked,
      totalVariance: totalPicked - totalExpected,
    };
  }, [task]);

  async function handleCommit() {
    if (!task || isCommitted) return;
    setCommitting(true);
    setCommitError(null);
    try {
      const updated = await commitReturnTask(task.id, {});
      setTask(updated);
    } catch (err) {
      console.error("commitReturnTask failed", err);
      setCommitError(getErrorMessage(err, "确认退货失败"));
    } finally {
      setCommitting(false);
    }
  }

  if (!isIdValid) {
    return (
      <div className="p-6 space-y-4">
        <PageTitle title="退货任务详情" />
        <button
          type="button"
          className="mb-2 text-xs text-slate-600 hover:text-slate-900"
          onClick={() => navigate("/purchase-orders")}
        >
          ← 返回采购单列表
        </button>
        <div className="text-sm text-red-600">
          无效的退货任务 ID（URL 中的 :taskId 不是数字）。
        </div>
      </div>
    );
  }

  const columns: ColumnDef<ReturnTaskLine>[] = [
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
      header: "计划退货数量",
      align: "right",
      render: (l) => l.expected_qty ?? "-",
    },
    {
      key: "picked_qty",
      header: "已拣选数量",
      align: "right",
      render: (l) => l.picked_qty,
    },
    {
      key: "variance",
      header: "差异(拣选-计划)",
      align: "right",
      render: (l) => {
        if (l.expected_qty == null) return "-";
        const v = l.picked_qty - l.expected_qty;
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
      header: "行状态",
      render: (l) => l.status,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title={`退货任务 #${taskId}`}
        description="采购退货 → 退货任务 → 扫码/拣选 → commit 出库 → 台账与库存更新。"
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
          <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">
                基本信息
              </h2>
              <span className="text-xs text-slate-500">
                创建时间：{formatTs(task.created_at)}，状态：
                <span className="font-medium">{task.status}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-3">
              <div>
                <div className="text-[11px] text-slate-500">
                  退货任务 ID
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
                  计划退货 vs 已拣选
                </div>
                <div>
                  计划：{varianceSummary.totalExpected}，已拣：
                  {varianceSummary.totalPicked}，差异：
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

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                行明细（计划退货 / 已拣选 / 差异）
              </h2>
              <div className="flex items-center gap-2 text-xs">
                {commitError && (
                  <span className="text-red-600">{commitError}</span>
                )}
                <button
                  type="button"
                  disabled={isCommitted || committing}
                  onClick={handleCommit}
                  className="inline-flex items-center rounded-md bg-rose-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
                >
                  {isCommitted
                    ? "已退货（COMMITTED）"
                    : committing
                    ? "确认退货中…"
                    : "确认退货（commit）"}
                </button>
              </div>
            </div>

            <StandardTable<ReturnTaskLine>
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

export default ReturnTaskDetailPage;
