// src/features/dev/shipping-pricing/components/ReproTools.tsx
//
// A) 复现链接生成器：复制 URL + curl（calc / recommend）

import React, { useMemo, useState } from "react";

type Props = {
  schemeId: number | null;
  province: string;
  city: string;
  district: string;
  realWeightKg: string;
  flags: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
};

function buildQuery(p: Props): URLSearchParams {
  const qs = new URLSearchParams();
  qs.set("panel", "shipping-pricing-lab");

  if (p.schemeId != null && p.schemeId > 0) qs.set("scheme_id", String(p.schemeId));

  const prov = p.province.trim();
  const city = p.city.trim();
  const dist = p.district.trim();
  const w = p.realWeightKg.trim();
  const flags = p.flags.trim();

  if (prov) qs.set("province", prov);
  if (city) qs.set("city", city);
  if (dist) qs.set("district", dist);
  if (w) qs.set("real_weight_kg", w);
  if (flags) qs.set("flags", flags);

  const l = p.lengthCm.trim();
  const wcm = p.widthCm.trim();
  const h = p.heightCm.trim();
  if (l) qs.set("length_cm", l);
  if (wcm) qs.set("width_cm", wcm);
  if (h) qs.set("height_cm", h);

  return qs;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      // fallback：让用户手动复制
      window.prompt("复制下面内容：", text);
      return true;
    } catch {
      return false;
    }
  }
}

export const ReproTools: React.FC<Props> = (p) => {
  const [msg, setMsg] = useState<string | null>(null);

  const reproUrl = useMemo(() => {
    const qs = buildQuery(p);
    return `${window.location.origin}/dev?${qs.toString()}`;
  }, [p]);

  const payloadCalc = useMemo(() => {
    const body: Record<string, unknown> = {
      scheme_id: p.schemeId ?? 0,
      dest: {
        province: p.province.trim() || null,
        city: p.city.trim() || null,
        district: p.district.trim() || null,
      },
      real_weight_kg: Number(p.realWeightKg.trim() || "0"),
      flags: (p.flags ?? "").split(",").map((x) => x.trim()).filter(Boolean),
    };
    const l = p.lengthCm.trim();
    const w = p.widthCm.trim();
    const h = p.heightCm.trim();
    if (l && w && h) {
      body["length_cm"] = Number(l);
      body["width_cm"] = Number(w);
      body["height_cm"] = Number(h);
    }
    return body;
  }, [p]);

  const payloadRecommend = useMemo(() => {
    const body: Record<string, unknown> = {
      provider_ids: [],
      dest: {
        province: p.province.trim() || null,
        city: p.city.trim() || null,
        district: p.district.trim() || null,
      },
      real_weight_kg: Number(p.realWeightKg.trim() || "0"),
      flags: (p.flags ?? "").split(",").map((x) => x.trim()).filter(Boolean),
      max_results: 10,
    };
    const l = p.lengthCm.trim();
    const w = p.widthCm.trim();
    const h = p.heightCm.trim();
    if (l && w && h) {
      body["length_cm"] = Number(l);
      body["width_cm"] = Number(w);
      body["height_cm"] = Number(h);
    }
    return body;
  }, [p]);

  const curlCalc = useMemo(() => {
    return [
      'API_BASE="http://127.0.0.1:8000"',
      "export WMS_TOKEN=...",
      "curl -s -X POST \"$API_BASE/shipping-quote/calc\" \\",
      "  -H \"Authorization: Bearer $WMS_TOKEN\" \\",
      "  -H \"Content-Type: application/json\" \\",
      `  -d '${JSON.stringify(payloadCalc)}' | jq`,
    ].join("\n");
  }, [payloadCalc]);

  const curlRecommend = useMemo(() => {
    return [
      'API_BASE="http://127.0.0.1:8000"',
      "export WMS_TOKEN=...",
      "curl -s -X POST \"$API_BASE/shipping-quote/recommend\" \\",
      "  -H \"Authorization: Bearer $WMS_TOKEN\" \\",
      "  -H \"Content-Type: application/json\" \\",
      `  -d '${JSON.stringify(payloadRecommend)}' | jq`,
    ].join("\n");
  }, [payloadRecommend]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">复现工具（链接 / curl）</div>
      <div className="mt-1 text-xs text-slate-500">用于把“问题”变成可复现的证据。</div>

      <div className="mt-3 space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-700">复现链接（打开即回填）</div>
          <div className="mt-2 flex gap-2">
            <input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono" value={reproUrl} readOnly />
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => void (async () => {
                const ok = await copyText(reproUrl);
                setMsg(ok ? "已复制复现链接" : "复制失败");
                setTimeout(() => setMsg(null), 1200);
              })()}
            >
              复制
            </button>
          </div>
        </div>

        <details className="rounded-xl border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-xs font-semibold text-slate-700">复制 curl（calc）</summary>
          <div className="mt-2 flex gap-2">
            <pre className="w-full overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] font-mono text-slate-700">
              {curlCalc}
            </pre>
            <button
              type="button"
              className="h-fit rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => void (async () => {
                const ok = await copyText(curlCalc);
                setMsg(ok ? "已复制 curl(calc)" : "复制失败");
                setTimeout(() => setMsg(null), 1200);
              })()}
            >
              复制
            </button>
          </div>
        </details>

        <details className="rounded-xl border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-xs font-semibold text-slate-700">复制 curl（recommend）</summary>
          <div className="mt-2 flex gap-2">
            <pre className="w-full overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] font-mono text-slate-700">
              {curlRecommend}
            </pre>
            <button
              type="button"
              className="h-fit rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => void (async () => {
                const ok = await copyText(curlRecommend);
                setMsg(ok ? "已复制 curl(recommend)" : "复制失败");
                setTimeout(() => setMsg(null), 1200);
              })()}
            >
              复制
            </button>
          </div>
        </details>

        {msg ? <div className="text-xs text-emerald-700">{msg}</div> : null}
      </div>
    </div>
  );
};

export default ReproTools;
