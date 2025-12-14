// src/features/admin/shipping-providers/scheme/zones/ZoneCreateForm.tsx

import React, { useState } from "react";
import { UI } from "../../ui";

export type CreateZonePayload = { name: string; priority: number };

export const ZoneCreateForm: React.FC<{
  disabled?: boolean;
  onCreate: (payload: CreateZonePayload) => Promise<void>;
  onError: (msg: string) => void;
}> = ({ disabled, onCreate, onError }) => {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("100");

  const handleCreate = async () => {
    const n = name.trim();
    if (!n) {
      onError("Zone 名称必填");
      return;
    }
    const pr = Number(priority);
    if (!Number.isFinite(pr) || pr < 0) {
      onError("Zone 优先级必须是 >=0 的数字");
      return;
    }
    await onCreate({ name: n, priority: pr });
    setName("");
    setPriority("100");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-800">新增地区分组（Zone）</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">名称 *</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
            placeholder="如：华南-深圳 / 北京 / 全国-默认"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">优先级（数字越小越优先）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-end">
          <button className={UI.btnPrimaryGreen} type="button" disabled={disabled} onClick={() => void handleCreate()}>
            创建 Zone
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm text-slate-600">
        建议：每个 Scheme 至少有一个 “全国-默认” Zone（不填 Members 作为兜底），priority 设大一些（如 9999）。
      </div>
    </div>
  );
};
