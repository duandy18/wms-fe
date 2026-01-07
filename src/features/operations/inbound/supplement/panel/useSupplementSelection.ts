// src/features/operations/inbound/supplement/panel/useSupplementSelection.ts

import { useState } from "react";
import type { ReceiveSupplementLine } from "../types";

export function useSupplementSelection() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReceiveSupplementLine | null>(null);

  const [editBatch, setEditBatch] = useState<string>("");
  const [editProd, setEditProd] = useState<string>("");
  const [editExp, setEditExp] = useState<string>("");

  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function onSelect(key: string, row: ReceiveSupplementLine) {
    setSelectedKey(key);
    setSelected(row);

    setEditBatch(row.batch_code ?? "");
    setEditProd(row.production_date ?? "");
    setEditExp(row.expiry_date ?? "");

    setSaveMsg(null);
    setSaveErr(null);
  }

  function clearSelection() {
    setSelectedKey(null);
    setSelected(null);
  }

  function clearMessages() {
    setSaveMsg(null);
    setSaveErr(null);
  }

  return {
    selectedKey,
    selected,
    onSelect,
    clearSelection,

    editBatch,
    editProd,
    editExp,
    setEditBatch,
    setEditProd,
    setEditExp,

    saveMsg,
    saveErr,
    saving,
    setSaveMsg,
    setSaveErr,
    setSaving,
    clearMessages,
  };
}
