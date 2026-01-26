// src/features/admin/shipping-providers/pages/edit/schemes/actions.ts
import type { PricingScheme } from "../../../api/types";
import { createPricingScheme, patchPricingScheme } from "../../../api/schemes";
import { runWithConcurrency } from "./concurrency";
import { isArchived } from "./types";

export async function createScheme(providerId: number, name: string, currency: string) {
  return createPricingScheme(providerId, { name, currency });
}

export async function patchActive(schemeId: number, active: boolean) {
  return patchPricingScheme(schemeId, { active });
}

export async function archiveScheme(s: PricingScheme, tsIso: string) {
  return patchPricingScheme(s.id, { archived_at: tsIso, active: false });
}

export async function unarchiveScheme(s: PricingScheme) {
  return patchPricingScheme(s.id, { archived_at: null });
}

export function assertNotArchivedOrThrow(schemes: PricingScheme[], schemeId: number) {
  const s = schemes.find((x) => x.id === schemeId);
  if (s && isArchived(s)) {
    throw new Error("该收费标准已归档：请先取消归档，再启用或停用。");
  }
}

export async function batchDeactivate(ids: number[]) {
  const queue = [...ids];
  await runWithConcurrency(queue, 4, async (id) => {
    await patchPricingScheme(id, { active: false });
  });
}

export async function batchArchiveInactive(ids: number[], tsIso: string) {
  const queue = [...ids];
  await runWithConcurrency(queue, 4, async (id) => {
    await patchPricingScheme(id, { archived_at: tsIso, active: false });
  });
}
