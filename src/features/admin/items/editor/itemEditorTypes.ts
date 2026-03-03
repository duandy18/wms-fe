// src/features/admin/items/editor/itemEditorTypes.ts

import type { FormEvent } from "react";
import type { Supplier } from "../../suppliers/api";
import type { Item } from "../../../../contracts/item/contract";
import type { FormState } from "../create/types";
import type { Flash, FieldErrors } from "./schema";

export type ItemEditorMode = "create" | "edit";

export type ItemEditorVm = {
  mode: ItemEditorMode;
  editorTitle: string;

  suppliers: Supplier[];
  supLoading: boolean;
  supError: string | null;

  selectedItem: Item | null;
  selectedPrimaryBarcode: string;

  form: FormState;
  setForm: (next: FormState) => void;

  saving: boolean;
  error: string | null;
  flash: Flash;
  fieldErrors: FieldErrors;

  created: { id: number; sku: string } | null;

  canSubmit: boolean;

  resetToCreate: () => void;
  resetToEditOriginal: () => void;
  submit: (e: FormEvent) => Promise<void>;
};
