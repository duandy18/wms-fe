// src/features/admin/shipping-providers/scheme/SchemeWorkbenchPage.tsx

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UI } from "../ui";
import { L } from "./labels";
import { useSchemeWorkbench } from "./useSchemeWorkbench";
import { type SchemeTabKey } from "./types";

// ===== 子模块 =====
import { ZonesPanel } from "./zones/ZonesPanel";
import { MembersPanel } from "./members/MembersPanel";
import { BracketsPanel } from "./brackets/BracketsPanel";
import { SurchargesPanel } from "./surcharges/SurchargesPanel";
import { QuotePreviewPanel } from "./preview/QuotePreviewPanel";

// ===== API =====
import {
  createZone,
  patchZone,
  deleteZone,
  type PricingSchemeZone,
  createZoneMember,
  deleteZoneMember,
  type PricingSchemeZoneMember,
  createZoneBracket,
  patchZoneBracket,
  deleteZoneBracket,
  type PricingSchemeZoneBracket,
  createSurcharge,
  patchSurcharge,
  deleteSurcharge,
  type PricingSchemeSurcharge,
} from "../api";

// ===== 错误解释 =====
import { explainDeleteZoneError } from "./zones/zoneActions";
import { confirmDeleteBracketText, explainDeleteBracketError } from "./brackets/bracketActions";

function formatDt(v?: string | null) {
  if (!v) return "—";
  return v.replace("T", " ").replace("Z", "");
}

