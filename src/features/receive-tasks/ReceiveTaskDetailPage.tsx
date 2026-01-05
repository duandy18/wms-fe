// src/features/receive-tasks/ReceiveTaskDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import {
  fetchReceiveTask,
  recordReceiveScan,
  commitReceiveTask,
  type ReceiveTask,
  type ReceiveTaskLine,
} from "./api";
import { getErrorMessage } from "./utils";
import {
  ReceiveTaskInfoCard,
  type ReceiveVarianceSummary,
} from "./components/ReceiveTaskInfoCard";
import { ReceiveTaskLinesTable } from "./components/ReceiveTaskLinesTable";

const ReceiveTaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const idNum = taskId ? Number(taskId) : NaN;
  const isIdValid = taskId && Number.isFinite(idNum);

  const [task, setTask] = useState<ReceiveTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updatingLineId, setUpdatingLineId] = useState<number | null>(null);
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
    } catch (err) {
      console.error("fetchReceiveTask failed", err);
      setError(getErrorMessage(err, "加载收货任务失败"));
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

  const varianceSummary: ReceiveVarianceSummary = useMemo(() => {
    if (!task) {
      return {
        totalExpected: 0,
        totalScanned: 0,
        totalVariance: 0,
      };
    }
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

  async function handleChangeScanned(line: ReceiveTaskLine, nextScanned: number) {
    if (!task || isCommitted) return;

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
    } catch (err) {
      console.error("recordReceiveScan failed", err);
      setError(getErrorMessage(err, "更新实收数量失败"));
    } finally {
      setUpdatingLineId(null);
    }
  }

  async function handleCommit() {
    if (!task || isCommitted) return;
    setCommitting(true);
    setCommitError(null);
    try {
      const updated = await commitReceiveTask(task.id, {});
      setTask(updated);
    } catch (err) {
      console.error("commitReceiveTask failed", err);
      setCommitError(getErrorMessage(err, "确认入库失败"));
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

      {loading && <div className="text-sm text-slate-500">加载中…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {task && (
        <>
          <ReceiveTaskInfoCard task={task} varianceSummary={varianceSummary} />

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                行明细（应收 / 实收 / 差异）
              </h2>
              <div className="flex items-center gap-2 text-xs">
                {commitError && <span className="text-red-600">{commitError}</span>}
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

            <ReceiveTaskLinesTable
              lines={task.lines}
              isCommitted={!!isCommitted}
              updatingLineId={updatingLineId}
              onChangeScanned={handleChangeScanned}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default ReceiveTaskDetailPage;
