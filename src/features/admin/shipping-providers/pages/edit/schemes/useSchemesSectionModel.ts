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
  renameScheme,
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

    const target = args.schemes.find((x) => x.id === schemeId) ?? null;

    // ✅ 单选生效：设为生效时，提示会自动取消其它已生效项（后端已保证原子独占）
    if (active) {
      const currentActive = args.schemes.find((s) => s.active && !isArchived(s) && s.id !== schemeId) ?? null;

      if (currentActive) {
        const ok = window.confirm(
          `设为生效：${target?.name ?? `scheme#${schemeId}`}（ID: ${schemeId}）？\n\n` +
            `提示：同一网点任意时刻只能有一个生效方案。\n` +
            `继续将自动取消生效：${currentActive.name}（ID: ${currentActive.id}）。`,
        );
        if (!ok) return;
      } else {
        const ok = window.confirm(`设为生效：${target?.name ?? `scheme#${schemeId}`}（ID: ${schemeId}）？`);
        if (!ok) return;
      }
    }

    setRowBusy(schemeId);
    try {
      await patchActive(schemeId, active);
      await args.onRefresh();
      if (active) flashOk(`已设为生效：${target?.name ?? `scheme#${schemeId}`}`);
      else flashOk(`已取消生效：${target?.name ?? `scheme#${schemeId}`}`);
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "操作失败");
    } finally {
      setRowBusy(null);
    }
  }

  async function onRenameScheme(s: PricingScheme) {
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    const cur = (s.name ?? "").trim();
    const input = window.prompt(`修改收费标准名称（ID: ${s.id}）\n\n当前：${cur || "—"}\n请输入新名称：`, cur);
    if (input == null) return;

    const next = input.trim();
    if (!next) {
      setLocalErr("名称不能为空");
      return;
    }

    if (next === cur) {
      flashOk("名称未变化");
      return;
    }

    setRowBusy(s.id);
    try {
      await renameScheme(s.id, next);
      await args.onRefresh();
      flashOk("已更新名称");
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "改名失败");
    } finally {
      setRowBusy(null);
    }
  }

  // ✅ 原则：只有取消生效（停运）的才能归档
  async function onArchiveScheme(s: PricingScheme) {
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    if (isArchived(s)) {
      setLocalErr("该收费标准已归档，无需重复归档。");
      return;
    }

    if (s.active) {
      setLocalErr("生效中的收费标准不允许归档：请先取消生效。");
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

    const ok = window.confirm(`取消归档「${s.name}」（ID: ${s.id}）？\n取消归档不会自动设为生效。`);
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
      setLocalErr("当前筛选结果没有可取消生效的项。");
      return;
    }

    const ok = window.confirm(`将当前筛选结果中的 ${targets.length} 条收费标准全部取消生效？`);
    if (!ok) return;

    setBatchBusy(true);
    try {
      await batchDeactivate(targets);
      await args.onRefresh();
      flashOk(`已批量取消生效 ${targets.length} 条`);
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "批量取消生效失败");
    } finally {
      setBatchBusy(false);
    }
  }

  // ✅ 批量归档：只归档“未生效且未归档”的项（坚持原则）
  async function batchArchiveInactiveCurrent() {
    if (disabled) return;

    setLocalErr(null);
    setLocalOk(null);

    const targets = filteredInactive.map((s) => s.id);
    if (targets.length === 0) {
      setLocalErr("当前筛选结果没有可归档的未生效项。");
      return;
    }

    const ok = window.confirm(`归档当前筛选结果中的 ${targets.length} 条未生效收费标准？`);
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
    onRenameScheme,
    onArchiveScheme,
    onUnarchiveScheme,

    batchDeactivateCurrent,
    batchArchiveInactiveCurrent,
  };
}
