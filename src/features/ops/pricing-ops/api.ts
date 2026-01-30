// src/features/ops/pricing-ops/api.ts
import { apiGet, apiPost } from "../../../lib/api";
import type {
  CleanupShellSchemesOut,
  FixArchiveReleaseIn,
  FixArchiveReleaseOut,
  FixDetachBracketsIn,
  FixDetachBracketsOut,
  FixUnbindArchivedTemplatesIn,
  FixUnbindArchivedTemplatesOut,
  OneClickQuery,
  PricingIntegrityReport,
  PricingSchemeListOut,
} from "./types";

type OpsActiveSchemesOut = {
  ok: boolean;
  data: Array<{
    scheme_id: number;
    scheme_name: string;
    shipping_provider_id: number;
    shipping_provider_name: string;
  }>;
};

export const PricingOpsApi = {
  // report
  getReport: (schemeId: number) => apiGet<PricingIntegrityReport>(`/ops/pricing-integrity/schemes/${schemeId}`),

  // ✅ 全局 active schemes（跨 provider）
  // 后端：GET /ops/pricing-integrity/active-schemes
  listActiveSchemesGlobal: async (): Promise<PricingSchemeListOut> => {
    const r = await apiGet<OpsActiveSchemesOut>(`/ops/pricing-integrity/active-schemes`);
    const rows = Array.isArray(r.data) ? r.data : [];
    return {
      ok: true,
      data: rows.map((x) => ({
        id: x.scheme_id,
        shipping_provider_id: x.shipping_provider_id,
        shipping_provider_name: x.shipping_provider_name,
        name: x.scheme_name,
        active: true,
        archived_at: null,
      })),
    };
  },

  // fixes (single)
  fixArchiveRelease: (payload: FixArchiveReleaseIn) =>
    apiPost<FixArchiveReleaseOut>(`/ops/pricing-integrity/fix/archive-release-provinces`, payload),

  fixDetachBrackets: (payload: FixDetachBracketsIn) =>
    apiPost<FixDetachBracketsOut>(`/ops/pricing-integrity/fix/detach-zone-brackets`, payload),

  fixUnbindArchivedTemplates: (payload: FixUnbindArchivedTemplatesIn) =>
    apiPost<FixUnbindArchivedTemplatesOut>(`/ops/pricing-integrity/fix/unbind-archived-templates`, payload),

  // one-click (by scheme)
  oneClickArchiveReleaseAll: (schemeId: number, q: OneClickQuery) =>
    apiPost<FixArchiveReleaseOut>(
      `/ops/pricing-integrity/schemes/${schemeId}/fix/archive-release-all-provinces`,
      null,
      { dry_run: q.dry_run },
    ),

  oneClickDetachBracketsAll: (schemeId: number, q: OneClickQuery) =>
    apiPost<FixDetachBracketsOut>(
      `/ops/pricing-integrity/schemes/${schemeId}/fix/detach-brackets-all`,
      null,
      { dry_run: q.dry_run },
    ),

  oneClickUnbindArchivedTemplatesAll: (schemeId: number, q: OneClickQuery) =>
    apiPost<FixUnbindArchivedTemplatesOut>(
      `/ops/pricing-integrity/schemes/${schemeId}/fix/unbind-archived-templates-all`,
      null,
      { dry_run: q.dry_run },
    ),

  // cleanup
  cleanupShellSchemes: (params: { dryRun: boolean; limit: number; includeSurchargeOnly: boolean }) =>
    apiPost<CleanupShellSchemesOut>(
      `/ops/pricing-integrity/cleanup/shell-schemes`,
      null,
      {
        dry_run: params.dryRun,
        limit: params.limit,
        include_surcharge_only: params.includeSurchargeOnly,
      },
    ),
};
