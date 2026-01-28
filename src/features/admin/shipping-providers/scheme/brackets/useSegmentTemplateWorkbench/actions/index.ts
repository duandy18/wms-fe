// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/index.ts

import type { WorkbenchActionCtx, WorkbenchActions } from "./types";
import { makeCreateDraftTemplate } from "./createDraftTemplate";
import { makeCloneSelectedToDraft } from "./cloneSelectedToDraft";
import { makeSaveDraftItems } from "./saveDraftItems";
import { makeActivateTemplate } from "./activateTemplate";
import { makeToggleActiveItem } from "./toggleActiveItem";
import { makeArchiveTemplate } from "./archiveTemplate";
import { makeUnarchiveTemplate } from "./unarchiveTemplate";

export function createWorkbenchActions(ctx: WorkbenchActionCtx): WorkbenchActions {
  return {
    createDraftTemplate: makeCreateDraftTemplate(ctx),
    cloneSelectedToDraft: makeCloneSelectedToDraft(ctx),
    saveDraftItems: makeSaveDraftItems(ctx),
    activateTemplate: makeActivateTemplate(ctx),
    toggleActiveItem: makeToggleActiveItem(ctx),
    archiveTemplate: makeArchiveTemplate(ctx),
    unarchiveTemplate: makeUnarchiveTemplate(ctx),
  };
}