function TabButton(props: { label: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  const { label, active, disabled, onClick } = props;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${UI.badgeBtn} ${active ? UI.badgeBtnActive : UI.badgeBtnIdle} ${disabled ? "opacity-60" : ""}`}
    >
      {label}
    </button>
  );
}

export const SchemeWorkbenchPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ schemeId: string }>();
  const schemeId = params.schemeId ? Number(params.schemeId) : null;

  const wb = useSchemeWorkbench({ open: true, schemeId });
  const setTab = (k: SchemeTabKey) => wb.setTab(k);

  return (
    <div className={UI.page}>
      {/* ===== Header ===== */}
      <div className={UI.card}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-slate-900">{L.modalTitle}</div>
            <div className="mt-1 text-sm text-slate-600">
              {wb.summary ? (
                <span className="font-mono">
                  #{wb.summary.id} · {wb.summary.name}
                </span>
              ) : (
                <span className="text-slate-500">{L.notSelected}</span>
              )}
            </div>
            <div className="mt-2 text-sm text-slate-600">{L.modalSubtitle}</div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className={UI.btnSecondary}
              onClick={() => void wb.reload()}
              disabled={!schemeId || wb.loading || wb.mutating}
            >
              {wb.loading ? L.loading : L.refresh}
            </button>
            <button type="button" className={UI.btnSecondary} onClick={() => navigate(-1)}>
              返回
            </button>
          </div>
        </div>
      </div>

      {/* ===== Error ===== */}
      {wb.error ? <div className={UI.error}>{wb.error}</div> : null}

      {/* ===== Tabs ===== */}
      <div className={`${UI.card} flex flex-wrap gap-2`}>
        <TabButton label={L.tabZones} active={wb.tab === "zones"} disabled={wb.loading} onClick={() => setTab("zones")} />
        <TabButton label={L.tabMembers} active={wb.tab === "members"} disabled={wb.loading} onClick={() => setTab("members")} />
        <TabButton label={L.tabBrackets} active={wb.tab === "brackets"} disabled={wb.loading} onClick={() => setTab("brackets")} />
        <TabButton label={L.tabSurcharges} active={wb.tab === "surcharges"} disabled={wb.loading} onClick={() => setTab("surcharges")} />
        <TabButton label={L.tabPreview} active={wb.tab === "preview"} disabled={wb.loading} onClick={() => setTab("preview")} />
      </div>

      {/* ===== Body ===== */}
      <div className={UI.card}>
        {wb.loading ? (
          <div className="text-sm text-slate-600">{L.loading}</div>
        ) : !wb.detail ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            {L.empty}
          </div>
        ) : (
          <>
            {/* ===== Summary ===== */}
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">状态</div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {wb.detail.active ? "启用" : "停用"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">优先级</div>
                <div className="mt-1 text-base font-semibold text-slate-900 font-mono">
                  {wb.detail.priority}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">币种 / 生效窗</div>
                <div className="mt-1 text-base font-semibold text-slate-900 font-mono">
                  {wb.detail.currency}
                </div>
                <div className="mt-2 text-sm text-slate-600 font-mono">
                  {formatDt(wb.detail.effective_from)} ~ {formatDt(wb.detail.effective_to)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">结构摘要</div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  Zones {wb.detail.zones.length} · Brackets{" "}
                  {wb.detail.zones.reduce((n, z) => n + z.brackets.length, 0)} · 附加费{" "}
                  {wb.detail.surcharges.length}
                </div>
              </div>
            </div>

            {/* ===== Main Panel ===== */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              {wb.tab === "zones" ? (
                <ZonesPanel
                  detail={wb.detail}
                  disabled={wb.loading || wb.mutating}
                  selectedZoneId={wb.selectedZoneId}
                  onError={(msg) => wb.setError(msg)}
                  onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId)}
                  onCreate={async (payload) => {
                    await wb.mutate(async () => {
                      await createZone(wb.detail!.id, { name: payload.name, priority: payload.priority, active: true });
                    });
                  }}
                  onToggle={async (z: PricingSchemeZone) => {
                    await wb.mutate(async () => {
                      await patchZone(z.id, { active: !z.active });
                    });
                  }}
                  onDelete={async (z: PricingSchemeZone) => {
                    await wb.mutate(async () => {
                      try {
                        await deleteZone(z.id);
                      } catch (e: any) {
                        throw new Error(explainDeleteZoneError(e?.message ?? ""));
                      }
                    });
                  }}
                />
              ) : null}

              {wb.tab === "members" ? (
                <MembersPanel
                  detail={wb.detail}
                  disabled={wb.loading || wb.mutating}
                  selectedZoneId={wb.selectedZoneId}
                  onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId || null)}
                  onError={(msg) => wb.setError(msg)}
                  onCreate={async (payload) => {
                    if (!wb.selectedZoneId) {
                      wb.setError("请先选择一个 Zone，再新增 Member。");
                      return;
                    }
                    await wb.mutate(async () => {
                      await createZoneMember(wb.selectedZoneId!, {
                        level: payload.level,
                        value: payload.value,
                      });
                    });
                  }}
                  onDelete={async (m: PricingSchemeZoneMember) => {
                    await wb.mutate(async () => {
                      await deleteZoneMember(m.id);
                    });
                  }}
                />
              ) : null}

              {wb.tab === "brackets" ? (
                <BracketsPanel
                  detail={wb.detail}
                  disabled={wb.loading || wb.mutating}
                  selectedZoneId={wb.selectedZoneId}
                  onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId || null)}
                  onError={(msg) => wb.setError(msg)}
                  onCreate={async (zoneId, payload) => {
                    await wb.mutate(async () => {
                      await createZoneBracket(zoneId, payload);
                    });
                  }}
                  onToggle={async (b: PricingSchemeZoneBracket) => {
                    await wb.mutate(async () => {
                      await patchZoneBracket(b.id, { active: !b.active });
                    });
                  }}
                  onDelete={async (b: PricingSchemeZoneBracket) => {
                    const ok = window.confirm(
                      confirmDeleteBracketText({
                        id: b.id,
                        minKg: b.min_kg,
                        maxKg: b.max_kg ?? null,
                        pricingKind: b.pricing_kind,
                      }),
                    );
                    if (!ok) return;
                    await wb.mutate(async () => {
                      try {
                        await deleteZoneBracket(b.id);
                      } catch (e: any) {
                        throw new Error(explainDeleteBracketError(e?.message ?? ""));
                      }
                    });
                  }}
                />
              ) : null}

              {wb.tab === "surcharges" ? (
                <SurchargesPanel
                  detail={wb.detail}
                  disabled={wb.loading || wb.mutating}
                  onError={(msg) => wb.setError(msg)}
                  onCreate={async (payload) => {
                    await wb.mutate(async () => {
                      await createSurcharge(wb.detail!.id, {
                        name: payload.name,
                        priority: payload.priority,
                        active: true,
                        condition_json: payload.condition_json,
                        amount_json: payload.amount_json,
                      });
                    });
                  }}
                  onToggle={async (s: PricingSchemeSurcharge) => {
                    await wb.mutate(async () => {
                      await patchSurcharge(s.id, { active: !s.active });
                    });
                  }}
                  onDelete={async (s: PricingSchemeSurcharge) => {
                    await wb.mutate(async () => {
                      await deleteSurcharge(s.id);
                    });
                  }}
                />
              ) : null}

              {wb.tab === "preview" ? (
                <QuotePreviewPanel
                  schemeId={wb.detail.id}
                  schemeName={wb.detail.name}
                  disabled={wb.loading || wb.mutating}
                  onError={(msg) => wb.setError(msg)}
                />
              ) : null}
            </div>

            <div className="mt-3 text-xs text-slate-500">
              说明：Zone / Member / Bracket / Surcharge / Preview 已全部接入中控；所有写操作统一 mutate 并自动 reload。
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SchemeWorkbenchPage;
