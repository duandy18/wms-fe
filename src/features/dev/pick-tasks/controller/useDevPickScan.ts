// src/features/dev/pick-tasks/controller/useDevPickScan.ts
import { useCallback, useState } from "react";

import { scanPickTask, type PickTask } from "../../../operations/outbound-pick/pickTasksApi";
import type { ScanFormState } from "../types";
import { getErrorMessage } from "../types";

export function useDevPickScan(args: {
  currentTaskId: number | null;
  onTaskUpdated: (t: PickTask) => Promise<void>;
  setError: (msg: string | null) => void;
}) {
  const { currentTaskId, onTaskUpdated, setError } = args;

  const [scanForm, setScanForm] = useState<ScanFormState>({
    itemId: "",
    qty: "1",
    batchCode: "",
  });
  const [scanLoading, setScanLoading] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const updateScanForm = useCallback((patch: Partial<ScanFormState>) => {
    setScanForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const submitScan = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!currentTaskId) {
        setError("请先创建或加载一条拣货任务。");
        return;
      }

      setError(null);
      setScanLoading(true);
      setScanSuccess(false);

      try {
        const itemId = Number.parseInt(scanForm.itemId, 10);
        const qty = Number.parseInt(scanForm.qty, 10);
        const batchCode = scanForm.batchCode.trim() || undefined;

        if (!itemId || qty <= 0) {
          throw new Error("请填写合法的 item_id 和数量（qty 表示本次拣货动作要拣的件数）。");
        }

        const t = await scanPickTask(currentTaskId, {
          item_id: itemId,
          qty,
          batch_code: batchCode ?? null,
        });

        await onTaskUpdated(t);
        setScanSuccess(true);
      } catch (err: unknown) {
        console.error(err);
        setError(getErrorMessage(err) || "记录扫码拣货失败");
        setScanSuccess(false);
      } finally {
        setScanLoading(false);
      }
    },
    [currentTaskId, scanForm, onTaskUpdated, setError],
  );

  const useRecommendedBatch = useCallback((recommended: string | null) => {
    if (!recommended) return;
    setScanForm((prev) => ({ ...prev, batchCode: recommended }));
  }, []);

  return {
    scanForm,
    scanLoading,
    scanSuccess,
    onChangeScanForm: updateScanForm,
    onSubmitScan: submitScan,
    onUseRecommendedBatch: useRecommendedBatch,
    setScanSuccess,
    setScanForm,
  };
}
