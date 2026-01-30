// src/features/ops/pricing-ops/PricingOpsSchemeDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PricingOpsApi } from "./api";
import type {
  ArchivedTemplateStillReferencedIssue,
  ArchivedZoneIssue,
  FixArchiveReleaseOut,
  FixDetachBracketsOut,
  FixUnbindArchivedTemplatesOut,
  PricingIntegrityReport,
  ReleasedZoneStillPricedIssue,
} from "./types";
import { OpsSectionCard } from "./components/OpsSectionCard";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export default function PricingOpsSchemeDetailPage() {
  const { schemeId } = useParams();
  const sid = Number(schemeId || "");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState<PricingIntegrityReport | null>(null);

  const [dryBlocking, setDryBlocking] = useState<FixArchiveReleaseOut | null>(null);
  const [dryBrackets, setDryBrackets] = useState<FixDetachBracketsOut | null>(null);
  const [dryTpl, setDryTpl] = useState<FixUnbindArchivedTemplatesOut | null>(null);

  const summary = useMemo(() => {
    if (!report) return "未加载";
    const s = (report as unknown as { summary?: { blocking?: number; warning?: number } }).summary;
    const b = typeof s?.blocking === "number" ? s.blocking : 0;
    const w = typeof s?.warning === "number" ? s.warning : 0;
    return `blocking=${b} / warning=${w}`;
  }, [report]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await PricingOpsApi.getReport(sid);
      setReport(r);
      setDryBlocking(null);
      setDryBrackets(null);
      setDryTpl(null);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(sid) || sid <= 0) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  if (!Number.isFinite(sid) || sid <= 0) return <Navigate to="/ops/pricing-ops" replace />;

  async function runDryBlocking(zones: ArchivedZoneIssue[]) {
    const zoneIds = zones.map((z) => z.zone_id);
    const out = await PricingOpsApi.fixArchiveRelease({
      scheme_id: sid,
      zone_ids: zoneIds,
      dry_run: true,
    });
    setDryBlocking(out);
  }

  async function runExecBlocking(zones: ArchivedZoneIssue[]) {
    if (!window.confirm("确认执行：归档-释放省份？")) return;
    const zoneIds = zones.map((z) => z.zone_id);
    await PricingOpsApi.fixArchiveRelease({
      scheme_id: sid,
      zone_ids: zoneIds,
      dry_run: false,
    });
    await load();
  }

  async function runDryDetachBrackets(zones: ReleasedZoneStillPricedIssue[]) {
    const zoneIds = zones.map((z) => z.zone_id);
    const out = await PricingOpsApi.fixDetachBrackets({
      scheme_id: sid,
      zone_ids: zoneIds,
      dry_run: true,
    });
    setDryBrackets(out);
  }

  async function runExecDetachBrackets(zones: ReleasedZoneStillPricedIssue[]) {
    if (!window.confirm("确认执行：清理 Zone 报价明细（brackets）？")) return;
    const zoneIds = zones.map((z) => z.zone_id);
    await PricingOpsApi.fixDetachBrackets({
      scheme_id: sid,
      zone_ids: zoneIds,
      dry_run: false,
    });
    await load();
  }

  async function runDryUnbindArchivedTemplates(tpls: ArchivedTemplateStillReferencedIssue[]) {
    const templateIds = tpls.map((t) => t.template_id);
    const out = await PricingOpsApi.fixUnbindArchivedTemplates({
      scheme_id: sid,
      template_ids: templateIds,
      dry_run: true,
    });
    setDryTpl(out);
  }

  async function runExecUnbindArchivedTemplates(tpls: ArchivedTemplateStillReferencedIssue[]) {
    if (!window.confirm("确认执行：解绑归档模板引用？")) return;
    const templateIds = tpls.map((t) => t.template_id);
    await PricingOpsApi.fixUnbindArchivedTemplates({
      scheme_id: sid,
      template_ids: templateIds,
      dry_run: false,
    });
    await load();
  }

  const blockingIssues = report?.archived_zones_still_occupying || [];
  const bracketsIssues = report?.released_zones_still_priced || [];
  const templateIssues = report?.archived_templates_still_referenced || [];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>运价运维中心 · 方案详情</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
            scheme_id={sid} / {summary}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/ops/pricing-ops"
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 10, textDecoration: "none" }}
          >
            返回总览
          </Link>
          <button onClick={load} disabled={loading} style={{ padding: "8px 12px" }}>
            {loading ? "刷新中…" : "刷新"}
          </button>
        </div>
      </div>

      {err ? <div style={{ marginTop: 12, color: "#b91c1c" }}>{err}</div> : null}

      <OpsSectionCard
        title="blocking：假归档仍占用省份"
        subtitle="active=false 但 province members 仍存在，会阻塞新建/修改。"
        right={
          blockingIssues.length > 0 ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => runDryBlocking(blockingIssues)} style={{ padding: "8px 12px" }}>
                dry-run
              </button>
              <button onClick={() => runExecBlocking(blockingIssues)} style={{ padding: "8px 12px" }}>
                执行修复
              </button>
            </div>
          ) : null
        }
      >
        <IssueListBlocking issues={blockingIssues} />
        {dryBlocking ? (
          <pre style={{ marginTop: 12, fontSize: 12 }}>{JSON.stringify(dryBlocking, null, 2)}</pre>
        ) : null}
      </OpsSectionCard>

      <OpsSectionCard
        title="warning：已释放 Zone 仍残留报价明细"
        subtitle="members=0 但仍有 brackets，会污染二维矩阵/解释/审计。"
        right={
          bracketsIssues.length > 0 ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => runDryDetachBrackets(bracketsIssues)} style={{ padding: "8px 12px" }}>
                dry-run
              </button>
              <button onClick={() => runExecDetachBrackets(bracketsIssues)} style={{ padding: "8px 12px" }}>
                执行修复
              </button>
            </div>
          ) : null
        }
      >
        <IssueListBrackets issues={bracketsIssues} />
        {dryBrackets ? (
          <pre style={{ marginTop: 12, fontSize: 12 }}>{JSON.stringify(dryBrackets, null, 2)}</pre>
        ) : null}
      </OpsSectionCard>

      <OpsSectionCard
        title="warning：归档模板仍被引用"
        subtitle="template.status=archived 但仍被 zones.segment_template_id 引用（系统护栏已加入）。"
        right={
          templateIssues.length > 0 ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => runDryUnbindArchivedTemplates(templateIssues)} style={{ padding: "8px 12px" }}>
                dry-run
              </button>
              <button onClick={() => runExecUnbindArchivedTemplates(templateIssues)} style={{ padding: "8px 12px" }}>
                执行修复
              </button>
            </div>
          ) : null
        }
      >
        <IssueListTemplates issues={templateIssues} />
        {dryTpl ? <pre style={{ marginTop: 12, fontSize: 12 }}>{JSON.stringify(dryTpl, null, 2)}</pre> : null}
      </OpsSectionCard>
    </div>
  );
}

