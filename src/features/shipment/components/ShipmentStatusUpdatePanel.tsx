// src/features/shipment/components/ShipmentStatusUpdatePanel.tsx
//
// 分拆说明：
// - 本文件为 Shipment 详情页提供“状态更新”面板。
// - 仅负责表单展示、前端状态机约束、输入校验与提交回调。
// - 不负责数据查询；提交成功后的刷新由父页面控制。

import React, { useMemo, useState } from "react";
import type { ShippingRecord } from "../api/shippingRecordsApi";
import {
  getAllowedNextShipmentStatuses,
  getShipmentStatusLabel,
  isShipmentTerminalStatus,
  type ShipmentStatus,
} from "../domain/shipmentStatus";
import {
  updateShipmentStatus,
  type UpdateShipmentStatusPayload,
} from "../api/shipmentStatusApi";

type Props = {
  record: ShippingRecord;
  onUpdated: (next: ShippingRecord) => void | Promise<void>;
};

function toLocalDateTimeInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const normalized = iso.replace("Z", "");
  return normalized.slice(0, 16);
}

function fromLocalDateTimeInputValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return `${trimmed}:00`;
}

const ShipmentStatusUpdatePanel: React.FC<Props> = ({ record, onUpdated }) => {
  const allowedStatuses = useMemo(
    () => getAllowedNextShipmentStatuses(record.status ?? null),
    [record.status],
  );

  const isTerminal = isShipmentTerminalStatus(record.status ?? null);

  const [nextStatus, setNextStatus] = useState<ShipmentStatus | "">(
    allowedStatuses[0] ?? "",
  );
  const [deliveryTimeInput, setDeliveryTimeInput] = useState<string>(
    toLocalDateTimeInputValue(record.delivery_time),
  );
  const [errorCode, setErrorCode] = useState<string>(record.error_code ?? "");
  const [errorMessage, setErrorMessage] = useState<string>(
    record.error_message ?? "",
  );
  const [metaText, setMetaText] = useState<string>(
    record.meta ? JSON.stringify(record.meta, null, 2) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const needsDeliveryTime = nextStatus === "DELIVERED";
  const needsErrorFields = nextStatus === "LOST" || nextStatus === "RETURNED";

  const handleSubmit = async () => {
    if (!record.id || record.id <= 0) {
      setSubmitError("当前记录 ID 无效，无法更新状态。");
      return;
    }
    if (!nextStatus) {
      setSubmitError("请选择目标状态。");
      return;
    }
    if (!allowedStatuses.includes(nextStatus)) {
      setSubmitError("当前状态不允许流转到所选目标状态。");
      return;
    }

    let parsedMeta: Record<string, unknown> | null = null;
    if (metaText.trim()) {
      try {
        const parsed = JSON.parse(metaText) as unknown;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          setSubmitError("meta 必须是 JSON 对象。");
          return;
        }
        parsedMeta = parsed as Record<string, unknown>;
      } catch {
        setSubmitError("meta JSON 格式不正确。");
        return;
      }
    }

    const payload: UpdateShipmentStatusPayload = {
      status: nextStatus,
      delivery_time: needsDeliveryTime
        ? fromLocalDateTimeInputValue(deliveryTimeInput)
        : null,
      error_code: needsErrorFields ? errorCode.trim() || null : null,
      error_message: needsErrorFields ? errorMessage.trim() || null : null,
      meta: parsedMeta,
    };

    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);
    try {
      const updated = await updateShipmentStatus(record.id, payload);
      await onUpdated(updated);
      setSubmitSuccess(`状态已更新为：${getShipmentStatusLabel(updated.status ?? nextStatus)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "状态更新失败";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">更新运输状态</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            前端遵循 Shipment 状态机：仅允许运输中 → 已签收 / 丢失 / 已退回；终态不可再次修改。
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
          当前：{getShipmentStatusLabel(record.status ?? null)}
        </span>
      </div>

      {isTerminal ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          当前记录已处于终态，禁止再次修改。
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <div className="font-semibold">目标状态</div>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as ShipmentStatus | "")}
                disabled={submitting}
              >
                <option value="">请选择</option>
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {getShipmentStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs text-slate-700">
              <div className="font-semibold">签收时间</div>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={deliveryTimeInput}
                onChange={(e) => setDeliveryTimeInput(e.target.value)}
                disabled={submitting || !needsDeliveryTime}
              />
              <div className="text-[11px] text-slate-500">
                仅在“已签收”时生效。
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-700">
              <div className="font-semibold">错误码</div>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="如 CARRIER_LOST"
                value={errorCode}
                onChange={(e) => setErrorCode(e.target.value)}
                disabled={submitting || !needsErrorFields}
              />
              <div className="text-[11px] text-slate-500">
                仅在“丢失 / 已退回”时生效。
              </div>
            </label>

            <label className="space-y-1 text-xs text-slate-700">
              <div className="font-semibold">错误说明</div>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="补充说明，可选"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                disabled={submitting || !needsErrorFields}
              />
            </label>
          </div>

          <label className="space-y-1 text-xs text-slate-700">
            <div className="font-semibold">meta（JSON 对象，可选）</div>
            <textarea
              className="min-h-[140px] w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-[12px]"
              placeholder='例如：{"source":"manual","operator":"andy"}'
              value={metaText}
              onChange={(e) => setMetaText(e.target.value)}
              disabled={submitting}
            />
          </label>

          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {submitError}
            </div>
          )}

          {submitSuccess && !submitError && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {submitSuccess}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || !nextStatus}
              className={
                "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white " +
                (submitting || !nextStatus
                  ? "bg-slate-400 opacity-70"
                  : "bg-sky-600 hover:bg-sky-700")
              }
            >
              {submitting ? "提交中…" : "提交状态更新"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShipmentStatusUpdatePanel;
