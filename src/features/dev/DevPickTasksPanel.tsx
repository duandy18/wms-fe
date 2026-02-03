// src/features/dev/DevPickTasksPanel.tsx
//
// DevConsole · 拣货链路调试主面板（PickTasks Debug Panel）
//
// 说明：
// - 本文件只做页面编排（Orchestrator）；所有业务状态/副作用/请求都下沉到 controller。
// - commit 合同已升级：必须携带 handoff_code（订单确认码：WMS:ORDER:v1:...）

import React from "react";
import { useNavigate } from "react-router-dom";

import { DevPickTasksLayout } from "./pick-tasks/DevPickTasksLayout";
import { useDevPickTasksController } from "./pick-tasks/useDevPickTasksController";

export const DevPickTasksPanel: React.FC = () => {
  const navigate = useNavigate();

  const c = useDevPickTasksController({
    navigate: (to: string) => navigate(to),
  });

  return (
    <DevPickTasksLayout
      // 基础上下文
      platform={c.platform}
      shopId={c.shopId}
      onChangePlatform={c.setPlatform}
      onChangeShopId={c.setShopId}
      creating={c.creating}
      onCreateDemo={c.onCreateDemo}
      // 订单 & 任务
      orderView={c.orderView}
      task={c.task}
      loadingTask={c.loadingTask}
      onReloadTask={c.onReloadTask}
      // FEFO 批次
      batchRows={c.batchRows}
      batchesLoading={c.batchesLoading}
      batchesError={c.batchesError}
      activeItemId={c.activeItemId}
      activeWarehouseId={c.activeWarehouseId}
      recommendedBatchCode={c.recommendedBatchCode}
      onUseRecommendedBatch={c.onUseRecommendedBatch}
      // diff
      diff={c.diff}
      // 扫码
      scanForm={c.scanForm}
      scanLoading={c.scanLoading}
      scanSuccess={c.scanSuccess}
      onChangeScanForm={c.onChangeScanForm}
      onSubmitScan={c.onSubmitScan}
      // commit
      commitForm={c.commitForm}
      commitLoading={c.commitLoading}
      commitSuccess={c.commitSuccess}
      onChangeCommitForm={c.onChangeCommitForm}
      onSubmitCommit={c.onSubmitCommit}
      onJumpTrace={c.onJumpTrace}
      // 错误 & 结果
      error={c.error}
      commitResult={c.commitResult}
    />
  );
};