function IssueListBlocking(props: { issues: ArchivedZoneIssue[] }) {
  if (!props.issues.length) return <div style={{ color: "#6b7280", fontSize: 12 }}>无</div>;
  return (
    <div style={{ fontSize: 12 }}>
      {props.issues.map((x) => (
        <div key={x.zone_id} style={{ padding: "8px 0", borderBottom: "1px dashed #e5e7eb" }}>
          <div>
            <b>zone#{x.zone_id}</b> {x.zone_name} / active={String(x.zone_active)} / 省份={x.province_member_n}
          </div>
          <div style={{ color: "#6b7280" }}>{x.province_members.join("、")}</div>
        </div>
      ))}
    </div>
  );
}

function IssueListBrackets(props: { issues: ReleasedZoneStillPricedIssue[] }) {
  if (!props.issues.length) return <div style={{ color: "#6b7280", fontSize: 12 }}>无</div>;
  return (
    <div style={{ fontSize: 12 }}>
      {props.issues.map((x) => (
        <div key={x.zone_id} style={{ padding: "8px 0", borderBottom: "1px dashed #e5e7eb" }}>
          <div>
            <b>zone#{x.zone_id}</b> {x.zone_name} / active={String(x.zone_active)} / brackets={x.brackets_n} / tpl=
            {x.segment_template_id ?? "null"}
          </div>
          <div style={{ color: "#6b7280" }}>members=0（已释放）但仍存在报价明细</div>
        </div>
      ))}
    </div>
  );
}

function IssueListTemplates(props: { issues: ArchivedTemplateStillReferencedIssue[] }) {
  if (!props.issues.length) return <div style={{ color: "#6b7280", fontSize: 12 }}>无</div>;
  return (
    <div style={{ fontSize: 12 }}>
      {props.issues.map((x) => (
        <div key={x.template_id} style={{ padding: "8px 0", borderBottom: "1px dashed #e5e7eb" }}>
          <div>
            <b>template#{x.template_id}</b> {x.template_name} / status={x.template_status} / refs={x.referencing_zone_n}
          </div>
          <div style={{ color: "#6b7280" }}>{x.referencing_zone_ids.slice(0, 20).join(", ")}</div>
        </div>
      ))}
    </div>
  );
}
