// src/features/dev/shipping-pricing/components/SchemeHealthScan.tsx
//
// B) Scheme Health Scan：基于当前主线合同做结构一致性扫描
// - 不做“业务推断”，只做当前 detail 结构的静态检查
// - 旧 bracket 覆盖/空洞/重叠扫描已退场，因为主域不再输出 zone.brackets

import React, { useMemo, useState } from "react";
import { fetchPricingSchemeDetail } from "../../../admin/shipping-providers/api";
import type {
  PricingSchemeDetail,
  PricingSchemeDestinationGroup,
  PricingSchemeZone,
  PricingSchemeZoneMember,
} from "../../../admin/shipping-providers/api";
import { safeJson } from "../labUtils";

type ZoneIssueReport = {
  zone_id: number;
  zone_name: string;
  members_total: number;
  province_members: string[];
  issues: string[];
};

type GroupIssueReport = {
  group_id: number;
  group_name: string;
  province_count: number;
  province_codes: string[];
  issues: string[];
};

function normalizeText(v: string | null | undefined): string {
  return String(v ?? "").trim();
}

function getProvinceValues(members: PricingSchemeZoneMember[] | null | undefined): string[] {
  const out: string[] = [];
  for (const m of members ?? []) {
    if (normalizeText(m.level).toLowerCase() !== "province") continue;
    const value = normalizeText(m.value);
    if (!value) continue;
    out.push(value);
  }
  return out;
}

