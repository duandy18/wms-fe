// src/features/admin/shipping-providers/pages/edit/schemes/useSchemesSectionModel.ts
import { useMemo, useState } from "react";
import type { PricingScheme } from "../../../api/types";
import { filterAndSortSchemes, splitByStatus } from "./filters";
import { useFlashOk } from "./flashOk";
import { isArchived } from "./types";
import type { ViewMode } from "./types";
import {
  archiveScheme,
  assertNotArchivedOrThrow,
  batchArchiveInactive,
  batchDeactivate,
  createScheme,
  patchActive,
  unarchiveScheme,
} from "./actions";

export function useSchemesSectionModel(args: {
  canWrite: boolean;
  busy: boolean;
  providerId: number | null;

  schemes: PricingScheme[];
  loading: boolean;
  error: string | null;

  onRefresh: () => void | Promise<void>;
}) {
  const disabled = args.busy || !args.canWrite;

  const [newName, setNewName] = useState("");
  const [newCurrency, setNewCurrency] = useState("CNY");
  const [creating, setCreating] = useState(false);

  const [rowBusy, setRowBusy] = useState<number | null>(null);
  const [archivingId, setArchivingId] = useState<number | null>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [localOk, setLocalOk] = useState<string | null>(null);
  const { flashOk } = useFlashOk(setLocalOk);

  // filter
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [hideTests, setHideTests] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const [batchBusy, setBatchBusy] = useState(false);

  const summary = useMemo(() => {
    const total = args.schemes.length;
    const activeN = args.schemes.filter((s) => s.active).length;
    return { total, activeN };
  }, [args.schemes]);

  const filtered = useMemo(() => {
    return filterAndSortSchemes({
      schemes: args.schemes,
      q,
      viewMode,
      hideTests,
      showArchived,
    });
  }, [args.schemes, q, viewMode, hideTests, showArchived]);

  const { active: filteredActive, inactive: filteredInactive, archived: filteredArchived } = useMemo(
    () => splitByStatus(filtered),
    [filtered],
  );

  async function onCreate() {
    if (!args.providerId) return;
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    const name = newName.trim();
    if (!name) {
      setLocalErr("收费标准名称不能为空");
      return;
    }

    setCreating(true);
    try {
      await createScheme(args.providerId, name, newCurrency || "CNY");
      setNewName("");
      await args.onRefresh();
      flashOk("已创建收费标准");
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  async function setActive(schemeId: number, active: boolean) {
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    try {
      assertNotArchivedOrThrow(args.schemes, schemeId);
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "操作失败");
      return;
    }

    setRowBusy(schemeId);
    try {
      await patchActive(schemeId, active);
      await args.onRefresh();
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "操作失败");
    } finally {
      setRowBusy(null);
    }
  }

  // ✅ 原则：只有停用（停运）的才能归档
  async function onArchiveScheme(s: PricingScheme) {
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    if (isArchived(s)) {
      setLocalErr("该收费标准已归档，无需重复归档。");
      return;
    }

    if (s.active) {
      setLocalErr("启用中的收费标准不允许归档：请先停用。");
      return;
    }

    const ok = window.confirm(`归档收费标准「${s.name}」（ID: ${s.id}）？\n归档后默认从列表隐藏，可在“显示已归档”中查看。`);
    if (!ok) return;

    setArchivingId(s.id);
    try {
      await archiveScheme(s, new Date().toISOString());
      await args.onRefresh();
      flashOk("已归档收费标准");
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "归档失败");
    } finally {
      setArchivingId(null);
    }
  }

  async function onUnarchiveScheme(s: PricingScheme) {
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    if (!isArchived(s)) {
      setLocalErr("该收费标准未归档。");
      return;
    }

    const ok = window.confirm(`取消归档「${s.name}」（ID: ${s.id}）？\n取消归档不会自动启用。`);
    if (!ok) return;

    setArchivingId(s.id);
    try {
      await unarchiveScheme(s);
      await args.onRefresh();
      flashOk("已取消归档");
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "取消归档失败");
    } finally {
      setArchivingId(null);
    }
  }

  async function batchDeactivateCurrent() {
    if (disabled) return;

    setLocalErr(null);
    setLocalOk(null);

    const targets = filteredActive.map((s) => s.id);
    if (targets.length === 0) {
      setLocalErr("当前筛选结果没有可停用的启用项。");
      return;
    }

    const ok = window.confirm(`将当前筛选结果中的 ${targets.length} 条收费标准全部停用？`);
    if (!ok) return;

    setBatchBusy(true);
    try {
      await batchDeactivate(targets);
      await args.onRefresh();
      flashOk(`已批量停用 ${targets.length} 条`);
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "批量停用失败");
    } finally {
      setBatchBusy(false);
    }
  }

  // ✅ 批量归档：只归档“停用且未归档”的项（坚持原则）
  async function batchArchiveInactiveCurrent() {
    if (disabled) return;

    setLocalErr(null);
    setLocalOk(null);

    const targets = filteredInactive.map((s) => s.id);
    if (targets.length === 0) {
      setLocalErr("当前筛选结果没有可归档的停用项。");
      return;
    }

    const ok = window.confirm(`归档当前筛选结果中的 ${targets.length} 条停用收费标准？`);
    if (!ok) return;

    setBatchBusy(true);
    try {
      await batchArchiveInactive(targets, new Date().toISOString());
      await args.onRefresh();
      flashOk(`已批量归档 ${targets.length} 条`);
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "批量归档失败");
    } finally {
      setBatchBusy(false);
    }
  }

  return {
    disabled,

    newName,
    setNewName,
    newCurrency,
    setNewCurrency,
    creating,

    rowBusy,
    archivingId,
    localErr,
    localOk,

    q,
    setQ,
    viewMode,
    setViewMode,
    hideTests,
    setHideTests,
    showArchived,
    setShowArchived,

    batchBusy,

    summary,
    filtered,
    filteredActive,
    filteredInactive,
    filteredArchived,

    onCreate,
    setActive,
    onArchiveScheme,
    onUnarchiveScheme,

    batchDeactivateCurrent,
    batchArchiveInactiveCurrent,
  };
}
