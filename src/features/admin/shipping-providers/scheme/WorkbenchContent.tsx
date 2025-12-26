// src/features/admin/shipping-providers/scheme/WorkbenchContent.tsx
//
// 内容区编排（orchestration-only）
// - 根据 tab 渲染对应 panel
// - 所有 mutate 行为由上层传入

import React from "react";
import type { PricingSchemeDetail, PricingSchemeZone, PricingSchemeSurcharge } from "../api";
import type { SchemeTabKey } from "./types";

import { ZonesPanel } from "./zones/ZonesPanel";
import { SegmentsPanel } from "./brackets/SegmentsPanel";
import { BracketsPanel } from "./brackets/BracketsPanel";
import { SurchargesPanel } from "./surcharges/SurchargesPanel";
import { QuotePreviewPanel } from "./preview/QuotePreviewPanel";
import { SchemeOverviewPanel } from "./overview/SchemeOverviewPanel";

export const WorkbenchContent: React.FC<{
  tab: SchemeTabKey;

  detail: PricingSchemeDetail;
  disabled: boolean;

  selectedZoneId: number | null;
  onSelectZoneId: (zoneId: number | null) => void;

  onError: (msg: string) => void;

  onCommitCreateZone: (name: string, provinces: string[]) => Promise<void>;
  onToggleZone: (z: PricingSchemeZone) => Promise<void>;

  onCreateSurcharge: (payload: {
    name: string;
    priority: number;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  }) => Promise<void>;
  onPatchSurcharge: (
    surchargeId: number,
    payload: Partial<{
      name: string;
      priority: number;
      active: boolean;
      condition_json: Record<string, unknown>;
      amount_json: Record<string, unknown>;
    }>,
  ) => Promise<void>;
  onToggleSurcharge: (s: PricingSchemeSurcharge) => Promise<void>;
  onDeleteSurcharge: (s: PricingSchemeSurcharge) => Promise<void>;
}> = ({
  tab,
  detail,
  disabled,
  selectedZoneId,
  onSelectZoneId,
  onError,
  onCommitCreateZone,
  onToggleZone,
  onCreateSurcharge,
  onPatchSurcharge,
  onToggleSurcharge,
  onDeleteSurcharge,
}) => {
  return (
    <>
      {tab === "zones" ? (
        <ZonesPanel
          detail={detail}
          disabled={disabled}
          selectedZoneId={selectedZoneId}
          onError={onError}
          onSelectZone={(zoneId) => onSelectZoneId(zoneId)}
          onCommitCreate={onCommitCreateZone}
          onToggle={onToggleZone}
          onChangeBracketAmount={async () => {}}
        />
      ) : null}

      {tab === "segments" ? <SegmentsPanel detail={detail} disabled={disabled} onError={onError} /> : null}

      {tab === "pricing" ? (
        <BracketsPanel detail={detail} selectedZoneId={selectedZoneId} onSelectZone={(zoneId) => onSelectZoneId(zoneId || null)} />
      ) : null}

      {tab === "surcharges" ? (
        <SurchargesPanel
          detail={detail}
          disabled={disabled}
          onError={onError}
          onCreate={onCreateSurcharge}
          onPatch={onPatchSurcharge}
          onToggle={onToggleSurcharge}
          onDelete={onDeleteSurcharge}
        />
      ) : null}

      {tab === "preview" ? <QuotePreviewPanel schemeId={detail.id} schemeName={detail.name} disabled={disabled} onError={onError} /> : null}

      {tab === "overview" ? <SchemeOverviewPanel detail={detail} /> : null}
    </>
  );
};

export default WorkbenchContent;
