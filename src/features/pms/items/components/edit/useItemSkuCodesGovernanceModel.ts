// src/features/pms/items/components/edit/useItemSkuCodesGovernanceModel.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  changePrimaryItemSkuCode,
  createItemSkuCode,
  disableItemSkuCode,
  enableItemSkuCode,
  fetchItemSkuCodes,
  type ItemSkuCode,
  type ItemSkuCodeType,
} from "../../api/itemSkuCodesOwnerApi";

type Banner = { kind: "success" | "error"; text: string } | null;

function errMsg(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

function normalizeCode(v: string): string {
  return String(v ?? "").trim().toUpperCase();
}

export function useItemSkuCodesGovernanceModel(args: {
  itemId: number;
  currentSku: string;
  onChanged: () => Promise<void>;
}) {
  const { itemId, currentSku, onChanged } = args;

  const [codes, setCodes] = useState<ItemSkuCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<Exclude<ItemSkuCodeType, "PRIMARY">>("ALIAS");
  const [newRemark, setNewRemark] = useState("");

  const [primaryCode, setPrimaryCode] = useState("");
  const [primaryRemark, setPrimaryRemark] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setBanner(null);
    try {
      const rows = await fetchItemSkuCodes(itemId);
      setCodes(rows);
    } catch (e: unknown) {
      setBanner({ kind: "error", text: errMsg(e, "加载 SKU 编码失败") });
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void load();
  }, [load]);

  const primary = useMemo(
    () => codes.find((x) => x.is_primary) ?? null,
    [codes],
  );

  const normalizedNewCode = normalizeCode(newCode);
  const canAdd = normalizedNewCode.length > 0 && normalizedNewCode.length <= 128 && !saving;

  const normalizedPrimaryCode = normalizeCode(primaryCode);
  const canChangePrimary =
    normalizedPrimaryCode.length > 0 &&
    normalizedPrimaryCode.length <= 128 &&
    normalizedPrimaryCode !== normalizeCode(currentSku) &&
    !saving;

  async function addCode() {
    if (!canAdd) return;

    setSaving(true);
    setBanner(null);
    try {
      const created = await createItemSkuCode(itemId, {
        code: normalizedNewCode,
        code_type: newType,
        is_active: true,
        remark: newRemark,
      });
      setNewCode("");
      setNewType("ALIAS");
      setNewRemark("");
      setBanner({ kind: "success", text: `已新增 ${created.code}` });
      await load();
    } catch (e: unknown) {
      setBanner({ kind: "error", text: errMsg(e, "新增 SKU 编码失败") });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: ItemSkuCode) {
    if (row.is_primary) {
      setBanner({ kind: "error", text: "当前主 SKU 不能停用；如需停用，请先切换主 SKU。" });
      return;
    }

    const actionText = row.is_active ? "停用" : "启用";
    const ok = window.confirm(`确认${actionText} SKU 编码「${row.code}」？`);
    if (!ok) return;

    setSaving(true);
    setBanner(null);
    try {
      if (row.is_active) {
        await disableItemSkuCode(itemId, row.id);
      } else {
        await enableItemSkuCode(itemId, row.id);
      }
      setBanner({ kind: "success", text: `已${actionText} ${row.code}` });
      await load();
    } catch (e: unknown) {
      setBanner({ kind: "error", text: errMsg(e, `${actionText} SKU 编码失败`) });
    } finally {
      setSaving(false);
    }
  }

  async function changePrimary(code: string, remark?: string) {
    const target = normalizeCode(code);
    if (!target) return;

    const ok = window.confirm(
      `确认将「${target}」切换为当前主 SKU？历史单据中的 SKU 快照不会追改。`,
    );
    if (!ok) return;

    setSaving(true);
    setBanner(null);
    try {
      const updated = await changePrimaryItemSkuCode(itemId, {
        code: target,
        remark: remark ?? primaryRemark,
      });
      setPrimaryCode("");
      setPrimaryRemark("");
      setBanner({ kind: "success", text: `当前主 SKU 已切换为 ${updated.code}` });
      await load();
      await onChanged();
    } catch (e: unknown) {
      setBanner({ kind: "error", text: errMsg(e, "切换主 SKU 失败") });
    } finally {
      setSaving(false);
    }
  }

  return {
    codes,
    primary,
    loading,
    saving,
    banner,

    newCode,
    setNewCode,
    newType,
    setNewType,
    newRemark,
    setNewRemark,
    canAdd,
    addCode,

    primaryCode,
    setPrimaryCode,
    primaryRemark,
    setPrimaryRemark,
    canChangePrimary,
    changePrimary,

    toggleActive,
    refresh: load,
  };
}
