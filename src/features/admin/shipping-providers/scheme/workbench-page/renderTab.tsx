// src/features/admin/shipping-providers/scheme/workbench-page/renderTab.tsx

import React from "react";
import type { PricingSchemeDetail, PricingSchemeSurcharge, PricingSchemeZone } from "../../api";
import { ZonesPanel } from "../zones/ZonesPanel";
import { BracketsPanel } from "../brackets/BracketsPanel";
import SegmentsPanel from "../brackets/SegmentsPanel";
import { SurchargesPanel } from "../surcharges/SurchargesPanel";
import { QuotePreviewPanel } from "../preview/QuotePreviewPanel";
import { PricingTableWorkbenchPanel } from "../table/PricingTableWorkbenchPanel";
import DestAdjustmentsPanel from "../dest-adjustments/DestAdjustmentsPanel";
import type { SchemeTabKey } from "../types";
import type { DestAdjustmentUpsertPayload } from "../../api/destAdjustments";

export function renderWorkbenchTab(params: {
  tab: SchemeTabKey;
  detail: PricingSchemeDetail;
  pageDisabled: boolean;
  flowLocked: boolean;
  checkingTemplates: boolean;
  selectedZoneId: number | null;
  setSelectedZoneId: (id: number | null) => void;
  setError: (msg: string) => void;
  surchargesDisabled: boolean;

  actions: {
    zones: {
      onToggleZoneArchiveRelease: (z: PricingSchemeZone) => Promise<void>;
      onCommitCreateZone: (name: string, provinces: string[], segmentTemplateId: number | null) => Promise<void>;
      onReplaceProvinceMembers: (zoneId: number, provinces: string[]) => Promise<void>;
      onPatchZone: (zoneId: number, payload: Record<string, unknown>) => Promise<void>;
      onPatchZoneTemplate: (zoneId: number, templateId: number) => Promise<void>;
      onUnbindZoneTemplate: (zoneId: number) => Promise<void>;
      onGoZonesTab: () => void;
      onGoSegmentsTab: () => void;
    };
    surcharges: {
      onCreate: (payload: { name: string; condition_json: Record<string, unknown>; amount_json: Record<string, unknown> }) => Promise<void>;
      onPatch: (
        surchargeId: number,
        payload: Partial<{ name: string; condition_json: Record<string, unknown>; amount_json: Record<string, unknown>; active: boolean }>,
      ) => Promise<void>;
      onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
      onDelete: (s: PricingSchemeSurcharge) => Promise<void>;
    };
    destAdjustments: {
      onUpsert: (payload: DestAdjustmentUpsertPayload) => Promise<void>;
      onPatch: (id: number, payload: Partial<{ active: boolean; amount: number; priority: number }>) => Promise<void>;
      onDelete: (id: number) => Promise<void>;
    };
  };
}) {
  const { tab, detail, pageDisabled, flowLocked, selectedZoneId, setSelectedZoneId, setError, surchargesDisabled, actions } = params;

  if (tab === "table") {
    return (
      <PricingTableWorkbenchPanel
        detail={detail}
        disabled={pageDisabled || flowLocked}
        selectedZoneId={selectedZoneId}
        onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
        onError={(msg) => setError(msg)}
        onToggleZone={actions.zones.onToggleZoneArchiveRelease}
        onPatchZoneTemplate={actions.zones.onPatchZoneTemplate}
        onUnbindZoneTemplate={actions.zones.onUnbindZoneTemplate}
        onGoZonesTab={actions.zones.onGoZonesTab}
        onGoSegmentsTab={actions.zones.onGoSegmentsTab}
      />
    );
  }

  if (tab === "segments") {
    return <SegmentsPanel detail={detail} disabled={pageDisabled} onError={(msg) => setError(msg)} />;
  }

  if (tab === "zones") {
    return (
      <ZonesPanel
        detail={detail}
        disabled={pageDisabled || flowLocked}
        selectedZoneId={selectedZoneId}
        onError={(msg) => setError(msg)}
        onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
        onCommitCreate={actions.zones.onCommitCreateZone}
        onToggle={actions.zones.onToggleZoneArchiveRelease}
        onReplaceProvinceMembers={actions.zones.onReplaceProvinceMembers}
        onPatchZone={actions.zones.onPatchZone}
      />
    );
  }

  if (tab === "brackets") {
    return <BracketsPanel detail={detail} selectedZoneId={selectedZoneId} onSelectZone={(zoneId) => setSelectedZoneId(zoneId || null)} />;
  }

  if (tab === "dest_adjustments") {
    return (
      <DestAdjustmentsPanel
        schemeId={detail.id}
        list={detail.dest_adjustments ?? []}
        disabled={pageDisabled || detail.archived_at != null}
        onError={(msg) => setError(msg)}
        onUpsert={actions.destAdjustments.onUpsert}
        onPatch={actions.destAdjustments.onPatch}
        onDelete={actions.destAdjustments.onDelete}
      />
    );
  }

  if (tab === "surcharges") {
    return (
      <SurchargesPanel
        detail={detail}
        disabled={surchargesDisabled}
        onError={(msg) => setError(msg)}
        onCreate={actions.surcharges.onCreate}
        onPatch={actions.surcharges.onPatch}
        onToggle={actions.surcharges.onToggle}
        onDelete={actions.surcharges.onDelete}
      />
    );
  }

  if (tab === "preview") {
    return <QuotePreviewPanel schemeId={detail.id} disabled={pageDisabled || flowLocked} onError={(msg) => setError(msg)} />;
  }

  return null;
}
