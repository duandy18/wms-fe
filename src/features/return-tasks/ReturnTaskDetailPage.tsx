// src/features/return-tasks/ReturnTaskDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import {
  fetchReturnTask,
  commitReturnTask,
  type ReturnTask,
} from "./api";
import { getErrorMessage } from "./utils";
import {
  ReturnTaskInfoCard,
  type ReturnVarianceSummary,
} from "./components/ReturnTaskInfoCard";
import { ReturnTaskLinesTable } from "./components/ReturnTaskLinesTable";

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

  const varianceSummary: ReturnVarianceSummary = useMemo(() => {
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

      {loading && <div className="text-sm text-slate-500">加载中…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {task && (
        <>
          <ReturnTaskInfoCard task={task} varianceSummary={varianceSummary} />

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                行明细（计划退货 / 已拣选 / 差异）
              </h2>
              <div className="flex items-center gap-2 text-xs">
                {commitError && <span className="text-red-600">{commitError}</span>}
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

            <ReturnTaskLinesTable lines={task.lines} />
          </section>
        </>
      )}
    </div>
  );
};

export default ReturnTaskDetailPage;
