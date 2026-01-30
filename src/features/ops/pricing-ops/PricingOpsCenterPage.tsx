// src/features/ops/pricing-ops/PricingOpsCenterPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PricingOpsApi } from "./api";
import type { PricingIntegrityReport, PricingSchemeListItem } from "./types";
import { OpsSectionCard } from "./components/OpsSectionCard";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

type Summary = { blocking: number; warning: number };

function isSummary(x: unknown): x is Summary {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.blocking === "number" && typeof o.warning === "number";
}

function getSafeSummary(report: PricingIntegrityReport | null): Summary {
  if (!report) return { blocking: 0, warning: 0 };
  const maybe = (report as Record<string, unknown>)["summary"];
  if (isSummary(maybe)) return maybe;
  return { blocking: 0, warning: 0 };
}

export default function PricingOpsCenterPage() {
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [schemesErr, setSchemesErr] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<PricingSchemeListItem[]>([]);

  const [schemeId, setSchemeId] = useState<number | null>(null);

  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<PricingIntegrityReport | null>(null);
  const [reportErr, setReportErr] = useState<string | null>(null);

  const summaryText = useMemo(() => {
    const { blocking, warning } = getSafeSummary(report);
    return `blocking=${blocking} / warning=${warning}`;
  }, [report]);

  const selectedScheme = useMemo(
    () => (schemeId ? schemes.find((s) => s.id === schemeId) || null : null),
    [schemes, schemeId],
  );

  async function loadSchemes() {
    setSchemesLoading(true);
    setSchemesErr(null);
    try {
      const r = await PricingOpsApi.listActiveSchemesGlobal();
      const list = (r.data || []).filter((x) => x.active === true);
      setSchemes(list);

      if (list.length > 0) {
        setSchemeId((prev) => {
          if (prev && list.some((x) => x.id === prev)) return prev;
          return list[0].id;
        });
      } else {
        setSchemeId(null);
      }
    } catch (e: unknown) {
      setSchemesErr(getErrorMessage(e));
      setSchemes([]);
      setSchemeId(null);
    } finally {
      setSchemesLoading(false);
    }
  }

  async function loadReport() {
    if (!schemeId) return;
    setReportLoading(true);
    setReportErr(null);
    try {
      const r = await PricingOpsApi.getReport(schemeId);
      setReport(r);
    } catch (e: unknown) {
      setReportErr(getErrorMessage(e));
      setReport(null);
    } finally {
      setReportLoading(false);
    }
  }

  useEffect(() => {
    void loadSchemes();
     
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>运价运维中心</div>

      <OpsSectionCard
        title="选择方案"
        subtitle="下拉只展示全局 active 方案（跨快递网点）。"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={loadSchemes} disabled={schemesLoading} style={{ padding: "8px 12px" }}>
              {schemesLoading ? "刷新中…" : "刷新方案列表"}
            </button>
            <button onClick={loadReport} disabled={reportLoading || !schemeId} style={{ padding: "8px 12px" }}>
              {reportLoading ? "加载中…" : "加载报告"}
            </button>
          </div>
        }
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>active 方案</div>
          <select
            value={schemeId ?? ""}
            onChange={(e) => setSchemeId(e.target.value ? Number(e.target.value) : null)}
            style={{ minWidth: 520, padding: "6px 8px" }}
          >
            {schemes.length === 0 ? <option value="">（无可用方案）</option> : null}
            {schemes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shipping_provider_name} · {s.name} (#{s.id})
              </option>
            ))}
          </select>

          <div style={{ fontSize: 12, color: "#6b7280" }}>健康度</div>
          <div style={{ fontFamily: "monospace" }}>{summaryText}</div>
        </div>

        {schemesErr ? <div style={{ marginTop: 10, color: "#b91c1c" }}>{schemesErr}</div> : null}
        {reportErr ? <div style={{ marginTop: 10, color: "#b91c1c" }}>{reportErr}</div> : null}

        {selectedScheme ? (
          <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
            当前选择：{selectedScheme.shipping_provider_name} / scheme_id={selectedScheme.id}
          </div>
        ) : null}
      </OpsSectionCard>

      <OpsSectionCard title="快捷入口" subtitle="站内跳转（不刷新页面），不会触发重新登录。">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to={schemeId ? `/ops/pricing-ops/schemes/${schemeId}` : "/ops/pricing-ops"}
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 10, textDecoration: "none" }}
          >
            打开方案详情
          </Link>

          <Link
            to="/ops/pricing-ops/cleanup"
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 10, textDecoration: "none" }}
          >
            方案壳清理
          </Link>
        </div>
      </OpsSectionCard>
    </div>
  );
}
