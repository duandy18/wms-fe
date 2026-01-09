// src/features/operations/inbound/return-receive/types.ts

import type { ReturnTask, ReturnTaskLine } from "../../../return-tasks/api";

export type { ReturnTask, ReturnTaskLine };

export type ReturnReceiveCreateParams = {
  orderRef: string;
  warehouseId?: number | null;
};

export type ReturnReceiveState = {
  orderRef: string;
  setOrderRef: (v: string) => void;

  task: ReturnTask | null;

  loadingCreate: boolean;
  error: string | null;

  committing: boolean;
  commitError: string | null;

  qtyInputs: Record<number, string>;
  setQtyInput: (itemId: number, v: string) => void;

  canCreate: boolean;
  canCommit: boolean;

  createTask: (params?: { warehouseId?: number | null }) => Promise<void>;
  clearAll: () => void;

  adjustLineQty: (line: ReturnTaskLine, delta: number) => Promise<void>;
  applyInputDelta: (line: ReturnTaskLine) => Promise<void>;
  commit: () => Promise<void>;

  // ✅ commit 成功后保留一个“查看即时库存”的定位入口（不自动跳转）
  lastCommittedItemId: number | null;
  clearLastCommitted: () => void;
};
