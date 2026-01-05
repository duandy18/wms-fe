// src/features/admin/shipping-providers/scheme/surcharges/SurchargeList.tsx

import React, { useMemo } from "react";
import type { PricingSchemeSurcharge } from "../../api";
import { UI } from "../ui";

type DestInfo =
  | { kind: "province"; label: string }
  | { kind: "city"; label: string }
  | { kind: "other"; label: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).map((x) => x.trim()).filter(Boolean);
}

function normalizeName(name: string): string {
  const t = (name ?? "").trim();
  if (!t) return "-";

  if (t.startsWith("目的地附加费")) {
    const rest = t.replace(/^目的地附加费[-—–_ ]*/g, "").trim();
    return rest || "目的地附加费";
  }
  return t;
}

function readCondition(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.condition_json) ? s.condition_json : {};
}

function readAmount(s: PricingSchemeSurcharge): Record<string, unknown> {
  return isRecord(s.amount_json) ? s.amount_json : {};
}

function isFlagAnySurcharge(s: PricingSchemeSurcharge): boolean {
  const cond = readCondition(s);
  const flags = asStringArray(cond["flag_any"]);
  if (!flags.length) return false;

  if (flags.includes("bulky") || flags.includes("irregular")) return true;

  return true;
}

function extractDest(s: PricingSchemeSurcharge): DestInfo {
  const cond = readCondition(s);
  const destRaw = cond["dest"];
  const dest = isRecord(destRaw) ? destRaw : {};

  const provArr = asStringArray(dest["province"]);
  const cityArr = asStringArray(dest["city"]);

  if (cityArr.length === 1) return { kind: "city", label: cityArr[0] };
  if (provArr.length === 1) return { kind: "province", label: provArr[0] };

  return { kind: "other", label: normalizeName(s.name ?? "") };
}

function isDestSurcharge(s: PricingSchemeSurcharge): boolean {
  if (isFlagAnySurcharge(s)) return false;

  const cond = readCondition(s);
  const destRaw = cond["dest"];
  const dest = isRecord(destRaw) ? destRaw : {};

  const provArr = asStringArray(dest["province"]);
  const cityArr = asStringArray(dest["city"]);
  return provArr.length > 0 || cityArr.length > 0;
}

function extractFlatAmount(s: PricingSchemeSurcharge): string {
  const amt = readAmount(s);
  const kind = String(amt["kind"] ?? "flat").toLowerCase();

  if (kind === "flat") {
    const raw = amt["amount"];
    const n = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(n)) return n.toFixed(2);
    return "-";
  }

  return kind === "per_kg" ? "按公斤" : kind === "table" ? "阶梯表" : kind;
}

export const SurchargeList: React.FC<{
  list: PricingSchemeSurcharge[];
  disabled?: boolean;
  onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
  onDelete: (s: PricingSchemeSurcharge) => Promise<void>;
}> = ({ list, disabled, onToggle, onDelete }) => {
  const rows = useMemo(() => {
    const arr = [...(list ?? [])];

    const destOnly = arr.filter((s) => isDestSurcharge(s));

    destOnly.sort((a, b) => {
      const aa = a.active ? 1 : 0;
      const bb = b.active ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return (b.id ?? 0) - (a.id ?? 0);
    });

    return destOnly;
  }, [list]);

  if (!rows.length) {
    return <div className={UI.surchargeEmpty}>—</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
            <th className="px-3 py-2 w-[72px]">序号</th>
            <th className="px-3 py-2">目的地</th>
            <th className="px-3 py-2 w-[160px]">金额（元）</th>
            <th className="px-3 py-2 w-[120px]">状态</th>
            <th className="px-3 py-2 w-[220px]">操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((s, idx) => {
            const dest = extractDest(s);
            const amountText = extractFlatAmount(s);

            return (
              <tr key={s.id} className="border-b border-slate-100 text-sm">
                <td className="px-3 py-2 text-slate-700 font-mono">{idx + 1}</td>

                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-semibold ${
                        dest.kind === "province"
                          ? "bg-slate-100 text-slate-700"
                          : dest.kind === "city"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {dest.kind === "province" ? "省" : dest.kind === "city" ? "城市" : "其他"}
                    </span>
                    <span className="text-slate-900">{dest.label}</span>
                  </div>

                  <div className="mt-1 text-xs text-slate-500">规则名：{normalizeName(s.name ?? "")}</div>
                </td>

                <td className="px-3 py-2 font-mono text-slate-900">{amountText}</td>

                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-semibold ${
                      s.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.active ? "启用" : "停用"}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button type="button" disabled={disabled} className={UI.btnNeutralSm} onClick={() => void onToggle(s)}>
                      {s.active ? "停用" : "启用"}
                    </button>

                    <button type="button" disabled={disabled} className={UI.btnDangerSm} onClick={() => void onDelete(s)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SurchargeList;
