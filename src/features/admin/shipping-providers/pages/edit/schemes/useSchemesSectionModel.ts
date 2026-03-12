// src/features/admin/shipping-providers/pages/edit/schemes/useSchemesSectionModel.ts
import { useMemo, useState } from "react";
import type { PricingScheme } from "../../../api/types";
import {
  clonePricingScheme,
  createPricingScheme,
  patchPricingScheme,
  publishPricingScheme,
} from "../../../api/schemes";
import { filterAndSortSchemes, splitByStatus } from "./filters";
import { useFlashOk } from "./flashOk";
import { isArchived, type ViewMode } from "./types";

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
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [localOk, setLocalOk] = useState<string | null>(null);
  const { flashOk } = useFlashOk(setLocalOk);

  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [hideTests, setHideTests] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const batchBusy = false;
  const archivingId: number | null = null;

  const summary = useMemo(() => {
    const total = args.schemes.length;
    const activeN = args.schemes.filter((s) => s.status === "active" && !isArchived(s)).length;
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
      await createPricingScheme(args.providerId, {
        name,
        currency: newCurrency || "CNY",
      });
      setNewName("");
      await args.onRefresh();
      flashOk("已创建收费标准");
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  async function onRenameScheme(s: PricingScheme, nextName: string) {
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    if (isArchived(s)) {
      setLocalErr("已归档方案不允许改名。");
      return;
    }

    if (s.status === "active") {
      setLocalErr("生效中的方案不允许直接改名；请先克隆为草稿后再修改。");
      return;
    }

    const cur = (s.name ?? "").trim();
    const next = (nextName ?? "").trim();

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
      await patchPricingScheme(s.id, { name: next });
      await args.onRefresh();
      flashOk("已更新名称");
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "改名失败");
    } finally {
      setRowBusy(null);
    }
  }

  async function onPublishScheme(s: PricingScheme) {
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    if (isArchived(s)) {
      setLocalErr("已归档方案不能发布。");
      return;
    }

    if (s.status === "active") {
      flashOk("该方案已经是生效状态");
      return;
    }

    const ok = window.confirm(
      `发布收费标准「${s.name}」（ID: ${s.id}）？\n\n发布后将成为当前网点的生效方案；同仓同承运商下其他 active 方案会由后端自动归档。`,
    );
    if (!ok) return;

    setRowBusy(s.id);
    try {
      await publishPricingScheme(s.id);
      await args.onRefresh();
      flashOk(`已发布生效：${s.name}`);
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "发布失败");
    } finally {
      setRowBusy(null);
    }
  }

  async function onCloneScheme(s: PricingScheme) {
    if (disabled || batchBusy) return;

    setLocalErr(null);
    setLocalOk(null);

    const ok = window.confirm(`克隆收费标准「${s.name}」（ID: ${s.id}）为新的草稿方案？`);
    if (!ok) return;

    setRowBusy(s.id);
    try {
      await clonePricingScheme(s.id);
      await args.onRefresh();
      flashOk("已克隆为草稿");
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "克隆失败");
    } finally {
      setRowBusy(null);
    }
  }

  async function onArchiveScheme() {
    setLocalErr("当前后端主线未提供独立归档接口，前端先不接假动作。");
  }

  async function onUnarchiveScheme() {
    setLocalErr("当前后端主线未提供取消归档接口。");
  }

  async function batchDeactivateCurrent() {
    setLocalErr("当前主线已切到 publish/status 语义，旧的批量取消生效动作先不使用。");
  }

  async function batchArchiveInactiveCurrent() {
    setLocalErr("当前后端主线未提供批量归档接口。");
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
    onRenameScheme,
    onPublishScheme,
    onCloneScheme,
    onArchiveScheme,
    onUnarchiveScheme,

    batchDeactivateCurrent,
    batchArchiveInactiveCurrent,
  };
}

export default useSchemesSectionModel;
