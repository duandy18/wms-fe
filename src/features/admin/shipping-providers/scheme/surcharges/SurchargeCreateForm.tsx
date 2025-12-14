// src/features/admin/shipping-providers/scheme/surcharges/SurchargeCreateForm.tsx

import React, { useEffect, useMemo, useState } from "react";
import { UI } from "../../ui";
import { SURCHARGE_TEMPLATES, type SurchargeTemplateKey } from "./templates";
import { parseJsonObject, validateAmountJson } from "./validation";

export type CreateSurchargePayload = {
  name: string;
  priority: number;
  condition_json: Record<string, unknown>;
  amount_json: Record<string, unknown>;
};

type RoundingMode = "ceil" | "floor" | "round";

function parseCsvList(input: string): string[] {
  return input
    .split(/[,，\n]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function safeNum(v: string, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

function pickDefaultTemplateKey(): SurchargeTemplateKey {
  const keys = Object.keys(SURCHARGE_TEMPLATES) as SurchargeTemplateKey[];
  if (keys.includes("dest_city_flat" as SurchargeTemplateKey)) return "dest_city_flat" as SurchargeTemplateKey;
  if (keys.includes("bulky_flat" as SurchargeTemplateKey)) return "bulky_flat" as SurchargeTemplateKey;
  return (keys[0] ?? ("bulky_flat" as SurchargeTemplateKey)) as SurchargeTemplateKey;
}

function buildCondJsonByTemplate(templateKey: SurchargeTemplateKey, params: {
  destCities?: string[];
  destProvinces?: string[];
  flagAny?: string[];
}): Record<string, unknown> {
  // 目的地单票加价：按 dest.city / dest.province 命中
  if (templateKey === ("dest_city_flat" as SurchargeTemplateKey)) {
    return { dest: { city: params.destCities ?? [] } };
  }
  if (
    templateKey === ("dest_province_flat" as SurchargeTemplateKey) ||
    templateKey === ("remote_flat" as SurchargeTemplateKey)
  ) {
    return { dest: { province: params.destProvinces ?? [] } };
  }

  // 大件：flag_any
  if (templateKey === ("bulky_flat" as SurchargeTemplateKey)) {
    return { flag_any: params.flagAny ?? ["bulky"] };
  }

  // 其余：默认空条件（命中全量）
  return {};
}

function buildAmountJsonByTemplate(templateKey: SurchargeTemplateKey, params: {
  flatAmount?: number;
  perKgRate?: number;
  roundingMode?: RoundingMode;
  roundingStepKg?: number;
}): Record<string, unknown> {
  if (
    templateKey === ("dest_city_flat" as SurchargeTemplateKey) ||
    templateKey === ("dest_province_flat" as SurchargeTemplateKey) ||
    templateKey === ("remote_flat" as SurchargeTemplateKey) ||
    templateKey === ("bulky_flat" as SurchargeTemplateKey)
  ) {
    return { kind: "flat", amount: params.flatAmount ?? 0 };
  }

  if (templateKey === ("fuel_perkg" as SurchargeTemplateKey)) {
    return {
      kind: "per_kg",
      rate_per_kg: params.perKgRate ?? 0,
      rounding: { mode: params.roundingMode ?? "ceil", step_kg: params.roundingStepKg ?? 1.0 },
    };
  }

  // weight_table：保持模板 JSON，不在这里强行结构化（避免误改）
  return SURCHARGE_TEMPLATES[templateKey]?.amount_json
    ? (JSON.parse(SURCHARGE_TEMPLATES[templateKey].amount_json) as Record<string, unknown>)
    : { kind: "flat", amount: params.flatAmount ?? 0 };
}

export const SurchargeCreateForm: React.FC<{
  disabled?: boolean;
  onCreate: (payload: CreateSurchargePayload) => Promise<void>;
  onError: (msg: string) => void;
}> = ({ disabled, onCreate, onError }) => {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("100");

  const [templateKey, setTemplateKey] = useState<SurchargeTemplateKey>(pickDefaultTemplateKey());

  // 高级模式：允许直接编辑 JSON
  const [advanced, setAdvanced] = useState(false);

  // ===== 结构化字段（根据模板渲染） =====
  // dest.city / dest.province
  const [destCitiesText, setDestCitiesText] = useState("北京市, 上海市, 广州市, 深圳市");
  const [destProvincesText, setDestProvincesText] = useState("海南省, 青海省");

  // flag_any
  const [flagAnyText, setFlagAnyText] = useState("bulky");

  // 金额
  const [flatAmountText, setFlatAmountText] = useState("1.5");

  // per_kg
  const [perKgRateText, setPerKgRateText] = useState("0.5");
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("ceil");
  const [roundingStepText, setRoundingStepText] = useState("1.0");

  // ===== JSON 文本（高级编辑/预览） =====
  const [condJson, setCondJson] = useState("{}");
  const [amtJson, setAmtJson] = useState('{"kind":"flat","amount":1.5}');

  // 当模板切换时：重置结构化字段 + JSON（以模板为准）
  useEffect(() => {
    const tpl = SURCHARGE_TEMPLATES[templateKey];
    if (!tpl) return;

    // 默认把模板 JSON 装载进文本框（高级模式下可改）
    setCondJson(tpl.condition_json);
    setAmtJson(tpl.amount_json);

    // 同步一些常用模板的“结构化默认值”
    if (String(templateKey) === "dest_city_flat") {
      setFlatAmountText("1.5");
      // 若模板里本身带 city 列表，就从模板解析覆盖
      const parsed = parseJsonObject(tpl.condition_json);
      if (parsed.ok) {
        const cities = (((parsed.value.dest as any)?.city ?? []) as unknown[])
          .map((x) => String(x))
          .filter(Boolean);
        if (cities.length) setDestCitiesText(cities.join(", "));
      }
    }

    if (String(templateKey) === "dest_province_flat" || String(templateKey) === "remote_flat") {
      // 远程/省份模板默认金额不同也行（以模板为准）
      const amtParsed = parseJsonObject(tpl.amount_json);
      if (amtParsed.ok && String(amtParsed.value.kind).toLowerCase() === "flat") {
        const a = amtParsed.value.amount;
        if (typeof a === "number") setFlatAmountText(String(a));
      }
      const condParsed = parseJsonObject(tpl.condition_json);
      if (condParsed.ok) {
        const provs = (((condParsed.value.dest as any)?.province ?? []) as unknown[])
          .map((x) => String(x))
          .filter(Boolean);
        if (provs.length) setDestProvincesText(provs.join(", "));
      }
    }

    if (String(templateKey) === "bulky_flat") {
      setFlagAnyText("bulky");
      const amtParsed = parseJsonObject(tpl.amount_json);
      if (amtParsed.ok && String(amtParsed.value.kind).toLowerCase() === "flat") {
        const a = amtParsed.value.amount;
        if (typeof a === "number") setFlatAmountText(String(a));
      }
    }

    if (String(templateKey) === "fuel_perkg") {
      // 从模板里解析默认 rate/rounding
      const amtParsed = parseJsonObject(tpl.amount_json);
      if (amtParsed.ok) {
        const rate = amtParsed.value.rate_per_kg;
        if (typeof rate === "number") setPerKgRateText(String(rate));
        const r = amtParsed.value.rounding as any;
        if (r && typeof r === "object") {
          const m = String(r.mode || "ceil") as RoundingMode;
          const s = Number(r.step_kg || 1.0);
          setRoundingMode(m);
          setRoundingStepText(String(Number.isFinite(s) ? s : 1.0));
        }
      }
    }
  }, [templateKey]);

  // 根据结构化输入自动生成 JSON（非高级模式下）
  useEffect(() => {
    if (advanced) return;

    const destCities = parseCsvList(destCitiesText);
    const destProvinces = parseCsvList(destProvincesText);
    const flagAny = parseCsvList(flagAnyText);

    const flatAmount = safeNum(flatAmountText, 0);
    const perKgRate = safeNum(perKgRateText, 0);
    const roundingStepKg = safeNum(roundingStepText, 1.0);

    const condObj = buildCondJsonByTemplate(templateKey, { destCities, destProvinces, flagAny });
    const amtObj = buildAmountJsonByTemplate(templateKey, {
      flatAmount,
      perKgRate,
      roundingMode,
      roundingStepKg,
    });

    setCondJson(JSON.stringify(condObj, null, 2));
    setAmtJson(JSON.stringify(amtObj, null, 2));
  }, [
    advanced,
    templateKey,
    destCitiesText,
    destProvincesText,
    flagAnyText,
    flatAmountText,
    perKgRateText,
    roundingMode,
    roundingStepText,
  ]);

  // 解析/校验
  const condParsed = useMemo(() => parseJsonObject(condJson), [condJson]);
  const amtParsed = useMemo(() => parseJsonObject(amtJson), [amtJson]);
  const amtErr = useMemo(() => {
    if (!amtParsed.ok) return amtParsed.error;
    return validateAmountJson(amtParsed.value);
  }, [amtParsed]);

  const templateTip = SURCHARGE_TEMPLATES[templateKey]?.tip ?? "";

  const handleCreate = async () => {
    const n = name.trim();
    if (!n) {
      onError("附加费名称必填");
      return;
    }
    const pr = Number(priority);
    if (!Number.isFinite(pr) || pr < 0) {
      onError("优先级必须是 >=0 的数字");
      return;
    }
    if (!condParsed.ok) {
      onError(`condition_json 无效：${condParsed.error}`);
      return;
    }
    if (!amtParsed.ok) {
      onError(`amount_json 无效：${amtParsed.error}`);
      return;
    }
    if (amtErr) {
      onError(`amount_json 校验失败：${amtErr}`);
      return;
    }

    await onCreate({
      name: n,
      priority: pr,
      condition_json: condParsed.value,
      amount_json: amtParsed.value,
    });

    // reset（保留模板选择，方便连续录入）
    setName("");
    setPriority("100");
  };

  const isDestCity = String(templateKey) === "dest_city_flat";
  const isDestProvince = String(templateKey) === "dest_province_flat" || String(templateKey) === "remote_flat";
  const isBulky = String(templateKey) === "bulky_flat";
  const isFuel = String(templateKey) === "fuel_perkg";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-800">新增附加费（Surcharge）</div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={advanced}
            onChange={(e) => setAdvanced(e.target.checked)}
            disabled={disabled}
          />
          高级模式（可编辑 JSON）
        </label>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-slate-600">名称 *</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
            placeholder="如：目的地单票加价 / 偏远地区附加费"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">优先级</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="flex items-end">
          <button className={UI.btnPrimaryGreen} type="button" disabled={disabled} onClick={() => void handleCreate()}>
            新增附加费
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">模板</label>
          <select
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={templateKey}
            disabled={disabled}
            onChange={(e) => setTemplateKey(e.target.value as SurchargeTemplateKey)}
          >
            {Object.entries(SURCHARGE_TEMPLATES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <div className="mt-1 text-sm text-slate-600">提示：{templateTip}</div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">校验状态</label>
          <div className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <div>condition_json：{condParsed.ok ? "✅ OK" : `❌ ${condParsed.error}`}</div>
            <div>amount_json：{amtParsed.ok ? (amtErr ? `❌ ${amtErr}` : "✅ OK") : `❌ ${amtParsed.error}`}</div>
          </div>
        </div>
      </div>

      {/* ===== 结构化输入区（默认启用）===== */}
      {!advanced ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800">结构化输入（推荐）</div>
          <div className="mt-1 text-sm text-slate-600">
            你只需要填“目的地/金额/费率”，系统会自动生成 JSON，避免手填出错。
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
            {isDestCity ? (
              <>
                <div className="flex flex-col md:col-span-4">
                  <label className="text-sm text-slate-600">目的城市（逗号分隔）</label>
                  <input
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                    value={destCitiesText}
                    disabled={disabled}
                    onChange={(e) => setDestCitiesText(e.target.value)}
                    placeholder="北京市, 上海市, 广州市, 深圳市"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm text-slate-600">单票加价（元）</label>
                  <input
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                    value={flatAmountText}
                    disabled={disabled}
                    onChange={(e) => setFlatAmountText(e.target.value)}
                    placeholder="1.5"
                  />
                </div>
              </>
            ) : null}

            {isDestProvince ? (
              <>
                <div className="flex flex-col md:col-span-4">
                  <label className="text-sm text-slate-600">目的省份（逗号分隔）</label>
                  <input
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                    value={destProvincesText}
                    disabled={disabled}
                    onChange={(e) => setDestProvincesText(e.target.value)}
                    placeholder="海南省, 青海省"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm text-slate-600">单票加价（元）</label>
                  <input
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                    value={flatAmountText}
                    disabled={disabled}
                    onChange={(e) => setFlatAmountText(e.target.value)}
                    placeholder="8.0"
                  />
                </div>
              </>
            ) : null}

            {isBulky ? (
              <>
                <div className="flex flex-col md:col-span-4">
                  <label className="text-sm text-slate-600">触发 flags（flag_any，逗号分隔）</label>
                  <input
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                    value={flagAnyText}
                    disabled={disabled}
                    onChange={(e) => setFlagAnyText(e.target.value)}
                    placeholder="bulky"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm text-slate-600">单票加价（元）</label>
                  <input
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                    value={flatAmountText}
                    disabled={disabled}
                    onChange={(e) => setFlatAmountText(e.target.value)}
                    placeholder="2.0"
                  />
                </div>
              </>
            ) : null}

            {isFuel ? (
              <>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm text-slate-600">rate_per_kg（元/kg）</label>
                  <input
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                    value={perKgRateText}
                    disabled={disabled}
                    onChange={(e) => setPerKgRateText(e.target.value)}
                    placeholder="0.5"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm text-slate-600">rounding_mode</label>
                  <select
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
                    value={roundingMode}
                    disabled={disabled}
                    onChange={(e) => setRoundingMode(e.target.value as RoundingMode)}
                  >
                    <option value="ceil">ceil</option>
                    <option value="floor">floor</option>
                    <option value="round">round</option>
                  </select>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm text-slate-600">rounding_step_kg</label>
                  <input
                    className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                    value={roundingStepText}
                    disabled={disabled}
                    onChange={(e) => setRoundingStepText(e.target.value)}
                    placeholder="1.0"
                  />
                </div>
              </>
            ) : null}

            {!isDestCity && !isDestProvince && !isBulky && !isFuel ? (
              <div className="md:col-span-6 text-sm text-slate-600">
                当前模板建议使用高级模式编辑 JSON（例如重量阶梯 table）。
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ===== JSON 区（高级模式可编辑；非高级只读展示）===== */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">
            condition_json（命中条件）{advanced ? "（可编辑）" : "（自动生成）"}
          </label>
          <textarea
            className="mt-1 h-32 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
            value={condJson}
            onChange={(e) => setCondJson(e.target.value)}
            disabled={disabled || !advanced}
            readOnly={!advanced}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">
            amount_json（金额规则）{advanced ? "（可编辑）" : "（自动生成）"}
          </label>
          <textarea
            className="mt-1 h-32 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
            value={amtJson}
            onChange={(e) => setAmtJson(e.target.value)}
            disabled={disabled || !advanced}
            readOnly={!advanced}
          />
        </div>
      </div>

      <div className="mt-2 text-sm text-slate-600">
        常用 amount kind：flat / per_kg / table。推荐用“结构化输入”避免 JSON 手滑。
      </div>
    </div>
  );
};
