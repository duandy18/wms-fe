// src/features/operations/inbound/stateMachine.ts
// Inbound Phase 3: UI 状态机裁决器（单一真相）
// - 不引入新字段，不改变业务，只把“能不能操作”收敛成一个纯函数层
// - 避免各组件散落 if(status===...) 造成“隐式允许”

import type { InboundCockpitController } from "./types";
import type { ReceiveTask } from "../../receive-tasks/api";

export type InboundTaskStatusNorm =
  | "UNKNOWN"
  | "DRAFT"
  | "SCANNED"
  | "COMMITTED"
  | "CANCELED"
  | "CLOSED"
  | string;

function normStatus(s: unknown): InboundTaskStatusNorm {
  const v = String(s ?? "").trim().toUpperCase();
  if (!v) return "UNKNOWN";
  return v as InboundTaskStatusNorm;
}

export type InboundUiCaps = {
  // 上下文
  hasTask: boolean;
  status: InboundTaskStatusNorm;
  isCommitted: boolean;

  // 关键操作能力（UI 与事件触发统一引用）
  canScan: boolean;
  canManualReceive: boolean;
  canEditSupplements: boolean;
  canCommitClick: boolean;

  // 阻断原因（用于 UI 显示）
  blockedReason?: string;
};

export function getInboundUiCaps(c: Pick<
  InboundCockpitController,
  "currentTask" | "committing" | "manualDraft" | "varianceSummary"
>): InboundUiCaps {
  const task = c.currentTask ?? null;
  const hasTask = !!task;
  const status = normStatus(task?.status);
  const isCommitted = status === "COMMITTED";

  if (!hasTask) {
    return {
      hasTask: false,
      status,
      isCommitted: false,
      canScan: false,
      canManualReceive: false,
      canEditSupplements: false,
      canCommitClick: false,
      blockedReason: "尚未绑定收货任务",
    };
  }

  // ✅ COMMITTED：终态一刀切（UI 全禁）
  if (isCommitted) {
    return {
      hasTask: true,
      status,
      isCommitted: true,
      canScan: false,
      canManualReceive: false,
      canEditSupplements: false,
      canCommitClick: false,
      blockedReason: "任务已入库（COMMITTED），已进入终态",
    };
  }

  // ✅ 提交中：避免重复提交与并发操作
  if (c.committing) {
    return {
      hasTask: true,
      status,
      isCommitted: false,
      canScan: false,
      canManualReceive: false,
      canEditSupplements: false,
      canCommitClick: false,
      blockedReason: "提交中，暂不可继续操作",
    };
  }

  // ✅ 手工草稿：Phase 3 的关键收紧点之一
  // 规则：存在未落地草稿 → 先要求“录入/落地”再允许 commit（避免 commit 写入与 UI 草稿不一致）
  const manualDirty = !!c.manualDraft?.dirty;
  if (manualDirty) {
    return {
      hasTask: true,
      status,
      isCommitted: false,
      canScan: true, // 扫码不一定要禁（扫码本身会落地）
      canManualReceive: true,
      canEditSupplements: true,
      canCommitClick: false,
      blockedReason: "存在未落地的手工录入草稿，请先完成录入再提交入库",
    };
  }

  // ✅ 是否已发生任何实收（最小限度判断）
  // 更复杂的“缺批次/缺日期/差异确认”等由 commit model 继续裁决；
  // 这里仅做“最低门槛”，避免 DRAFT 空任务被直接 commit。
  const totalScanned = Number(c.varianceSummary?.totalScanned ?? 0);
  const hasAnyReceipt = totalScanned > 0;

  return {
    hasTask: true,
    status,
    isCommitted: false,
    canScan: true,
    canManualReceive: true,
    canEditSupplements: true,
    canCommitClick: hasAnyReceipt,
    blockedReason: hasAnyReceipt ? undefined : "尚未产生任何实收（扫码/录入为 0），不能提交入库",
  };
}

// UI 展示用：把状态映射成中文（不要暴露后端变量名）
export function taskStatusLabel(task: ReceiveTask | null): string {
  const s = normStatus(task?.status);
  if (!task) return "未绑定任务";
  if (s === "COMMITTED") return "已入库";
  if (s === "DRAFT") return "待收货";
  if (s === "SCANNED") return "已收货待确认";
  if (s === "CANCELED") return "已取消";
  if (s === "CLOSED") return "已关闭";
  return "进行中";
}
