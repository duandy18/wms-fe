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
import {
  fetchInboundReceiptsByTaskId,
  fetchInboundReceiptDetail,
  type InboundReceipt,
} from "./inboundReceiptsApi";

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

  // ---- 收货单（事实）弹窗 ----
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<InboundReceipt | null>(null);

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

  async function openReceipt() {
    if (!task) return;

    setReceiptOpen(true);

    // 若已加载且仍对应当前任务，不重复请求
    if (receipt && receipt.receive_task_id === task.id) return;

    setReceiptLoading(true);
    setReceiptError(null);
    setReceipt(null);

    try {
      const list = await fetchInboundReceiptsByTaskId(task.id);
      const first = list?.[0];
      if (!first) {
        setReceiptError("未找到对应的收货单（inbound_receipts）。");
        return;
      }
      const detail = await fetchInboundReceiptDetail(first.id);
      setReceipt(detail);
    } catch (err) {
      console.error("load inbound receipt failed", err);
      setReceiptError(getErrorMessage(err, "加载收货单失败"));
    } finally {
      setReceiptLoading(false);
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

                {isCommitted ? (
                  <button
                    type="button"
                    onClick={() => void openReceipt()}
                    className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    title="查看本次入库对应的收货单事实（inbound_receipts）"
                  >
                    查看收货单
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={!!isCommitted || committing}
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

          {receiptOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setReceiptOpen(false)}
              />
              <div className="relative w-full max-w-3xl mx-4 rounded-xl bg-white border border-slate-200 shadow-xl">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                  <div className="text-sm font-semibold text-slate-800">
                    收货单（事实）
                  </div>
                  <button
                    type="button"
                    className="text-xs text-slate-600 hover:text-slate-900"
                    onClick={() => setReceiptOpen(false)}
                  >
                    关闭
                  </button>
                </div>

                <div className="p-5 space-y-4 text-sm">
                  {receiptLoading ? (
                    <div className="text-slate-500">加载中…</div>
                  ) : null}
                  {receiptError ? (
                    <div className="text-red-600">{receiptError}</div>
                  ) : null}

                  {!receiptLoading && !receiptError && receipt ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">ref</div>
                          <div className="font-mono text-[12px]">{receipt.ref}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">trace_id</div>
                          <div className="font-mono text-[12px]">{receipt.trace_id ?? "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">发生时间</div>
                          <div className="font-mono text-[12px]">{receipt.occurred_at}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">仓库</div>
                          <div className="font-mono text-[12px]">{receipt.warehouse_id}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">供应商</div>
                          <div>{receipt.supplier_name ?? "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">状态</div>
                          <div>{receipt.status}</div>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-lg overflow-auto">
                        <table className="min-w-[900px] w-full text-xs">
                          <thead className="bg-slate-50 text-slate-700">
                            <tr className="border-b">
                              <th className="px-3 py-2 text-left">行号</th>
                              <th className="px-3 py-2 text-left">商品</th>
                              <th className="px-3 py-2 text-left">批次</th>
                              <th className="px-3 py-2 text-right">收货数量</th>
                              <th className="px-3 py-2 text-right">折算单位</th>
                              <th className="px-3 py-2 text-right">单价</th>
                              <th className="px-3 py-2 text-right">金额</th>
                            </tr>
                          </thead>
                          <tbody>
                            {receipt.lines.map((l) => (
                              <tr key={l.id} className="border-b last:border-b-0">
                                <td className="px-3 py-2 font-mono">{l.line_no}</td>
                                <td className="px-3 py-2">
                                  <div className="font-mono text-[12px]">{l.item_id}</div>
                                  <div className="text-slate-700">{l.item_name ?? "-"}</div>
                                </td>
                                <td className="px-3 py-2 font-mono">{l.batch_code}</td>
                                <td className="px-3 py-2 text-right font-mono">{l.qty_received}</td>
                                <td className="px-3 py-2 text-right font-mono">{l.qty_units}</td>
                                <td className="px-3 py-2 text-right font-mono">{l.unit_cost ?? "-"}</td>
                                <td className="px-3 py-2 text-right font-mono">{l.line_amount ?? "-"}</td>
                              </tr>
                            ))}
                            {receipt.lines.length === 0 ? (
                              <tr>
                                <td className="px-3 py-4 text-slate-500" colSpan={7}>
                                  无明细行
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ReceiveTaskDetailPage;
