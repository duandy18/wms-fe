import { useState } from "react";
import type { Fsku } from "../../types";
import { apiPatchFskuName } from "../../api";
import type { Banner } from "./utils";

export function useFskuNameEditor(args: { fskuById: Map<number, Fsku>; onRefresh: () => void }): {
  banner: Banner;
  editingId: number | null;
  editingName: string;
  savingId: number | null;

  setEditingName: (v: string) => void;

  startEdit: (id: number) => void;
  cancelEdit: () => void;
  saveEdit: (id: number) => Promise<void>;
} {
  const { fskuById, onRefresh } = args;

  const [banner, setBanner] = useState<Banner>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  function startEdit(id: number) {
    const f = fskuById.get(id);
    if (!f) return;
    if (f.status === "retired") {
      setBanner({ kind: "error", text: "该 FSKU 已归档，名称不可修改。" });
      return;
    }
    setBanner(null);
    setEditingId(id);
    setEditingName(f.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setSavingId(null);
  }

  async function saveEdit(id: number) {
    const f = fskuById.get(id);
    if (!f) return;

    if (f.status === "retired") {
      setBanner({ kind: "error", text: "该 FSKU 已归档，名称不可修改。" });
      return;
    }

    const nm = editingName.trim();
    if (!nm) {
      setBanner({ kind: "error", text: "名称不能为空。" });
      return;
    }

    if (nm === f.name.trim()) {
      setBanner({ kind: "success", text: "名称未变化，无需保存。" });
      cancelEdit();
      return;
    }

    setSavingId(id);
    setBanner(null);
    try {
      await apiPatchFskuName(id, nm);
      setBanner({ kind: "success", text: "名称已更新（列表将刷新并以 updated_at 为准）。" });
      cancelEdit();
      onRefresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存失败";
      setBanner({ kind: "error", text: msg });
    } finally {
      setSavingId(null);
    }
  }

  return {
    banner,
    editingId,
    editingName,
    savingId,

    setEditingName,

    startEdit,
    cancelEdit,
    saveEdit,
  };
}
