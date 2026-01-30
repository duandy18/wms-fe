// src/features/ops/pricing-ops/types.ts

export type PricingIntegritySummary = {
  blocking: number;
  warning: number;
};

export type ArchivedZoneIssue = {
  scheme_id: number;
  zone_id: number;
  zone_name: string;
  zone_active: boolean;
  province_members: string[];
  province_member_n: number;
  suggested_action: string;
};

export type ReleasedZoneStillPricedIssue = {
  scheme_id: number;
  zone_id: number;
  zone_name: string;
  zone_active: boolean;
  province_member_n: number;
  brackets_n: number;
  segment_template_id: number | null;
  suggested_action: string;
};

export type ArchivedTemplateStillReferencedIssue = {
  scheme_id: number;
  template_id: number;
  template_name: string;
  template_status: string;
  referencing_zone_ids: number[];
  referencing_zone_names: string[];
  referencing_zone_n: number;
  suggested_action: string;
};

export type PricingIntegrityReport = {
  scheme_id: number;
  summary: PricingIntegritySummary;
  archived_zones_still_occupying: ArchivedZoneIssue[];
  released_zones_still_priced: ReleasedZoneStillPricedIssue[];
  archived_templates_still_referenced: ArchivedTemplateStillReferencedIssue[];
};

// ---- Fix: archive-release provinces ----
export type FixArchiveReleaseIn = {
  scheme_id: number;
  zone_ids: number[];
  dry_run: boolean;
};

export type FixArchiveReleaseItem = {
  zone_id: number;
  zone_name: string;
  ok: boolean;
  would_release_provinces: string[];
  would_release_n: number;
  after_active: boolean | null;
  after_province_member_n: number | null;
  error: string | null;
};

export type FixArchiveReleaseOut = {
  scheme_id: number;
  dry_run: boolean;
  items: FixArchiveReleaseItem[];
};

// ---- Fix: detach brackets ----
export type FixDetachBracketsIn = {
  scheme_id: number;
  zone_ids: number[];
  dry_run: boolean;
};

export type FixDetachBracketsItem = {
  zone_id: number;
  zone_name: string;
  ok: boolean;
  province_member_n: number;
  would_delete_brackets_n: number;
  would_delete_ranges_preview: string[];
  after_brackets_n: number | null;
  error: string | null;
};

export type FixDetachBracketsOut = {
  scheme_id: number;
  dry_run: boolean;
  items: FixDetachBracketsItem[];
};

// ---- Fix: unbind archived templates ----
export type FixUnbindArchivedTemplatesIn = {
  scheme_id: number;
  template_ids: number[];
  dry_run: boolean;
};

export type FixUnbindArchivedTemplatesItem = {
  template_id: number;
  template_name: string;
  ok: boolean;
  template_status: string | null;
  would_unbind_zone_ids: number[];
  would_unbind_zone_names: string[];
  would_unbind_zone_n: number;
  after_unbound_zone_n: number | null;
  error: string | null;
};

export type FixUnbindArchivedTemplatesOut = {
  scheme_id: number;
  dry_run: boolean;
  items: FixUnbindArchivedTemplatesItem[];
};

// ---- One-click endpoints ----
export type OneClickQuery = {
  dry_run: boolean;
};

// ---- Cleanup shell schemes ----
export type CleanupShellSchemesOut = {
  ok: boolean;
  dry_run: boolean;
  include_surcharge_only: boolean;
  limit: number;
  candidates_n: number;
  deleted_n: number;
  candidates: Array<{
    scheme_id: number;
    name: string;
    active: boolean;
    tpl_n: number;
    surcharge_n: number;
    seg_n: number;
    wh_n: number;
    zone_n: number;
  }>;
};

// ---- Schemes list ----
export type PricingSchemeListItem = {
  id: number;
  shipping_provider_id: number;
  shipping_provider_name: string;
  name: string;
  active: boolean;
  archived_at: string | null;
};

export type PricingSchemeListOut = {
  ok: boolean;
  data: PricingSchemeListItem[];
};
