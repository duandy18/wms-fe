// src/features/admin/shop-bundles/components/MerchantCodeBindingsPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { Fsku, Platform, MerchantCodeBindingRow } from "../types";
import { apiBindMerchantCode, apiListMerchantCodeBindings, apiUnbindMerchantCodeBinding } from "../api_merchant_code_bindings";
import { MerchantCodeBindingsTable } from "./merchant-code-bindings/MerchantCodeBindingsTable";

type Banner = { kind: "success" | "error"; message: string } | null;

function toMsg(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "发生未知错误";
  const s = String(msg || "").trim();
  return s || "发生未知错误";
}

type PropsGlobal = {
  mode?: "global";
  platform: Platform;
  setPlatform: (p: Platform) => void;

  shopId: string;
  setShopId: (v: string) => void;

  selectedFskuId: number | null;
  selectedFsku: Fsku | null;
  canBindSelected: boolean;
};

type PropsStore = {
  mode: "store";
  platform: Platform;
  shopId: string;
  storeName?: string;
};

type Props = PropsGlobal | PropsStore;

export const MerchantCodeBindingsPanel: React.FC<Props> = (props) => {
  const isStoreMode = props.mode === "store";

  const platform: Platform = props.platform;
  const shopId: string = props.shopId;

  const setPlatform: (p: Platform) => void = isStoreMode ? () => {} : (props as PropsGlobal).setPlatform;
  const setShopId: (v: string) => void = isStoreMode ? () => {} : (props as PropsGlobal).setShopId;

  const storeName = isStoreMode ? (props as PropsStore).storeName : undefined;

  const [banner, setBanner] = useState<Banner>(null);
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState<MerchantCodeBindingRow[]>([]);
  const [total, setTotal] = useState(0);

  const [newMerchantCode, setNewMerchantCode] = useState("");
  const [newReason, setNewReason] = useState("manual governance");

  // store mode：用手填 fsku_id（StoreDetail 没有“选中 FSKU”工作区）
  const [bindFskuIdText, setBindFskuIdText] = useState("");

  const [qMerchantCode, setQMerchantCode] = useState("");
  const [qFskuCode, setQFskuCode] = useState("");
  const [qFskuId, setQFskuId] = useState("");
  const [currentOnly, setCurrentOnly] = useState(true);

  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const qFskuIdNum = useMemo(() => {
    const s = qFskuId.trim();
    if (!s) return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    const i = Math.trunc(n);
    return i >= 1 ? i : null;
  }, [qFskuId]);

  const bindFskuIdNum = useMemo(() => {
    const s = bindFskuIdText.trim();
    if (!s) return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    const i = Math.trunc(n);
    return i >= 1 ? i : null;
  }, [bindFskuIdText]);

  async function load(args?: { offset?: number }) {
    setLoading(true);
    try {
      const data = await apiListMerchantCodeBindings({
        platform,
        shop_id: shopId.trim() ? shopId.trim() : undefined,
        merchant_code: qMerchantCode.trim() ? qMerchantCode.trim() : undefined,
        current_only: currentOnly,
        fsku_id: qFskuIdNum ?? undefined,
        fsku_code: qFskuCode.trim() ? qFskuCode.trim() : undefined,
        limit,
        offset: args?.offset ?? offset,
      });
      setRows(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      setRows([]);
      setTotal(0);
      setBanner({ kind: "error", message: toMsg(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBind() {
    const mc = newMerchantCode.trim();
    if (!mc) return setBanner({ kind: "error", message: "商家后端规格编码为必填。" });
    if (!shopId.trim()) return setBanner({ kind: "error", message: "shop_id 为必填（字符串）。" });
    if (!newReason.trim()) return setBanner({ kind: "error", message: "reason 为必填。" });

    const fskuId = isStoreMode ? bindFskuIdNum : (props as PropsGlobal).selectedFskuId;

    if (fskuId == null) {
      return setBanner({
        kind: "error",
        message: isStoreMode ? "请输入要绑定的 fsku_id。" : "请先在上方选择一个 FSKU。",
      });
    }

    if (!isStoreMode) {
      const canBindSelected = (props as PropsGlobal).canBindSelected;
      if (!canBindSelected) return setBanner({ kind: "error", message: "仅 published FSKU 允许绑定（请先发布）。" });
    }

    setBanner(null);
    setLoading(true);
    try {
      await apiBindMerchantCode({
        platform,
        shop_id: shopId,
        merchant_code: mc,
        fsku_id: fskuId,
        reason: newReason.trim(),
      });
      setBanner({ kind: "success", message: "绑定已写入：upsert 覆盖生效（无历史版本/无时间轴）。" });

      setQMerchantCode(mc);
      setCurrentOnly(true);
      setOffset(0);
      await load({ offset: 0 });
    } catch (e: unknown) {
      setBanner({ kind: "error", message: toMsg(e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseRow(r: MerchantCodeBindingRow) {
    setBanner(null);
    setLoading(true);
    try {
      await apiUnbindMerchantCodeBinding({
        platform: r.platform,
        shop_id: r.shop_id,
        merchant_code: r.merchant_code,
      });
      setBanner({ kind: "success", message: "已解绑：绑定已删除（delete）。" });
      await load();
    } catch (e: unknown) {
      setBanner({ kind: "error", message: toMsg(e) });
    } finally {
      setLoading(false);
    }
  }

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="text-sm font-semibold text-slate-800">
        {isStoreMode ? "解析绑定治理：商家后端规格编码 ↔ FSKU" : "③ 商家后端规格编码 ↔ FSKU 绑定表（治理事实）"}
      </div>

      {isStoreMode ? (
        <div className="text-[11px] text-slate-600">
          当前店铺：{storeName ?? "—"}（{platform}/{shopId}）
        </div>
      ) : null}

      {banner ? (
        <div
          className={
            banner.kind === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800"
              : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
          }
        >
          {banner.message}
        </div>
      ) : null}

      <MerchantCodeBindingsTable
        mode={isStoreMode ? "store" : "global"}
        platform={platform}
        setPlatform={setPlatform}
        shopId={shopId}
        setShopId={setShopId}
        qMerchantCode={qMerchantCode}
        setQMerchantCode={setQMerchantCode}
        qFskuCode={qFskuCode}
        setQFskuCode={setQFskuCode}
        qFskuId={qFskuId}
        setQFskuId={setQFskuId}
        currentOnly={currentOnly}
        setCurrentOnly={setCurrentOnly}
        total={total}
        limit={limit}
        offset={offset}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => {
          const next = Math.max(0, offset - limit);
          setOffset(next);
          void load({ offset: next });
        }}
        onNext={() => {
          const next = offset + limit;
          setOffset(next);
          void load({ offset: next });
        }}
        onRefresh={() => void load({ offset: 0 })}
        newMerchantCode={newMerchantCode}
        setNewMerchantCode={setNewMerchantCode}
        newReason={newReason}
        setNewReason={setNewReason}
        bindFskuIdText={bindFskuIdText}
        setBindFskuIdText={setBindFskuIdText}
        selectedFskuId={isStoreMode ? null : (props as PropsGlobal).selectedFskuId}
        selectedFsku={isStoreMode ? null : (props as PropsGlobal).selectedFsku}
        canBindSelected={isStoreMode ? true : (props as PropsGlobal).canBindSelected}
        rows={rows}
        loading={loading}
        onBind={() => void handleBind()}
        onClose={(r) => void handleCloseRow(r)}
      />

      <div className="text-[11px] text-slate-500">
        说明：此表仅维护“商家后端规格编码 ↔ FSKU”的治理事实（current-only：bind=upsert / 解绑=delete）。解析失败原因请在拣货页 Explain 查看。
      </div>
    </section>
  );
};
