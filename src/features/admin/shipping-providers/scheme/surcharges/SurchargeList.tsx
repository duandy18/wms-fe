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
  return v
    .map((x) => String(x))
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeName(name: string): string {
  const t = (name ?? "").trim();
  if (!t) return "-";

  // 去掉“目的地附加费”前缀（你要求）
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

  // 你明确要求：异形件（bulky/irregular）不出现在列表
  if (flags.includes("bulky") || flags.includes("irregular")) return true;

  // 其他 flag_any 目前也先不进“目的地列表”（保持列表纯净）
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

  // 列表聚焦“每单加价”，其他类型不显示细节
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

    // ✅ 只保留“目的地附加费”类：dest.province / dest.city
    const destOnly = arr.filter((s) => isDestSurcharge(s));

    // 展示：启用靠前；其余按 id 倒序（最近录入靠前）
    destOnly.sort((a, b) => {
      const aa = a.active ? 1 : 0;
      const bb = b.active ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return (b.id ?? 0) - (a.id ?? 0);
    });

    return destOnly;
  }, [list]);

  if (!rows.length) {
    return <div className={UI.surchargeEmpty}>暂无目的地附加费</div>;
  }

  return (
    <div className={UI.surchargeTableWrap}>
      <table className={UI.surchargeTable}>
        <thead>
          <tr className={UI.surchargeTheadRow}>
            <th className={UI.surchargeThIndex}>序号</th>
            <th className={UI.surchargeTh}>目的地</th>
            <th className={UI.surchargeThAmount}>每单加价（元）</th>
            <th className={UI.surchargeThState}>状态</th>
            <th className={UI.surchargeThOps}>操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((s, idx) => {
            const dest = extractDest(s);
            const amountText = extractFlatAmount(s);

            const destPill =
              dest.kind === "province"
                ? UI.surchargeDestPillProvince
                : dest.kind === "city"
                  ? UI.surchargeDestPillCity
                  : UI.surchargeDestPillOther;

            const statusPill = s.active ? UI.surchargeStatusOn : UI.surchargeStatusOff;

            return (
              <tr key={s.id} className={UI.surchargeTr}>
                <td className={UI.surchargeTdIndex}>{idx + 1}</td>

                <td className={UI.surchargeTd}>
                  <div className={UI.surchargeDestRow}>
                    <span className={`${UI.surchargeDestPillBase} ${destPill}`}>
                      {dest.kind === "province" ? "省" : dest.kind === "city" ? "城市" : "其他"}
                    </span>
                    <span className={UI.surchargeDestLabel}>{dest.label}</span>
                  </div>

                  <div className={UI.surchargeRuleName}>规则名：{normalizeName(s.name ?? "")}</div>
                </td>

                <td className={UI.surchargeTdAmount}>{amountText}</td>

                <td className={UI.surchargeTd}>
                  <span className={`${UI.surchargeStatusPillBase} ${statusPill}`}>{s.active ? "启用" : "停用"}</span>
                </td>

                <td className={UI.surchargeTd}>
                  <div className={UI.surchargeOpsRow}>
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

      <div className={UI.surchargeListHint}>提示：此处仅显示“目的地附加费（省/城市）”。异形件操作费在单独卡片维护。</div>
    </div>
  );
};

export default SurchargeList;
