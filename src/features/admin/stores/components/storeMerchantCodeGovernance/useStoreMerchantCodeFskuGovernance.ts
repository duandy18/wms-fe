// src/features/admin/stores/components/storeMerchantCodeGovernance/useStoreMerchantCodeFskuGovernance.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Fsku, MerchantCodeBindingRow } from "../../../shop-bundles/types";
import { apiListStoreFskus } from "../../../shop-bundles/api_fsku";
import { apiBindMerchantCode, apiListMerchantCodeBindings, apiUnbindMerchantCodeBinding } from "../../../shop-bundles/api_merchant_code_bindings";
import type { GovernanceActions, GovernanceProps, GovernanceState, RowState } from "./types";
import { toMsg } from "./types";

function buildCurrentIndex(rows: MerchantCodeBindingRow[]): Map<string, MerchantCodeBindingRow> {
  const m = new Map<string, MerchantCodeBindingRow>();
  for (const r of rows) m.set(r.merchant_code, r);
  return m;
}

export function useStoreMerchantCodeFskuGovernance(props: GovernanceProps): {
  state: GovernanceState;
  actions: GovernanceActions;
} {
  const { storeId, platform, shopId, canWrite } = props;

  const [fskus, setFskus] = useState<Fsku[]>([]);
  const [fskusLoading, setFskusLoading] = useState(false);

  const [banner, setBanner] = useState<GovernanceState["banner"]>(null);
  const [loading, setLoading] = useState(false);

  const [currentBindings, setCurrentBindings] = useState<MerchantCodeBindingRow[]>([]);
  const currentByMerchantCode = useMemo(() => buildCurrentIndex(currentBindings), [currentBindings]);

  const [reason, setReason] = useState("store governance: merchant_code defaults to fsku.code");

  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  const refreshFskus = useCallback(async () => {
    const sid = Math.trunc(storeId);
    if (!Number.isFinite(sid) || sid <= 0) {
      setFskus([]);
      return;
    }

    setFskusLoading(true);
    try {
      // ✅ 终态 C：店铺治理卡只走 Store-scoped API（带 store_id，PROD 会过滤测试 FSKU）
      const list = await apiListStoreFskus({ storeId: sid, status: "published", limit: 200, offset: 0 });
      setFskus(list.filter((x) => x.status === "published"));
    } catch (e: unknown) {
      setFskus([]);
      setBanner({ kind: "error", message: `加载 FSKU 列表失败：${toMsg(e)}` });
    } finally {
      setFskusLoading(false);
    }
  }, [storeId]);

  // 补齐/清理 rowState
  useEffect(() => {
    setRowState((prev) => {
      const next: Record<string, RowState> = { ...prev };
      for (const f of fskus) {
        const k = String(f.id);
        if (!next[k]) {
          next[k] = { checked: false, merchantCode: f.code, expanded: false };
        } else if (!next[k].merchantCode) {
          next[k] = { ...next[k], merchantCode: f.code };
        }
      }
      for (const k of Object.keys(next)) {
        const exists = fskus.some((f) => String(f.id) === k);
        if (!exists) delete next[k];
      }
      return next;
    });
  }, [fskus]);

  const selectedCount = useMemo(() => {
    let n = 0;
    for (const f of fskus) {
      const s = rowState[String(f.id)];
      if (s?.checked) n += 1;
    }
    return n;
  }, [fskus, rowState]);

  const refreshBindings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiListMerchantCodeBindings({
        platform,
        shop_id: shopId,
        current_only: true,
        limit: 200,
        offset: 0,
      });
      setCurrentBindings(data.items);
    } catch (e: unknown) {
      setCurrentBindings([]);
      setBanner({ kind: "error", message: `加载绑定失败：${toMsg(e)}` });
    } finally {
      setLoading(false);
    }
  }, [platform, shopId]);

  useEffect(() => {
    void refreshFskus();
    void refreshBindings();
  }, [refreshFskus, refreshBindings]);

  function setCheckedAll(checked: boolean) {
    setRowState((prev) => {
      const next: Record<string, RowState> = { ...prev };
      for (const f of fskus) {
        const k = String(f.id);
        const cur = next[k] ?? { checked: false, merchantCode: f.code, expanded: false };
        next[k] = { ...cur, checked };
      }
      return next;
    });
  }

  function setRowChecked(fskuId: number, checked: boolean) {
    const k = String(fskuId);
    setRowState((prev) => {
      const cur = prev[k] ?? { checked: false, merchantCode: "", expanded: false };
      return { ...prev, [k]: { ...cur, checked } };
    });
  }

  function setRowMerchantCode(fskuId: number, merchantCode: string) {
    const k = String(fskuId);
    setRowState((prev) => {
      const cur = prev[k] ?? { checked: false, merchantCode: "", expanded: false };
      return { ...prev, [k]: { ...cur, merchantCode } };
    });
  }

  function toggleExpanded(fskuId: number) {
    const k = String(fskuId);
    setRowState((prev) => {
      const cur = prev[k] ?? { checked: false, merchantCode: "", expanded: false };
      return { ...prev, [k]: { ...cur, expanded: !cur.expanded } };
    });
  }

  async function bindOne(f: Fsku) {
    if (!canWrite) {
      setBanner({ kind: "error", message: "当前账号无写权限（config.store.write），不能写入绑定。" });
      return;
    }
    const s = rowState[String(f.id)];
    const mc = (s?.merchantCode ?? "").trim();
    if (!mc) {
      setBanner({ kind: "error", message: `FSKU #${f.id} 缺少 merchant_code（店铺商品代码）。` });
      return;
    }
    if (!reason.trim()) {
      setBanner({ kind: "error", message: "reason 为必填。" });
      return;
    }

    setBanner(null);
    setLoading(true);
    try {
      await apiBindMerchantCode({
        platform,
        shop_id: shopId,
        merchant_code: mc,
        fsku_id: f.id,
        reason: reason.trim(),
      });
      setBanner({ kind: "success", message: `已绑定：${mc} → FSKU #${f.id}` });
      await refreshBindings();
    } catch (e: unknown) {
      setBanner({ kind: "error", message: toMsg(e) });
    } finally {
      setLoading(false);
    }
  }

  async function bindSelected() {
    if (!canWrite) {
      setBanner({ kind: "error", message: "当前账号无写权限（config.store.write），不能写入绑定。" });
      return;
    }
    if (!reason.trim()) {
      setBanner({ kind: "error", message: "reason 为必填。" });
      return;
    }
    const selected = fskus.filter((f) => rowState[String(f.id)]?.checked);
    if (!selected.length) {
      setBanner({ kind: "error", message: "请先勾选要绑定的 FSKU 行。" });
      return;
    }
    for (const f of selected) {
      const mc = (rowState[String(f.id)]?.merchantCode ?? "").trim();
      if (!mc) {
        setBanner({ kind: "error", message: `FSKU #${f.id} 缺少 merchant_code（店铺商品代码）。` });
        return;
      }
    }

    setBanner(null);
    setLoading(true);
    try {
      for (const f of selected) {
        const mc = (rowState[String(f.id)]?.merchantCode ?? "").trim();
        await apiBindMerchantCode({
          platform,
          shop_id: shopId,
          merchant_code: mc,
          fsku_id: f.id,
          reason: reason.trim(),
        });
      }
      setBanner({ kind: "success", message: `批量绑定完成：${selected.length} 行已写入。` });
      await refreshBindings();
      setCheckedAll(false);
    } catch (e: unknown) {
      setBanner({ kind: "error", message: `批量绑定失败：${toMsg(e)}` });
    } finally {
      setLoading(false);
    }
  }

  async function closeCurrentByMerchantCode(merchantCode: string) {
    if (!canWrite) {
      setBanner({ kind: "error", message: "当前账号无写权限（config.store.write），不能解绑。" });
      return;
    }
    const mc = merchantCode.trim();
    if (!mc) return;

    setBanner(null);
    setLoading(true);
    try {
      await apiUnbindMerchantCodeBinding({
        platform,
        shop_id: shopId,
        merchant_code: mc,
      });
      setBanner({ kind: "success", message: `已解绑：${mc}` });
      await refreshBindings();
    } catch (e: unknown) {
      setBanner({ kind: "error", message: toMsg(e) });
    } finally {
      setLoading(false);
    }
  }

  const state: GovernanceState = {
    fskus,
    rowState,
    banner,
    loading: loading || fskusLoading,
    reason,
    selectedCount,
    currentByMerchantCode,
  };

  const actions: GovernanceActions = {
    refreshFskus,
    refreshBindings,
    setReason,
    setCheckedAll,
    setRowChecked,
    setRowMerchantCode,
    toggleExpanded,
    bindOne,
    bindSelected,
    closeCurrentByMerchantCode,
  };

  return { state, actions };
}
