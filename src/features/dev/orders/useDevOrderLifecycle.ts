// src/features/dev/orders/useDevOrderLifecycle.ts
//
// DevConsole Orders：订单生命周期复杂逻辑模块
// - 负责调用 /diagnostics/lifecycle/order-v2
// - 负责 health / issues / 一致性检查 / 守门员布尔量
// - refetch() 只是“再请求一次”，不会制造循环依赖

import { useCallback, useEffect, useState } from "react";
import type {
  DevOrderItemFact,
  OrderLifecycleStageV2,
  OrderLifecycleSummaryV2,
} from "./api/index";
import { fetchOrderLifecycleV2 } from "./api/index";

export type DevOrderLifecycleState = {
  stages: OrderLifecycleStageV2[];
  summary: OrderLifecycleSummaryV2 | null;
  consistencyIssues: string[];
  loading: boolean;
  error: string | null;
  hasReserved: boolean;
  hasShipped: boolean;
  forbidScenarios: boolean;
  refetch: () => void;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "未知错误";
  }
};

function buildLifecycleConsistencyIssues(
  stages: OrderLifecycleStageV2[],
  facts: DevOrderItemFact[] | null,
): string[] {
  const issues: string[] = [];
  if (!stages || stages.length === 0) return issues;

  const stageByKey: Record<string, OrderLifecycleStageV2> = {};
  for (const s of stages) stageByKey[s.key] = s;

  const shippedStage = stageByKey["shipped"];
  const returnedStage = stageByKey["returned"];

  const totalShipped =
    facts?.reduce((acc, f) => acc + (f.qty_shipped || 0), 0) ?? 0;
  const totalReturned =
    facts?.reduce((acc, f) => acc + (f.qty_returned || 0), 0) ?? 0;

  if (totalShipped > 0 && (!shippedStage || !shippedStage.present)) {
    issues.push(
      `订单事实层显示已发货数量=${totalShipped}，但生命周期中未检测到“发货记账”节点（shipped）。`,
    );
  }

  if (totalReturned > 0 && (!returnedStage || !returnedStage.present)) {
    issues.push(
      `订单事实层显示已退货数量=${totalReturned}，但生命周期中未检测到“退货入库”节点（returned）。`,
    );
  }

  return issues;
}

export function useDevOrderLifecycle(
  traceId: string | null | undefined,
  facts: DevOrderItemFact[] | null,
): DevOrderLifecycleState {
  const [stages, setStages] = useState<OrderLifecycleStageV2[]>([]);
  const [summary, setSummary] =
    useState<OrderLifecycleSummaryV2 | null>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // 真正的请求函数：给 traceId 跑一次 /diagnostics/lifecycle/order-v2
  // ------------------------------------------------------------------
  const runFetch = useCallback(
    async (tid: string | null | undefined) => {
      if (!tid) {
        setStages([]);
        setSummary(null);
        setConsistencyIssues([]);
        setLoading(false);
        setError("当前订单没有 trace_id，无法生成生命周期视图。");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetchOrderLifecycleV2(tid);
        const s = res.stages || [];
        setStages(s);
        setSummary(res.summary || null);
      } catch (err: unknown) {
        console.error("fetchOrderLifecycleV2 failed:", err);
        setStages([]);
        setSummary(null);
        setError(
          getErrorMessage(err) ??
            "生命周期 v2 接口调用失败（trace_id 视图不可用）。",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 初次 + traceId 变化时自动拉一次
  useEffect(() => {
    if (!traceId) {
      setStages([]);
      setSummary(null);
      setConsistencyIssues([]);
      setLoading(false);
      setError("当前订单没有 trace_id，无法生成生命周期视图。");
      return;
    }
    void runFetch(traceId);
  }, [traceId, runFetch]);

  // facts × lifecycle 一致性检查
  useEffect(() => {
    setConsistencyIssues(buildLifecycleConsistencyIssues(stages, facts));
  }, [stages, facts]);

  // 守门员布尔量
  const stageByKey: Record<string, OrderLifecycleStageV2> = {};
  for (const s of stages) stageByKey[s.key] = s;

  const hasReserved = stageByKey["reserved"]?.present ?? false;
  const hasShipped = stageByKey["shipped"]?.present ?? false;
  const lifecycleHealth: OrderLifecycleSummaryV2["health"] =
    summary?.health ?? "OK";
  const forbidScenarios = lifecycleHealth === "BAD";

  // 手动刷新：只调一次 runFetch，不会触发 useEffect 的循环依赖
  const refetch = () => {
    void runFetch(traceId);
  };

  return {
    stages,
    summary,
    consistencyIssues,
    loading,
    error,
    hasReserved,
    hasShipped,
    forbidScenarios,
    refetch,
  };
}
