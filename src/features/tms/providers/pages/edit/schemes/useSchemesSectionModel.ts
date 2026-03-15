// src/features/tms/providers/pages/edit/schemes/useSchemesSectionModel.ts
import { useEffect, useMemo, useState } from "react";
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

type ActiveBindingWarehouse = {
  warehouse_id: number;
  warehouse_label: string;
};

export function useSchemesSectionModel(args: {
  canWrite: boolean;
  busy: boolean;
  providerId: number | null;
  activeBindingWarehouses: ActiveBindingWarehouse[];

  schemes: PricingScheme[];
  loading: boolean;
  error: string | null;

  onRefresh: () => void | Promise<void>;
}) {
  const disabled = args.busy || !args.canWrite;

  const [newName, setNewName] = useState("");
  const [newCurrency, setNewCurrency] = useState("CNY");
  const [creating, setCreating] = useState(false);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  const [rowBusy, setRowBusy] = useState<number | null>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [localOk, setLocalOk] = useState<string | null>(null);
  const { flashOk } = useFlashOk(setLocalOk);

  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [hideTests, setHideTests] = useState(false);

  const batchBusy = false;
  const archivingId: number | null = null;

  useEffect(() => {
    if (args.activeBindingWarehouses.length === 1) {
      setSelectedWarehouseId(String(args.activeBindingWarehouses[0].warehouse_id));
      return;
    }

    setSelectedWarehouseId((prev) => {
      if (!prev) return "";
      const exists = args.activeBindingWarehouses.some((x) => String(x.warehouse_id) === prev);
      return exists ? prev : "";
    });
  }, [args.activeBindingWarehouses]);

  const summary = useMemo(() => {
    const visibleSchemes = args.schemes.filter((s) => !isArchived(s));
    const total = visibleSchemes.length;
    const activeN = visibleSchemes.filter((s) => s.status === "active").length;
    return { total, activeN };
  }, [args.schemes]);

  const filtered = useMemo(() => {
    const visibleSchemes = args.schemes.filter((s) => !isArchived(s));
    return filterAndSortSchemes({
      schemes: visibleSchemes,
      q,
      viewMode,
      hideTests,
      showArchived: false,
    });
  }, [args.schemes, q, viewMode, hideTests]);

  const { active: filteredActive, inactive: filteredInactive } = useMemo(() => {
    const parts = splitByStatus(filtered);
    return {
      active: parts.active,
      inactive: parts.inactive,
    };
  }, [filtered]);

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

    if (args.activeBindingWarehouses.length <= 0) {
      setLocalErr("当前网点还没有“已绑定且启用”的仓库，无法创建收费标准。请先在“仓库绑定”中启用至少一个仓库。");
      return;
    }

    const warehouseId = Number(selectedWarehouseId);
    if (!Number.isFinite(warehouseId) || warehouseId <= 0) {
      setLocalErr("请选择收费标准所属仓库。");
      return;
    }

    const selectedWarehouse = args.activeBindingWarehouses.find((x) => x.warehouse_id === warehouseId);
    if (!selectedWarehouse) {
      setLocalErr("当前选择的仓库不在“已绑定且启用”的列表中，请重新选择。");
      return;
    }

    setCreating(true);
    try {
      await createPricingScheme(args.providerId, {
        warehouse_id: warehouseId,
        name,
        currency: newCurrency || "CNY",
      });
      setNewName("");
      await args.onRefresh();
      flashOk(`已创建收费标准（仓库：${selectedWarehouse.warehouse_label}）`);
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
      setLocalErr("已归档方案当前为只读；如需修改，请先克隆为新的草稿方案。");
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
      setLocalErr("已归档方案不能发布；如需继续使用，请先克隆为新的草稿方案。");
      return;
    }

    if (s.status === "active") {
      flashOk("该方案已经是生效状态");
      return;
    }

    setRowBusy(s.id);
    try {
      await publishPricingScheme(s.id);
      await args.onRefresh();
      flashOk(`发布成功：${s.name} 已生效`);
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

    setRowBusy(s.id);
    try {
      await clonePricingScheme(s.id);
      await args.onRefresh();
      flashOk(`克隆成功：已基于「${s.name}」创建草稿方案`);
    } catch (e: unknown) {
      setLocalErr(e instanceof Error ? e.message : "克隆失败");
    } finally {
      setRowBusy(null);
    }
  }

  async function onArchiveScheme() {
    setLocalErr("当前后端主线未提供可用归档能力：前端不接假按钮，也不再发送旧 archived_at/status 合同。");
  }

  async function onUnarchiveScheme() {
    setLocalErr("当前后端主线未提供可用取消归档能力。");
  }

  async function batchDeactivateCurrent() {
    setLocalErr("当前主线已切到 publish/status 语义，旧的批量取消生效动作已退出主线。");
  }

  async function batchArchiveInactiveCurrent() {
    setLocalErr("当前后端主线未提供批量归档能力。");
  }

  return {
    disabled,

    newName,
    setNewName,
    newCurrency,
    setNewCurrency,
    creating,

    selectedWarehouseId,
    setSelectedWarehouseId,

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

    batchBusy,

    summary,
    filtered,
    filteredActive,
    filteredInactive,

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
