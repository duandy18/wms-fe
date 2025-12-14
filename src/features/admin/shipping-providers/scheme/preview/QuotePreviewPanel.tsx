// src/features/admin/shipping-providers/scheme/preview/QuotePreviewPanel.tsx
//
// Scheme 算价预览（体检台）
// - 目的：在主数据页直接验证“当前 Scheme 是否可命中、命中哪个 Zone/Bracket、费用分解是什么”
// - 调用后端：POST /shipping-quote/calc（单 scheme）
// - 输出：quote_status / total_amount / zone / bracket / breakdown / weight / reason
//
// 注意：当前后端 calc 返回 reason（单字段）；recommend 才有 reasons[]。
// 这里先做“体检可命中 + 分解可看懂”，reasons[] 后续可升级 calc 接口。

import React, { useMemo, useState } from "react";
// ✅ 关键修复：从 preview 目录回到 src 需要 5 个 ..
// preview → scheme → shipping-providers → admin → features → src
import { apiPost } from "../../../../../lib/api";
import { UI } from "../../ui";

type QuoteStatus = "OK" | "MANUAL_REQUIRED" | string;

type CalcOut = {
  ok: boolean;
  quote_status: QuoteStatus;
  currency?: string | null;
  total_amount?: number | null;
  breakdown: {
    base?: Record<string, unknown>;
    surcharges?: Array<{
      id: number;
      name: string;
      amount: number;
      detail?: Record<string, unknown>;
      condition?: Record<string, unknown>;
    }>;
  };
  zone?: Record<string, unknown> | null;
  bracket?: Record<string, unknown> | null;
  weight: Record<string, unknown>;
  reason?: string | null;
};

