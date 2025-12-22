// src/features/dev/shipping-pricing/components/ShippingRecordReconcile.tsx
//
// C) Pilot 运单对照：拉运单 → 尝试抽取 dest/weight/flags/quote_snapshot → 回填 Lab → 差异对照
// 注意：后端 ShippingRecord 字段不保证含 dest；我们尽最大努力从 meta 中抽取，抽不到就让用户手填。

import React, { useMemo, useState } from "react";
import { fetchShippingRecordById, fetchShippingRecordsByRef, type ShippingRecord } from "../../../inventory/shipping-records/api";
import { safeJson } from "../labUtils";

type Props = {
  // 当前 Lab 的 calc total（可选，用于 diff）
  calcTotalAmount: number | null;

  // 回填能力
  setProvince: (v: string) => void;
  setCity: (v: string) => void;
  setDistrict: (v: string) => void;
  setRealWeightKg: (v: string) => void;
  setFlags: (v: string) => void;
  setSchemeIdText: (v: string) => void;
};

function pickStr(obj: unknown, keys: string[]): string | null {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function pickNum(obj: unknown, keys: string[]): number | null {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function pickObj(obj: unknown, keys: string[]): Record<string, unknown> | null {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  }
  return null;
}

function tryExtractFromMeta(meta: Record<string, unknown> | null | undefined) {
  const m = meta ?? null;
  if (!m) return { province: null as string | null, city: null as string | null, district: null as string | null, flags: null as string | null, schemeId: null as number | null };

  const quoteSnapshot = pickObj(m, ["quote_snapshot", "quote", "quoteMeta", "quote_meta"]);
  const dest =
    pickObj(m, ["dest", "address", "receiver", "shipping_dest"]) ??
    (quoteSnapshot ? pickObj(quoteSnapshot, ["dest", "address", "receiver"]) : null);

  const province = pickStr(dest, ["province", "prov"]) ?? pickStr(m, ["province", "receiver_province"]);
  const city = pickStr(dest, ["city"]) ?? pickStr(m, ["city", "receiver_city"]);
  const district = pickStr(dest, ["district"]) ?? pickStr(m, ["district", "receiver_district"]);

  const flagsArr = (() => {
    const arr = (quoteSnapshot && (quoteSnapshot["flags"] as unknown)) ?? (m["flags"] as unknown);
    if (Array.isArray(arr)) return arr.map((x) => String(x)).filter(Boolean);
    return null;
  })();
  const flags = flagsArr ? flagsArr.join(",") : null;

  const schemeId =
    (quoteSnapshot ? pickNum(quoteSnapshot, ["scheme_id"]) : null) ??
    pickNum(m, ["scheme_id"]);

  return { province, city, district, flags, schemeId };
}

export const ShippingRecordReconcile: React.FC<Props> = (p) => {
  const [recordIdText, setRecordIdText] = useState("");
  const [orderRef, setOrderRef] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [record, setRecord] = useState<ShippingRecord | null>(null);

  const found = useMemo(() => {
    if (!record) return null;
    const meta = record.meta ?? null;
    const ex = tryExtractFromMeta(meta);

    const w = record.weight_kg != null ? Number(record.weight_kg) : null;

    const costReal = record.cost_real != null ? Number(record.cost_real) : null;
    const costEst = record.cost_estimated != null ? Number(record.cost_estimated) : null;

    return { ex, w, costReal, costEst };
  }, [record]);

  const run = async () => {
    setErr(null);
    setLoading(true);
    setRecord(null);
    try {
      const id = Number(recordIdText.trim());
      if (Number.isFinite(id) && id > 0) {
        const r = await fetchShippingRecordById(Math.trunc(id));
        setRecord(r);
        return;
      }
      const ref = orderRef.trim();
      if (!ref) {
        setErr("请输入 shipping_record id 或 order_ref");
        return;
      }
      const list = await fetchShippingRecordsByRef(ref);
      if (!list.length) {
        setErr("该 order_ref 未找到 shipping_records");
        return;
      }
      // 取最大 id 的记录
      const picked = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0] ?? null;
      setRecord(picked);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "拉取 shipping record 失败");
    } finally {
      setLoading(false);
    }
  };

  const applyToLab = () => {
    if (!record || !found) return;

    // weight：优先 record.weight_kg
    if (found.w != null && Number.isFinite(found.w)) {
      p.setRealWeightKg(String(found.w));
    }

    // dest：从 meta 尝试提取
    if (found.ex.province) p.setProvince(found.ex.province);
    if (found.ex.city) p.setCity(found.ex.city);
    if (found.ex.district) p.setDistrict(found.ex.district);

    // flags
    if (found.ex.flags) p.setFlags(found.ex.flags);

    // schemeId（如果存在）
    if (found.ex.schemeId != null) p.setSchemeIdText(String(found.ex.schemeId));
  };

  const diff = useMemo(() => {
    if (!found) return null;
    const real = found.costReal;
    const est = found.costEst;
    const calc = p.calcTotalAmount;

    const baseline = real ?? est ?? null;
    if (baseline == null || calc == null) return null;

    const d = calc - baseline;
    return { baseline, calc, delta: d };
  }, [found, p.calcTotalAmount]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">运单对照（Pilot Reconcile）</div>
      <div className="mt-1 text-xs text-slate-500">拉取 shipping_record → 回填 Lab → 与 cost_real/cost_estimated 做差异对照。</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="md:col-span-2">
          <label className="text-xs text-slate-600">shipping_record id</label>
          <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono" value={recordIdText} onChange={(e) => setRecordIdText(e.target.value)} placeholder="例如 123" />
        </div>
        <div className="md:col-span-4">
          <label className="text-xs text-slate-600">order_ref（或平台 ref）</label>
          <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} placeholder="例如 PDD-xxx / 订单ref" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className={"rounded-xl px-3 py-2 text-xs font-semibold " + (loading ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800")}
          onClick={() => void run()}
          disabled={loading}
        >
          {loading ? "加载中…" : "拉取运单"}
        </button>

        <button
          type="button"
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          onClick={applyToLab}
          disabled={!record || loading}
          title="将能抽取到的字段回填到 Lab 表单（可再手工修正）"
        >
          回填到 Lab
        </button>

        {err ? <span className="text-sm text-red-700">{err}</span> : null}
      </div>

      {!record ? (
        <div className="mt-3 text-sm text-slate-500">尚未加载运单。</div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div className="font-mono">id={record.id} · ref={record.order_ref}</div>
            <div className="mt-1 font-mono">
              carrier={record.carrier_name ?? "-"}({record.carrier_code ?? "-"}) · tracking={record.tracking_no ?? "-"}
            </div>
            <div className="mt-1 font-mono">
              weight_kg={record.weight_kg ?? "—"} · cost_est={record.cost_estimated ?? "—"} · cost_real={record.cost_real ?? "—"}
            </div>
          </div>

          {found ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs font-semibold text-slate-700">抽取结果（用于回填）</div>
              <pre className="mt-2 max-h-[220px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-700">
                {safeJson(found)}
              </pre>
            </div>
          ) : null}

          {diff ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="font-semibold">差异对照（calc_total - cost）</div>
              <div className="mt-2 font-mono text-xs">
                cost={diff.baseline.toFixed(2)} · calc={diff.calc.toFixed(2)} · delta={diff.delta.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              提示：先用 Lab 跑出 calc（左侧），并且运单需有 cost_estimated 或 cost_real，才能自动 diff。
            </div>
          )}

          <details className="rounded-xl border border-slate-200 bg-white p-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-700">查看原始 ShippingRecord JSON</summary>
            <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-700">
              {safeJson(record)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ShippingRecordReconcile;
