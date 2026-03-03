// src/features/admin/items/editor/syncItemUomsForEdit.ts

import type { FormState } from "../create/types";
import {
  createItemUom,
  fetchItemUoms,
  updateItemUom,
  type ItemUom,
} from "../../../../master-data/itemUomsApi";
import {
  parsePositiveIntOrNull,
  pickBaseDraft,
  pickPurchaseDraft,
  pickBaseUom,
  trimOrNull,
} from "./itemEditorUtils";

export async function syncItemUomsForEdit(args: {
  itemId: number;
  form: FormState;
}): Promise<void> {
  const { itemId, form } = args;

  const baseDraft = pickBaseDraft(form.uoms);
  const desiredBase = (baseDraft?.uom ?? "").trim();
  const desiredBaseDisplay = trimOrNull(baseDraft?.display_name ?? "");

  const purchaseDraft = pickPurchaseDraft(form.uoms);
  const desiredPurchase = (purchaseDraft?.uom ?? "").trim();
  const desiredPurchaseDisplay = trimOrNull(purchaseDraft?.display_name ?? "");
  const desiredPurchaseRatio = purchaseDraft ? parsePositiveIntOrNull(purchaseDraft.ratio_to_base) : null;

  if (!desiredBase) return;

  const uoms = await fetchItemUoms(itemId);
  const base = pickBaseUom(uoms);

  // 1) ensure base exists + correct
  if (base) {
    const needUpdate =
      base.uom !== desiredBase ||
      (base.display_name ?? null) !== desiredBaseDisplay ||
      base.ratio_to_base !== 1 ||
      base.is_base !== true;

    if (needUpdate) {
      await updateItemUom(base.id, {
        item_id: itemId,
        uom: desiredBase,
        ratio_to_base: 1,
        display_name: desiredBaseDisplay,
        is_base: true,
      });
    }
  } else {
    await createItemUom({
      item_id: itemId,
      uom: desiredBase,
      ratio_to_base: 1,
      display_name: desiredBaseDisplay,
      is_base: true,
      is_purchase_default: true,
      is_inbound_default: true,
      is_outbound_default: true,
    });
  }

  // 2) purchase_default
  const refreshed: ItemUom[] = await fetchItemUoms(itemId);
  const refreshedBase = pickBaseUom(refreshed);

  if (!desiredPurchase) {
    const toClear = refreshed.filter((x) => x.is_purchase_default && (!refreshedBase || x.id !== refreshedBase.id));
    for (const u of toClear) await updateItemUom(u.id, { is_purchase_default: false });
    if (refreshedBase && !refreshedBase.is_purchase_default) {
      await updateItemUom(refreshedBase.id, { is_purchase_default: true });
    }
    return;
  }

  if (desiredPurchaseRatio == null) return;

  const toClear = refreshed.filter((x) => x.is_purchase_default && x.uom !== desiredPurchase);
  for (const u of toClear) await updateItemUom(u.id, { is_purchase_default: false });

  if (refreshedBase && refreshedBase.is_purchase_default && refreshedBase.uom !== desiredPurchase) {
    await updateItemUom(refreshedBase.id, { is_purchase_default: false });
  }

  const same = refreshed.find((x) => x.uom === desiredPurchase);
  if (same) {
    await updateItemUom(same.id, {
      uom: desiredPurchase,
      ratio_to_base: desiredPurchaseRatio,
      display_name: desiredPurchaseDisplay,
      is_purchase_default: true,
    });
  } else {
    await createItemUom({
      item_id: itemId,
      uom: desiredPurchase,
      ratio_to_base: desiredPurchaseRatio,
      display_name: desiredPurchaseDisplay,
      is_purchase_default: true,
    });
  }
}
