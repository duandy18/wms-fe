// src/features/dev/pick-tasks/DevPickTasksLayout.tsx

import React from "react";

import type { DevOrderView } from "../orders/api";
import type {
  PickTask,
  PickTaskDiffSummary,
  PickTaskCommitResult,
} from "../../operations/outbound-pick/pickTasksApi";
import type {
  CommitFormState,
  ScanFormState,
  StockBatchRow,
} from "../DevPickTasksPanel";

import { DevPickTasksHeader } from "./DevPickTasksHeader";
import { DevPickTasksContextCards } from "./DevPickTasksContextCards";
import { DevPickTasksFefoCard } from "./DevPickTasksFefoCard";
import { DevPickTasksLinesCard } from "./DevPickTasksLinesCard";
import { DevPickTasksDiffCard } from "./DevPickTasksDiffCard";
import { DevPickTasksScanCard } from "./DevPickTasksScanCard";
import { DevPickTasksCommitCard } from "./DevPickTasksCommitCard";
import { DevPickTasksErrorAndResult } from "./DevPickTasksErrorAndResult";

export interface DevPickTasksLayoutProps {
  // 基础上下文
  platform: string;
  shopId: string;
  onChangePlatform: (v: string) => void;
  onChangeShopId: (v: string) => void;
  creating: boolean;
  onCreateDemo: () => void;

  // 订单 & 任务
  orderView: DevOrderView | null;
  task: PickTask | null;
  loadingTask: boolean;
  onReloadTask: () => void;

  // FEFO 批次
  batchRows: StockBatchRow[];
  batchesLoading: boolean;
  batchesError: string | null;
  activeItemId: number | null;
  activeWarehouseId: number | null;
  recommendedBatchCode: string | null;
  onUseRecommendedBatch: () => void;

  // diff
  diff: PickTaskDiffSummary | null;

  // 扫码
  scanForm: ScanFormState;
  scanLoading: boolean;
  scanSuccess: boolean;
  onChangeScanForm: (patch: Partial<ScanFormState>) => void;
  onSubmitScan: (e: React.FormEvent) => void;

  // commit
  commitForm: CommitFormState;
  commitLoading: boolean;
  commitSuccess: boolean;
  onChangeCommitForm: (patch: Partial<CommitFormState>) => void;
  onSubmitCommit: (e: React.FormEvent) => void;
  onJumpTrace: () => void;

  // 错误 & 结果
  error: string | null;
  commitResult: PickTaskCommitResult | null;
}

export const DevPickTasksLayout: React.FC<DevPickTasksLayoutProps> = (
  props,
) => {
  return (
    <section className="rounded-xl border bg-white p-0">
      {/* 顶部深色条 */}
      <div className="flex items-center justify-between rounded-t-xl bg-slate-900 px-4 py-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            拣货任务调试（PickTask Debug）
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-300">
            一键生成 demo 订单 & 拣货任务 → FEFO 批次视图 → 扫码拣货（record_scan）
            → commit 出库（扣库存 + outbound_commits_v2）→ Trace / Ledger 联动验证。
          </p>
        </div>
        <div className="text-[11px] text-slate-300">仓库链路验证 · Dev 专用</div>
      </div>

      {/* 内层白底内容 */}
      <div className="space-y-4 p-4">
        <DevPickTasksHeader
          platform={props.platform}
          shopId={props.shopId}
          onChangePlatform={props.onChangePlatform}
          onChangeShopId={props.onChangeShopId}
          creating={props.creating}
          onCreateDemo={props.onCreateDemo}
        />

        <DevPickTasksContextCards
          orderView={props.orderView}
          task={props.task}
          loadingTask={props.loadingTask}
          onReloadTask={props.onReloadTask}
        />

        <DevPickTasksFefoCard
          batchRows={props.batchRows}
          loading={props.batchesLoading}
          error={props.batchesError}
          activeItemId={props.activeItemId}
          activeWarehouseId={props.activeWarehouseId}
          recommendedBatchCode={props.recommendedBatchCode}
          onUseRecommendedBatch={props.onUseRecommendedBatch}
        />

        <DevPickTasksLinesCard task={props.task} />

        <DevPickTasksDiffCard diff={props.diff} />

        <div className="grid gap-4 md:grid-cols-2">
          <DevPickTasksScanCard
            scanForm={props.scanForm}
            scanLoading={props.scanLoading}
            scanSuccess={props.scanSuccess}
            hasTask={!!props.task}
            onChangeScanForm={props.onChangeScanForm}
            onSubmitScan={props.onSubmitScan}
          />
          <DevPickTasksCommitCard
            commitForm={props.commitForm}
            commitLoading={props.commitLoading}
            commitSuccess={props.commitSuccess}
            hasTask={!!props.task}
            hasTrace={
              !!(props.commitForm.traceId || props.orderView?.trace_id)
            }
            onChangeCommitForm={props.onChangeCommitForm}
            onSubmitCommit={props.onSubmitCommit}
            onJumpTrace={props.onJumpTrace}
          />
        </div>

        <DevPickTasksErrorAndResult
          error={props.error}
          result={props.commitResult}
        />
      </div>
    </section>
  );
};
