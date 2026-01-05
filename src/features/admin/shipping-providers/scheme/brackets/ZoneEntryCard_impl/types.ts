// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryCard_impl/types.ts

import type { PricingSchemeZoneBracket } from "../../../api";
import type { WeightSegment } from "../PricingRuleEditor";
import type { RowDraft } from "../quoteModel";

export type ZoneEntryRow = { segment: WeightSegment; key: string | null };

export type ZoneEntryCardProps = {
  busy: boolean;
  selectedZoneId: number | null;
  tableRows: ZoneEntryRow[];
  currentDrafts: Record<string, RowDraft>;
  currentBrackets: PricingSchemeZoneBracket[];
  onSetDraft: (key: string, patch: Partial<RowDraft>) => void;
  onSave: () => Promise<void>;
};

export type StatusTone = "ok" | "empty" | "warn";

export type StatusView = {
  text: string;
  tone: StatusTone;
};
