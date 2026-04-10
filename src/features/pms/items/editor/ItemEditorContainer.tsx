// src/features/pms/items/editor/ItemEditorContainer.tsx

import React, { useEffect } from "react";
import { useItemsStore } from "../model/itemsStore";
import { useSuppliersOptions } from "../hooks/useSuppliersOptions";
import { EMPTY_FORM } from "../create/types";
import useItemEditor from "./useItemEditor";
import type { ItemEditorVm } from "./useItemEditor";
import ItemEditorForm from "./ItemEditorForm";

const EDITOR_ANCHOR_ID = "items-editor";

const ItemEditorContainer: React.FC = () => {
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const loadItems = useItemsStore((s) => s.loadItems);

  const { suppliers, supLoading, supError } = useSuppliersOptions();

  const vm: ItemEditorVm = useItemEditor({
    selectedItem,
    suppliers,
    supLoading,
    supError,
    emptyForm: { ...EMPTY_FORM },
    onAfterSaved: async () => {
      await loadItems();
    },
    onResetToCreate: () => setSelectedItem(null),
  });

  useEffect(() => {
    if (!selectedItem) return;
    const el = document.getElementById(EDITOR_ANCHOR_ID);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedItem]);

  return (
    <section id={EDITOR_ANCHOR_ID} className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
      <ItemEditorForm vm={vm} />
    </section>
  );
};

export default ItemEditorContainer;
