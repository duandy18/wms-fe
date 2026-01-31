// src/features/admin/shipping-providers/scheme/surcharges/SurchargeList.tsx

import React, { useMemo, useState } from "react";
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

function asString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

function normalizeName(name: string): string {
  const t = (name ?? "").trim();
  if (!t) return "-";

  // ✅ 历史遗留：旧目的地附加费可能以“目的地附加费xxx”命名
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

function readDestObject(s: PricingSchemeSurcharge): Record<string, unknown> {
  const cond = readCondition(s);
  const destRaw = cond["dest"];
  return isRecord(destRaw) ? destRaw : {};
}

/**
 * ✅ dest 兼容读取（新旧结构）
 * - 新结构：{scope:"province"|"city", province:"广东省", city?:"深圳市"}
 * - 旧结构：{province:["广东省"], city:["深圳市"]}
 */
function readDestProvince(dest: Record<string, unknown>): string | null {
  const p1 = asString(dest["province"]);
  if (p1) return p1;

  const arr = asStringArray(dest["province"]);
  if (arr.length === 1) return arr[0];
  return null;
}

function readDestCity(dest: Record<string, unknown>): string | null {
  const c1 = asString(dest["city"]);
  if (c1) return c1;

  const arr = asStringArray(dest["city"]);
  if (arr.length === 1) return arr[0];
  return null;
}

function extractDest(s: PricingSchemeSurcharge): DestInfo {
  const dest = readDestObject(s);

  const scope = asString(dest["scope"]);
  const prov = readDestProvince(dest);
  const city = readDestCity(dest);

  if (scope === "city") {
    if (prov && city) return { kind: "city", label: `${prov}-${city}` };
    if (city) return { kind: "city", label: city };
  }
  if (scope === "province") {
    if (prov) return { kind: "province", label: prov };
  }

  if (city) return { kind: "city", label: prov ? `${prov}-${city}` : city };
  if (prov) return { kind: "province", label: prov };

  return { kind: "other", label: normalizeName(s.name ?? "") };
}

function isDestSurcharge(s: PricingSchemeSurcharge): boolean {
  // ✅ flag_any 不属于目的地（属于规则附加费）
  if (isFlagAnySurcharge(s)) return false;

  const dest = readDestObject(s);

  const scope = asString(dest["scope"]);
  if (scope === "province") {
    return !!readDestProvince(dest);
  }
  if (scope === "city") {
    return !!readDestProvince(dest) && !!readDestCity(dest);
  }

  const provArr = asStringArray(dest["province"]);
  const cityArr = asStringArray(dest["city"]);
  return provArr.length > 0 || cityArr.length > 0;
}

function extractFlatAmountText(s: PricingSchemeSurcharge): string {
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

function readFlatAmountNumber(s: PricingSchemeSurcharge): number | null {
  const amt = readAmount(s);
  const kind = String(amt["kind"] ?? "flat").toLowerCase();
  if (kind !== "flat") return null;

  const raw = amt["amount"];
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseAmount(v: string): number | null {
  const t = (v || "").trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

type RowProps = {
  s: PricingSchemeSurcharge;
  idx: number;
  disabled?: boolean;
  draftById: Record<number, string>;
  setDraftById: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
  onDelete: (s: PricingSchemeSurcharge) => Promise<void>;
  onPatchAmount: (s: PricingSchemeSurcharge, amount: number) => Promise<void>;
  variant: "legacy_rule" | "legacy_dest";
};

function SurchargeRow(p: RowProps) {
  const { s, idx, disabled, draftById, setDraftById, onToggle, onDelete, onPatchAmount, variant } = p;

  const dest = extractDest(s);
  const amountText = extractFlatAmountText(s);
  const flatN = readFlatAmountNumber(s);

  const currentDraft = draftById[s.id] ?? (flatN === null ? "" : flatN.toFixed(2));
  const draftN = parseAmount(currentDraft);

  const canEditAmount = flatN !== null; // 只支持 flat
  const amountChanged = flatN !== null && draftN !== null && Math.abs(draftN - flatN) > 1e-9;
  const amountValid = draftN !== null && draftN >= 0;

  // ✅ 护栏：启用态不可删除（必须先停用）
  const deleteDisabled = !!disabled || !!s.active;
  const deleteTitle = s.active ? "请先停用再删除" : "删除规则（不可恢复）";

  const saveDisabled = !!disabled || !canEditAmount || !amountChanged || !amountValid;

  const tag =
    variant === "legacy_dest"
      ? { text: "遗留：旧目的地规则", cls: "bg-rose-50 text-rose-700" }
      : dest.kind === "other"
        ? { text: "规则", cls: "bg-slate-100 text-slate-700" }
        : isFlagAnySurcharge(s)
          ? { text: "flag", cls: "bg-amber-50 text-amber-700" }
          : { text: "规则", cls: "bg-slate-100 text-slate-700" };

  const labelText =
    variant === "legacy_dest"
      ? dest.label
      : isFlagAnySurcharge(s)
        ? `flag_any: ${(asStringArray(readCondition(s)["flag_any"]) ?? []).join(", ") || "—"}`
        : normalizeName(s.name ?? "");

  return (
    <tr className="border-b border-slate-100 text-sm">
      <td className="px-3 py-2 text-slate-700 font-mono">{idx + 1}</td>

      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-semibold ${tag.cls}`}>
            {tag.text}
          </span>
          <span className="text-slate-900">{labelText}</span>
        </div>

        <div className="mt-1 text-xs text-slate-500">规则名：{normalizeName(s.name ?? "")} · id={s.id}</div>

        {variant === "legacy_dest" ? (
          <div className="mt-1 text-xs text-rose-700">
            该规则属于旧“目的地附加费”写法，建议迁移到【目的地附加费】Tab（结构化事实）。
          </div>
        ) : null}
      </td>

      <td className="px-3 py-2 font-mono text-slate-900">{amountText}</td>

      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            className="w-[120px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            value={currentDraft}
            disabled={disabled || !canEditAmount}
            onChange={(e) => {
              const v = e.target.value;
              setDraftById((prev) => ({ ...prev, [s.id]: v }));
            }}
            placeholder={canEditAmount ? "例如：1.5" : "仅支持 flat"}
            inputMode="decimal"
          />
          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={saveDisabled}
            title={!canEditAmount ? "仅 flat 类型支持直接改金额" : amountChanged ? "保存新金额" : "未修改"}
            onClick={() => {
              const n = parseAmount(currentDraft);
              if (n === null || n < 0) return;
              void onPatchAmount(s, n);
            }}
          >
            保存
          </button>
        </div>
        {!canEditAmount ? <div className="mt-1 text-xs text-slate-500">非 flat 类型请在高级工具中维护</div> : null}
        {canEditAmount && currentDraft && !amountValid ? <div className="mt-1 text-xs text-rose-700">金额必须是 &gt;= 0 的数字</div> : null}
      </td>

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
          <button
            type="button"
            disabled={disabled}
            className={UI.btnNeutralSm}
            title={s.active ? "停用后才可删除" : "启用并参与算价"}
            onClick={() => void onToggle(s)}
          >
            {s.active ? "停用" : "启用"}
          </button>

          <button
            type="button"
            disabled={deleteDisabled}
            className={UI.btnDangerSm}
            title={deleteTitle}
            onClick={() => void onDelete(s)}
          >
            删除
          </button>
        </div>
      </td>
    </tr>
  );
}

export const SurchargeList: React.FC<{
  list: PricingSchemeSurcharge[];
  disabled?: boolean;
  onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
  onDelete: (s: PricingSchemeSurcharge) => Promise<void>;

  // ✅ 新增：行内修改金额（仅 flat）
  onPatchAmount: (s: PricingSchemeSurcharge, amount: number) => Promise<void>;
}> = ({ list, disabled, onToggle, onDelete, onPatchAmount }) => {
  const [draftById, setDraftById] = useState<Record<number, string>>({});

  const { legacyRules, legacyDest } = useMemo(() => {
    const arr = [...(list ?? [])];

    const destOnly = arr.filter((s) => isDestSurcharge(s));
    const rules = arr.filter((s) => !isDestSurcharge(s));

    const sortByActiveIdDesc = (a: PricingSchemeSurcharge, b: PricingSchemeSurcharge) => {
      const aa = a.active ? 1 : 0;
      const bb = b.active ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return (b.id ?? 0) - (a.id ?? 0);
    };

    rules.sort(sortByActiveIdDesc);
    destOnly.sort(sortByActiveIdDesc);

    return { legacyRules: rules, legacyDest: destOnly };
  }, [list]);

  if (!legacyRules.length && !legacyDest.length) {
    return <div className={UI.surchargeEmpty}>—</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="mb-2 text-sm font-semibold text-slate-800">规则附加费（建议在此维护）</div>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
              <th className="px-3 py-2 w-[72px]">序号</th>
              <th className="px-3 py-2">规则</th>
              <th className="px-3 py-2 w-[140px]">金额（元）</th>
              <th className="px-3 py-2 w-[220px]">修改金额（元）</th>
              <th className="px-3 py-2 w-[120px]">状态</th>
              <th className="px-3 py-2 w-[240px]">操作</th>
            </tr>
          </thead>

          <tbody>
            {legacyRules.length ? (
              legacyRules.map((s, idx) => (
                <SurchargeRow
                  key={s.id}
                  s={s}
                  idx={idx}
                  disabled={disabled}
                  draftById={draftById}
                  setDraftById={setDraftById}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onPatchAmount={onPatchAmount}
                  variant="legacy_rule"
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-sm font-mono text-slate-600">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {legacyDest.length ? (
        <div className="overflow-x-auto rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-sm font-semibold text-rose-800">遗留：旧“目的地附加费”规则（请迁移）</div>
          <div className="mt-1 text-sm text-rose-700">
            这些规则属于旧 JSON surcharge 的目的地写法。当前系统已升级为结构化事实模型，请迁移到【目的地附加费】Tab。
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-rose-200 text-left text-sm font-semibold text-rose-800">
                  <th className="px-3 py-2 w-[72px]">序号</th>
                  <th className="px-3 py-2">目的地</th>
                  <th className="px-3 py-2 w-[140px]">金额（元）</th>
                  <th className="px-3 py-2 w-[220px]">修改金额（元）</th>
                  <th className="px-3 py-2 w-[120px]">状态</th>
                  <th className="px-3 py-2 w-[240px]">操作</th>
                </tr>
              </thead>

              <tbody>
                {legacyDest.map((s, idx) => (
                  <SurchargeRow
                    key={s.id}
                    s={s}
                    idx={idx}
                    disabled={disabled}
                    draftById={draftById}
                    setDraftById={setDraftById}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onPatchAmount={onPatchAmount}
                    variant="legacy_dest"
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SurchargeList;
