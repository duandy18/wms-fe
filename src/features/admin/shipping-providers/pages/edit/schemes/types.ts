// src/features/admin/shipping-providers/pages/edit/schemes/types.ts
import type { PricingScheme } from "../../../api/types";

export type ViewMode = "all" | "active" | "inactive";

export function isArchived(s: PricingScheme): boolean {
  return s.archived_at != null;
}