function safeText(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const s = String(v);
  return s.trim() ? s : "—";
}
function safeMoney(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}
function safeNum(v: unknown, digits = 3): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export const QuotePreviewPanel: React.FC<{
  schemeId: number;
  schemeName?: string;
  disabled?: boolean;
  onError: (msg: string) => void;
}> = ({ schemeId, schemeName, disabled, onError }) => {
  const [province, setProvince] = useState("广东省");
  const [city, setCity] = useState("深圳市");
  const [district, setDistrict] = useState("南山区");

  const [realWeightKg, setRealWeightKg] = useState("2.36");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [flags, setFlags] = useState(""); // 逗号分隔：bulky,cold,fragile...

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcOut | null>(null);

  const parsedReal = useMemo(() => Number(realWeightKg), [realWeightKg]);

  // ✅ dims：必须三项都填才生效；否则视为不填（避免半填导致误会）
  const dims = useMemo(() => {
    const lt = lengthCm.trim();
    const wt = widthCm.trim();
    const ht = heightCm.trim();
    if (!lt && !wt && !ht) return null;
    if (!lt || !wt || !ht) return null;

    const l = Number(lt);
    const w = Number(wt);
    const h = Number(ht);
    if (!Number.isFinite(l) || !Number.isFinite(w) || !Number.isFinite(h)) return null;
    if (l < 0 || w < 0 || h < 0) return null;
    return { length_cm: l, width_cm: w, height_cm: h };
  }, [lengthCm, widthCm, heightCm]);

  const flagsList = useMemo(() => {
    return flags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [flags]);

  const handleCalc = async () => {
    if (!schemeId) {
      onError("缺少 scheme_id");
      return;
    }
    if (!Number.isFinite(parsedReal) || parsedReal <= 0) {
      onError("real_weight_kg 必须是 > 0 的数字");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const body: Record<string, unknown> = {
        scheme_id: schemeId,
        dest: { province, city, district },
        real_weight_kg: parsedReal,
        flags: flagsList,
      };

      if (dims) {
        body["length_cm"] = dims.length_cm;
        body["width_cm"] = dims.width_cm;
        body["height_cm"] = dims.height_cm;
      }

      const res = await apiPost<CalcOut>("/shipping-quote/calc", body);
      setResult(res);
    } catch (e: any) {
      onError(e?.message ?? "算价失败");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const zoneName = safeText((result?.zone as any)?.name ?? (result?.zone as any)?.id);
  const bracketId = safeText((result?.bracket as any)?.id);
  const bw = (result?.weight as any)?.billable_weight_kg ?? (result?.weight as any)?.billable_weight_kg_raw;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">算价预览（体检台）</div>
        <div className="mt-1 text-sm text-slate-600">
          用于验证：当前 Scheme 是否能命中 Zone/Bracket，费用分解是否合理。
        </div>
        <div className="mt-2 text-sm text-slate-600">
          当前方案：<span className="font-mono">#{schemeId}</span>{" "}
          {schemeName ? <span className="font-mono">· {schemeName}</span> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-800">输入条件</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">省</label>
            <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base" value={province} disabled={disabled} onChange={(e) => setProvince(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">市</label>
            <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base" value={city} disabled={disabled} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">区/县</label>
            <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base" value={district} disabled={disabled} onChange={(e) => setDistrict(e.target.value)} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">实重（kg）*</label>
            <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono" value={realWeightKg} disabled={disabled} onChange={(e) => setRealWeightKg(e.target.value)} />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-slate-600">flags（逗号分隔，可选）</label>
            <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono" value={flags} disabled={disabled} onChange={(e) => setFlags(e.target.value)} placeholder="例如：bulky,cold" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">长（cm，可选）</label>
            <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono" value={lengthCm} disabled={disabled} onChange={(e) => setLengthCm(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">宽（cm，可选）</label>
            <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono" value={widthCm} disabled={disabled} onChange={(e) => setWidthCm(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">高（cm，可选）</label>
            <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono" value={heightCm} disabled={disabled} onChange={(e) => setHeightCm(e.target.value)} />
          </div>

          <div className="flex items-end">
            <button className={UI.btnPrimaryGreen} type="button" disabled={disabled || loading} onClick={() => void handleCalc()}>
              {loading ? "算价中…" : "开始算价"}
            </button>
          </div>
        </div>

        {(!lengthCm.trim() && !widthCm.trim() && !heightCm.trim()) ? null : dims ? null : (
          <div className="mt-2 text-sm text-amber-700">
            体积重：需要同时填写 长/宽/高 三项才会参与计算（否则按未填写处理）。
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold text-slate-800">算价结果</div>

        {!result ? (
          <div className="mt-2 text-sm text-slate-600">尚未算价。请填写条件后点击“开始算价”。</div>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">状态</div>
                <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{safeText(result.quote_status)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">总价</div>
                <div className="mt-1 text-base font-semibold text-slate-900 font-mono">
                  {result.total_amount == null ? "—" : `￥${safeMoney(result.total_amount)}`}
                </div>
                <div className="mt-1 text-sm text-slate-500 font-mono">{safeText(result.currency ?? "CNY")}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">命中 Zone</div>
                <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{zoneName}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">命中 Bracket</div>
                <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{bracketId}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-800">计费重量</div>
              <div className="mt-2 text-sm text-slate-700">
                实重：<span className="font-mono">{safeNum((result.weight as any)?.real_weight_kg, 3)}kg</span>{" · "}
                体积重：<span className="font-mono">{safeNum((result.weight as any)?.vol_weight_kg, 3)}kg</span>{" · "}
                计费重：<span className="font-mono">{safeNum(bw, 3)}kg</span>
              </div>
            </div>

            {result.reason ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="font-semibold">提示 / 原因</div>
                <div className="mt-1 font-mono">{result.reason}</div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-800">费用分解</div>

              <div className="mt-2 text-sm text-slate-700">
                base：<span className="ml-2 font-mono">￥{safeMoney((result.breakdown?.base as any)?.amount)}</span>
              </div>

              {result.breakdown?.surcharges?.length ? (
                <div className="mt-2 space-y-1">
                  {result.breakdown.surcharges.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-sm text-slate-700">
                        <span className="font-mono">{s.name}</span>
                      </div>
                      <div className="text-sm font-mono text-slate-900">￥{safeMoney(s.amount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-sm text-slate-500">无附加费</div>
              )}

              <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-800">
                总计：<span className="ml-2 font-mono text-base font-semibold">
                  {result.total_amount == null ? "—" : `￥${safeMoney(result.total_amount)}`}
                </span>
              </div>
            </div>

            <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">查看原始 JSON</summary>
              <pre className="mt-3 overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-700">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
