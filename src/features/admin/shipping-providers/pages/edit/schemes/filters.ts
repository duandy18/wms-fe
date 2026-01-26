// src/features/admin/shipping-providers/pages/edit/schemes/filters.ts
import type { PricingScheme } from "../../../api/types";
import { isTestLikeName } from "./utils";
import { isArchived, type ViewMode } from "./types";

export function filterAndSortSchemes(args: {
  schemes: PricingScheme[];
  q: string;
  viewMode: ViewMode;
  hideTests: boolean;
  showArchived: boolean;
}): PricingScheme[] {
  const { schemes, q, viewMode, hideTests, showArchived } = args;
  const kw = q.trim().toLowerCase();

  const list = schemes.filter((s) => {
    const archived = isArchived(s);
    if (!showArchived && archived) return false;

    if (viewMode === "active" && !s.active) return false;
    if (viewMode === "inactive" && s.active) return false;

    if (hideTests && isTestLikeName(s.name)) return false;

    if (!kw) return true;

    const idHit = String(s.id).includes(kw);
    const nameHit = s.name.toLowerCase().includes(kw);
    const curHit = s.currency.toLowerCase().includes(kw);
    return idHit || nameHit || curHit;
  });

  // 未归档优先 → 启用优先 → 新的在前
  list.sort((a, b) => {
    const aArc = isArchived(a) ? 1 : 0;
    const bArc = isArchived(b) ? 1 : 0;
    if (aArc !== bArc) return aArc - bArc;

    const aAct = a.active ? 1 : 0;
    const bAct = b.active ? 1 : 0;
    if (aAct !== bAct) return bAct - aAct;

    return b.id - a.id;
  });

  return list;
}

export function splitByStatus(list: PricingScheme[]) {
  const active = list.filter((s) => s.active && !isArchived(s));
  const inactive = list.filter((s) => !s.active && !isArchived(s));
  const archived = list.filter((s) => isArchived(s));
  return { active, inactive, archived };
}
