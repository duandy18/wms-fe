// src/features/operations/ship/internal-outbound/components/InternalOutboundHeaderForm.tsx

import React from "react";
import type { InternalOutboundDoc } from "../types";

export const InternalOutboundHeaderForm: React.FC<{
  doc: InternalOutboundDoc | null;
  disabled: boolean;

  warehouseId: number;
  onWarehouseIdChange: (v: number) => void;

  docType: string;
  onDocTypeChange: (v: string) => void;

  recipientName: string;
  onRecipientNameChange: (v: string) => void;

  recipientType: string;
  onRecipientTypeChange: (v: string) => void;

  recipientNote: string;
  onRecipientNoteChange: (v: string) => void;

  docNote: string;
  onDocNoteChange: (v: string) => void;

  docTypes: Array<{ value: string; label: string }>;

  onCreate: () => void;
}> = ({
  doc,
  disabled,
  warehouseId,
  onWarehouseIdChange,
  docType,
  onDocTypeChange,
  recipientName,
  onRecipientNameChange,
  recipientType,
  onRecipientTypeChange,
  recipientNote,
  onRecipientNoteChange,
  docNote,
  onDocNoteChange,
  docTypes,
  onCreate,
}) => {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-4">
      <h2 className="text-base font-semibold">单据头</h2>

      <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">仓库 ID</label>
          <input
            type="number"
            className="rounded-lg border px-3 py-2"
            value={warehouseId}
            onChange={(event) => onWarehouseIdChange(Number(event.target.value) || 1)}
            disabled={!!doc || disabled}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">出库类型</label>
          <select
            className="rounded-lg border px-3 py-2"
            value={docType}
            onChange={(event) => onDocTypeChange(event.target.value)}
            disabled={!!doc || disabled}
          >
            {docTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">领取人姓名 *</label>
          <input
            className="rounded-lg border px-3 py-2"
            value={recipientName}
            onChange={(event) => onRecipientNameChange(event.target.value)}
            disabled={!!doc || disabled}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">领取人类型</label>
          <select
            className="rounded-lg border px-3 py-2"
            value={recipientType}
            onChange={(event) => onRecipientTypeChange(event.target.value)}
            disabled={!!doc || disabled}
          >
            <option value="EMPLOYEE">员工</option>
            <option value="CUSTOMER">客户</option>
            <option value="OTHER">其他</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">领取人备注 / 部门</label>
          <input
            className="rounded-lg border px-3 py-2"
            value={recipientNote}
            onChange={(event) => onRecipientNoteChange(event.target.value)}
            disabled={!!doc || disabled}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-1">
          <label className="text-xs text-slate-600">单据备注</label>
          <input
            className="rounded-lg border px-3 py-2"
            value={docNote}
            onChange={(event) => onDocNoteChange(event.target.value)}
            disabled={!!doc || disabled}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 text-sm">
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          onClick={onCreate}
          disabled={!!doc || disabled}
        >
          {doc ? "单据已创建" : "创建内部出库单"}
        </button>

        {doc && (
          <div className="text-xs text-slate-600">
            <div>单号：{doc.doc_no}</div>
            <div>状态：{doc.status}</div>
            <div>trace_id：{doc.trace_id || "-"}</div>
          </div>
        )}
      </div>
    </section>
  );
};
