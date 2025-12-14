// src/features/admin/shipping-providers/scheme/surcharges/SurchargeList.tsx

import React from "react";
import type { PricingSchemeSurcharge } from "../../api";

/**
 * 把 condition_json / amount_json 翻译成“人话摘要”
 * 只做展示，不参与任何业务判断
 */
function describeSurcharge(s: PricingSchemeSurcharge): string {
  const cond = s.condition_json ?? {};
  const amt = s.amount_json ?? {};

  const parts: string[] = [];

  // ---------- 命中条件 ----------
  if (cond.dest) {
    const d = cond.dest as any;
    if (Array.isArray(d.city) && d.city.length) {
      parts.push(`目的城市：${d.city.join(" / ")}`);
    }
    if (Array.isArray(d.province) && d.province.length) {
      parts.push(`目的省份：${d.province.join(" / ")}`);
    }
  }

  if (Array.isArray(cond.flag_any) && cond.flag_any.length) {
    parts.push(`触发条件：${cond.flag_any.join(" / ")}`);
  }

  if (!parts.length) {
    parts.push("命中条件：全量");
  }

  // ---------- 计费方式 ----------
  const kind = String(amt.kind || "flat");

  if (kind === "flat") {
    parts.push(`加价：￥${Number(amt.amount || 0).toFixed(2)} / 单`);
  } else if (kind === "per_kg") {
    parts.push(`加价：￥${Number(amt.rate_per_kg || 0).toFixed(2)} / kg`);
  } else if (kind === "table") {
    parts.push("加价：按重量阶梯表");
  } else {
    parts.push(`加价方式：${kind}`);
  }

  return parts.join(" ｜ ");
}

export const SurchargeList: React.FC<{
  list: PricingSchemeSurcharge[];
  disabled?: boolean;
  onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
  onDelete: (s: PricingSchemeSurcharge) => Promise<void>;
}> = ({ list, disabled, onToggle, onDelete }) => {
  if (!list.length) {
    return <div className="text-sm text-slate-600">暂无附加费</div>;
  }

  return (
    <div className="space-y-2">
      {list.map((s) => (
        <div
          key={s.id}
          className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-3"
        >
          {/* 人话摘要（核心价值） */}
          <div className="text-sm text-slate-700">
            {describeSurcharge(s)}
          </div>

          {/* 原始信息 + 操作 */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-800">
              <span className="font-semibold">{s.name}</span>
              <span className="ml-2 font-mono text-slate-500">
                pri={s.priority} · {s.active ? "启用" : "停用"}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={disabled}
                className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60"
                onClick={() => void onToggle(s)}
              >
                {s.active ? "停用" : "启用"}
              </button>

              <button
                type="button"
                disabled={disabled}
                className="inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                onClick={() => void onDelete(s)}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="text-sm text-slate-600">
        删除失败常见原因：被约束（RESTRICT）拒绝，或后端业务规则不允许。可先停用再观察。
      </div>
    </div>
  );
};