function countBy<T>(items: T[], getKey: (item: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return m;
}

function buildZoneReports(zones: PricingSchemeZone[]): ZoneIssueReport[] {
  const normalizedNames = zones.map((z) => ({
    id: z.id,
    key: normalizeText(z.name).toLowerCase(),
  }));
  const nameCount = countBy(normalizedNames, (x) => x.key);

  return zones.map((z) => {
    const issues: string[] = [];
    const zoneName = normalizeText(z.name) || `Zone#${z.id}`;
    const members = z.members ?? [];
    const provinceMembers = getProvinceValues(members);
    const zoneNameKey = zoneName.toLowerCase();

    if (!z.active) {
      issues.push("inactive_zone: 当前 Zone 为停用状态");
    }

    if (members.length === 0) {
      issues.push("no_members: 当前 Zone 没有任何 members");
    }

    if (provinceMembers.length === 0) {
      issues.push("no_province_members: 当前 Zone 没有 province 级 members");
    }

    const uniqueProvinceCount = new Set(provinceMembers).size;
    if (uniqueProvinceCount !== provinceMembers.length) {
      issues.push("duplicate_province_members: 当前 Zone 内存在重复 province member");
    }

    if (zoneNameKey && (nameCount.get(zoneNameKey) ?? 0) > 1) {
      issues.push(`duplicate_zone_name: Zone 名称重复（${zoneName}）`);
    }

    return {
      zone_id: z.id,
      zone_name: zoneName,
      members_total: members.length,
      province_members: provinceMembers,
      issues,
    };
  });
}

function buildGroupReports(groups: PricingSchemeDestinationGroup[]): GroupIssueReport[] {
  const normalizedNames = groups.map((g) => ({
    id: g.id,
    key: normalizeText(g.name).toLowerCase(),
  }));
  const nameCount = countBy(normalizedNames, (x) => x.key);

  return groups.map((g) => {
    const issues: string[] = [];
    const groupName = normalizeText(g.name) || `Group#${g.id}`;
    const provinceCodes = (g.provinces ?? [])
      .map((p) => normalizeText(p.province_code))
      .filter(Boolean);

    if (!g.active) {
      issues.push("inactive_group: 当前 destination group 为停用状态");
    }

    if (provinceCodes.length === 0) {
      issues.push("no_group_provinces: 当前 destination group 没有关联任何 province");
    }

    const uniqueProvinceCount = new Set(provinceCodes).size;
    if (uniqueProvinceCount !== provinceCodes.length) {
      issues.push("duplicate_group_provinces: 当前 destination group 内存在重复 province_code");
    }

    const groupNameKey = groupName.toLowerCase();
    if (groupNameKey && (nameCount.get(groupNameKey) ?? 0) > 1) {
      issues.push(`duplicate_group_name: destination group 名称重复（${groupName}）`);
    }

    return {
      group_id: g.id,
      group_name: groupName,
      province_count: provinceCodes.length,
      province_codes: provinceCodes,
      issues,
    };
  });
}

function buildCrossIssues(
  zones: PricingSchemeZone[],
  groups: PricingSchemeDestinationGroup[],
): string[] {
  const issues: string[] = [];

  const zoneProvinceOwners = new Map<string, number[]>();
  for (const z of zones) {
    for (const code of getProvinceValues(z.members ?? [])) {
      const owners = zoneProvinceOwners.get(code) ?? [];
      owners.push(z.id);
      zoneProvinceOwners.set(code, owners);
    }
  }

  for (const [code, owners] of zoneProvinceOwners.entries()) {
    const uniq = Array.from(new Set(owners));
    if (uniq.length > 1) {
      issues.push(`zone_province_overlap: province=${code} 被多个 Zone 占用（zone_ids=${uniq.join(",")}）`);
    }
  }

  const groupProvinceOwners = new Map<string, number[]>();
  for (const g of groups) {
    for (const p of g.provinces ?? []) {
      const code = normalizeText(p.province_code);
      if (!code) continue;
      const owners = groupProvinceOwners.get(code) ?? [];
      owners.push(g.id);
      groupProvinceOwners.set(code, owners);
    }
  }

  for (const [code, owners] of groupProvinceOwners.entries()) {
    const uniq = Array.from(new Set(owners));
    if (uniq.length > 1) {
      issues.push(`group_province_overlap: province_code=${code} 被多个 destination group 占用（group_ids=${uniq.join(",")}）`);
    }
  }

  return issues;
}

export const SchemeHealthScan: React.FC<{ schemeId: number | null }> = ({ schemeId }) => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<PricingSchemeDetail | null>(null);

  const run = async () => {
    if (!schemeId || schemeId <= 0) {
      setErr("scheme_id 必须是正整数");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const d = await fetchPricingSchemeDetail(schemeId);
      setDetail(d);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "拉取 scheme detail 失败");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const report = useMemo(() => {
    if (!detail) return null;

    const zones: PricingSchemeZone[] = detail.zones ?? [];
    const groups: PricingSchemeDestinationGroup[] = detail.destination_groups ?? [];

    const zoneReports = buildZoneReports(zones);
    const groupReports = buildGroupReports(groups);
    const crossIssues = buildCrossIssues(zones, groups);

    const totalIssues =
      zoneReports.reduce((acc, x) => acc + x.issues.length, 0) +
      groupReports.reduce((acc, x) => acc + x.issues.length, 0) +
      crossIssues.length;

    return {
      scheme_id: detail.id,
      scheme_name: detail.name,
      scheme_status: detail.status ?? null,
      zones: zones.length,
      destination_groups: groups.length,
      surcharges: (detail.surcharges ?? []).length,
      dest_adjustments: (detail.dest_adjustments ?? []).length,
      total_issues: totalIssues,
      note:
        "旧 bracket 覆盖/空洞/重叠扫描已退出；当前扫描仅基于 zones / destination_groups / surcharges / dest_adjustments 做主线结构检查。",
      cross_issues: crossIssues,
      zone_reports: zoneReports,
      group_reports: groupReports,
    };
  }, [detail]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Scheme Health Scan</div>
          <div className="mt-1 text-xs text-slate-500">
            zones / destination_groups / surcharges / dest_adjustments 结构诊断。
          </div>
        </div>
        <button
          type="button"
          className={
            "rounded-xl px-3 py-2 text-xs font-semibold " +
            (loading ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800")
          }
          onClick={() => void run()}
          disabled={loading}
        >
          {loading ? "扫描中…" : "运行扫描"}
        </button>
      </div>

      {err ? <div className="mt-2 text-sm text-red-700">{err}</div> : null}

      {!report ? (
        <div className="mt-3 text-sm text-slate-500">尚未扫描。点击“运行扫描”。</div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="text-slate-700">
              scheme：<span className="font-mono">#{report.scheme_id}</span> · {report.scheme_name}
            </div>
            <div className="mt-1 text-slate-700">
              status：<span className="font-mono">{String(report.scheme_status ?? "null")}</span> · zones：
              <span className="font-mono"> {report.zones}</span> · groups：
              <span className="font-mono"> {report.destination_groups}</span>
            </div>
            <div className="mt-1 text-slate-700">
              surcharges：<span className="font-mono">{report.surcharges}</span> · dest_adjustments：
              <span className="font-mono"> {report.dest_adjustments}</span> · total_issues：
              <span className="font-mono"> {report.total_issues}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">{report.note}</div>
          </div>

          <details className="rounded-xl border border-slate-200 bg-white p-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-700">
              查看扫描报告（JSON）
            </summary>
            <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-700">
              {safeJson(report)}
            </pre>
          </details>

          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">scope</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">name</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">count</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">issues</th>
                </tr>
              </thead>
              <tbody>
                {report.zone_reports.map((zr) => (
                  <tr key={`zone-${zr.zone_id}`} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-xs font-mono text-slate-500">zone</td>
                    <td className="px-3 py-2">
                      <div className="text-slate-900">{zr.zone_name}</div>
                      <div className="text-xs font-mono text-slate-500">zone_id={zr.zone_id}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{zr.members_total}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      {zr.issues.length ? (
                        <ul className="list-disc space-y-1 pl-4 font-mono">
                          {zr.issues.map((x, i) => (
                            <li key={`zone-${zr.zone_id}-${i}`}>{x}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="font-semibold text-emerald-700">OK</span>
                      )}
                    </td>
                  </tr>
                ))}

                {report.group_reports.map((gr) => (
                  <tr key={`group-${gr.group_id}`} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-xs font-mono text-slate-500">group</td>
                    <td className="px-3 py-2">
                      <div className="text-slate-900">{gr.group_name}</div>
                      <div className="text-xs font-mono text-slate-500">group_id={gr.group_id}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{gr.province_count}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      {gr.issues.length ? (
                        <ul className="list-disc space-y-1 pl-4 font-mono">
                          {gr.issues.map((x, i) => (
                            <li key={`group-${gr.group_id}-${i}`}>{x}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="font-semibold text-emerald-700">OK</span>
                      )}
                    </td>
                  </tr>
                ))}

                {report.cross_issues.length ? (
                  <tr>
                    <td className="px-3 py-2 text-xs font-mono text-slate-500">cross</td>
                    <td className="px-3 py-2 text-slate-900">cross-scope consistency</td>
                    <td className="px-3 py-2 text-right font-mono">{report.cross_issues.length}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      <ul className="list-disc space-y-1 pl-4 font-mono">
                        {report.cross_issues.map((x, i) => (
                          <li key={`cross-${i}`}>{x}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeHealthScan;
