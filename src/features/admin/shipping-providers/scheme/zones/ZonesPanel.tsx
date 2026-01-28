// src/features/admin/shipping-providers/scheme/zones/ZonesPanel.tsx

import React, { useEffect, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../api";
import { UI } from "../ui";

import ZoneEditorCard from "./ZoneEditorCard";
import { fetchSchemeSegmentTemplatesLite, type SegmentTemplateLite } from "./segmentTemplatesApi";
import { getErrorMessage } from "./zonesPanelUtils";

export const ZonesPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  selectedZoneId: number | null;

  onError: (msg: string) => void;
  onSelectZone: (zoneId: number) => void;

  onCommitCreate: (name: string, provinces: string[], segmentTemplateId: number | null) => Promise<void>;

  onToggle: (z: PricingSchemeZone) => Promise<void>;

  onReplaceProvinceMembers: (zoneId: number, provinces: string[]) => Promise<void>;

  onPatchZone: (zoneId: number, payload: { segment_template_id?: number | null }) => Promise<void>;

  onChangeBracketAmount?: (bracketId: number, nextAmountJson: unknown) => Promise<void>;
}> = ({
  detail,
  disabled,
  selectedZoneId,
  onError,
  onSelectZone,
  onCommitCreate,
  onToggle,
  onReplaceProvinceMembers,
  onPatchZone,
}) => {
  const [templates, setTemplates] = useState<SegmentTemplateLite[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesErr, setTemplatesErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const commit = (fn: () => void) => {
      if (!alive) return;
      fn();
    };

    (async () => {
      commit(() => {
        setTemplatesLoading(true);
        setTemplatesErr(null);
      });

      try {
        const list = await fetchSchemeSegmentTemplatesLite(detail.id);
        commit(() => setTemplates(list));
      } catch (e: unknown) {
        const msg = getErrorMessage(e, "加载重量段模板失败");
        commit(() => {
          setTemplatesErr(msg);
          setTemplates([]);
        });
      }

      commit(() => setTemplatesLoading(false));
    })();

    return () => {
      alive = false;
    };
  }, [detail.id]);

  return (
    <div className="space-y-4">
      {templatesErr ? <div className={UI.error}>{templatesErr}</div> : null}

      <ZoneEditorCard
        zones={detail.zones ?? []}
        disabled={!!disabled}
        selectedZoneId={selectedZoneId}
        templates={templates}
        templatesLoading={templatesLoading}
        templatesErr={templatesErr}
        onError={onError}
        onSelectZone={onSelectZone}
        onToggle={onToggle}
        onCommitCreate={onCommitCreate}
        onReplaceProvinceMembers={onReplaceProvinceMembers}
        onPatchZone={onPatchZone}
      />
    </div>
  );
};

export default ZonesPanel;
