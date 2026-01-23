// src/features/orders/components/inline-detail/ManualAssignWarehouseModal.tsx
import React, { useEffect, useState } from "react";
import type { OrderSummary, WarehouseOption } from "../../api";
import { manualAssignFulfillmentWarehouse } from "../../api";

function whText(id: number | null | undefined) {
  if (id == null) return "-";
  return `WH${id}`;
}

function whOptionLabel(w: WarehouseOption) {
  const name = (w.name ?? "").trim();
  const code = (w.code ?? "").trim();
  if (code && name) return `${code} · ${name}`;
  if (code) return code;
  if (name) return name;
  return whText(w.id);
}

export const ManualAssignWarehouseModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;

  selectedSummary: OrderSummary;
  serviceWarehouseId: number | null;
  execWarehouseId: number | null;

  // ✅ 候选执行仓由后端给出（前端不得自行拉 /warehouses）
  warehouses: WarehouseOption[];
}> = ({
  open,
  onClose,
  onSuccess,
  selectedSummary,
  serviceWarehouseId,
  execWarehouseId,
  warehouses,
}) => {
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function resetForm() {
    setWarehouseId("");
    setReason("");
    setNote("");
    setSubmitError(null);
    setSubmitLoading(false);
  }

  useEffect(() => {
    if (!open) return;
    // 打开时清一下错误，保留用户输入（更符合操作习惯）
    setSubmitError(null);
  }, [open]);

  async function submit() {
    setSubmitError(null);

    const wid = Number(warehouseId);
    if (!Number.isFinite(wid) || wid <= 0) return setSubmitError("请选择执行仓。");
    if (!reason.trim()) return setSubmitError("原因为必填。");

    setSubmitLoading(true);
    try {
      await manualAssignFulfillmentWarehouse({
        platform: selectedSummary.platform,
        shop_id: selectedSummary.shop_id,
        ext_order_no: selectedSummary.ext_order_no,
        warehouse_id: wid,
        reason: reason.trim(),
        note: note.trim() ? note.trim() : null,
      });

      resetForm();
      onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "指定执行仓失败";
      setSubmitError(msg);
    } finally {
      setSubmitLoading(false);
    }
  }

  if (!open) return null;

  const options = (warehouses || []).filter((w) => w.active !== false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">指定执行仓</div>
          <button
            type="button"
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
          >
            关闭
          </button>
        </div>

        <div className="mt-3 space-y-3 text-sm">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
            服务归属仓：{serviceWarehouseId != null ? whText(serviceWarehouseId) : "-"}（只读） · 当前执行仓：
            {execWarehouseId != null ? whText(execWarehouseId) : "尚未指定"}
          </div>

          <div>
            <div className="mb-1 text-[11px] text-slate-500">执行仓（必选）</div>
            <select
              className="h-9 w-full rounded border border-slate-300 px-2 text-sm disabled:bg-slate-50"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              disabled={options.length === 0 || submitLoading}
            >
              <option value="">请选择仓库</option>
              {options.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {whOptionLabel(w)} {w.active === false ? "（已停用）" : ""}
                </option>
              ))}
            </select>

            {options.length === 0 && (
              <div className="mt-1 text-[11px] text-amber-700">
                当前无候选仓（候选仓由后端 summary 给出）。请刷新列表或检查后端 /orders/summary 返回。
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 text-[11px] text-slate-500">原因（必填）</div>
            <input
              className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例如：该仓当前可履约 / 人工改派 / 客诉加急"
              disabled={submitLoading}
            />
          </div>

          <div>
            <div className="mb-1 text-[11px] text-slate-500">备注（可选）</div>
            <input
              className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="补充说明（可留空）"
              disabled={submitLoading}
            />
          </div>

          {submitError && <div className="text-[11px] text-red-600">{submitError}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-100"
              disabled={submitLoading}
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              className="rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
              disabled={submitLoading}
            >
              {submitLoading ? "提交中…" : "提交指定"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
