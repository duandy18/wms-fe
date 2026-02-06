// src/features/system/shop-bundles/ShopProductBundlesPage.tsx
import React, { useMemo, useState } from "react";
import type { Fsku, Platform } from "./types";
import { useShopBundles } from "./store";
import { FskuListPanel } from "./components/FskuListPanel";
import { PlatformBindingPanel } from "./components/PlatformBindingPanel";
import { FskuBuildWorkspace } from "./components/FskuBuildWorkspace";

type DraftShape = "bundle" | "single";

function parseShopId(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  return i >= 0 ? i : null;
}

function safeFskus(v: unknown): Fsku[] {
  return Array.isArray(v) ? (v as Fsku[]) : [];
}

export default function ShopProductBundlesPage() {
  const B = useShopBundles();

  const fskus = useMemo(() => safeFskus((B as unknown as { fskus: unknown }).fskus), [B]);
  const [selectedFskuId, setSelectedFskuId] = useState<number | null>(null);

  const [platform, setPlatform] = useState<Platform>("PDD");
  const [shopId, setShopId] = useState("1");
  const [platformSkuId, setPlatformSkuId] = useState("");
  const [reason, setReason] = useState("test");

  const [uiError, setUiError] = useState<string | null>(null);

  const selectedFsku: Fsku | null = useMemo(() => {
    if (selectedFskuId == null) return null;
    return fskus.find((x) => x.id === selectedFskuId) ?? null;
  }, [selectedFskuId, fskus]);

  async function handleCreateDraft(args: { name: string; shape: DraftShape; codeText: string }): Promise<{ id: number; name: string }> {
    setUiError(null);
    try {
      const created = await B.createFskuDraft({
        name: args.name || "新组合",
        unit_label: "件",
      });

      setSelectedFskuId(created.id);
      await B.refreshFskus();

      return { id: created.id, name: created.name };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "创建草稿失败";
      setUiError(msg);
      throw e;
    }
  }

  async function handlePublishSelected(id: number): Promise<void> {
    setUiError(null);
    try {
      await B.publishFsku(id);
      await B.refreshFskus();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "发布失败";
      setUiError(msg);
      throw e;
    }
  }

  async function handleLoadMirrorAndBindings() {
    const sku = platformSkuId.trim();
    if (!sku) {
      setUiError("请输入 platform_sku_id。");
      return;
    }
    const sid = parseShopId(shopId);
    if (sid == null) {
      setUiError("shop_id 必须是整数。");
      return;
    }

    setUiError(null);
    await Promise.all([
      B.loadMirror({ platform, shop_id: sid, platform_sku_id: sku }),
      B.loadBindings({ platform, shop_id: sid, platform_sku_id: sku }),
    ]);
  }

  async function handleBindSelectedFsku() {
    const sku = platformSkuId.trim();
    if (!sku) {
      setUiError("请输入 platform_sku_id。");
      return;
    }
    const sid = parseShopId(shopId);
    if (sid == null) {
      setUiError("shop_id 必须是整数。");
      return;
    }
    if (selectedFskuId == null) {
      setUiError("请先选择一个 FSKU（或在左侧组件卡中新建草稿）。");
      return;
    }
    const r = reason.trim();
    if (!r) {
      setUiError("reason 为必填。");
      return;
    }

    setUiError(null);
    await B.upsertBinding({
      platform,
      shop_id: sid,
      platform_sku_id: sku,
      fsku_id: selectedFskuId,
      reason: r,
    });
    await B.loadBindings({ platform, shop_id: sid, platform_sku_id: sku });
  }

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">商铺商品组合</h1>
        <div className="text-[11px] text-slate-500">先建设 FSKU（主数据）；再做平台链接反推（下一刀）。</div>
      </header>

      {uiError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{uiError}</div>
      ) : null}

      <section className="space-y-6">
        <div className="text-sm font-semibold text-slate-800">一、建设 FSKU</div>

        <FskuListPanel
          fskus={fskus}
          loading={B.fskusLoading}
          error={B.fskusError}
          onRefresh={() => void B.refreshFskus()}
          selectedFskuId={selectedFskuId}
          setSelectedFskuId={(v) => setSelectedFskuId(v)}
        />

        <FskuBuildWorkspace
          fskuId={selectedFskuId}
          status={selectedFsku?.status ?? null}
          onCreateDraft={(args) => handleCreateDraft(args)}
          onPublishSelected={(id) => handlePublishSelected(id)}
        />
      </section>

      <section className="space-y-3">
        <div className="text-sm font-semibold text-slate-800">二、平台链接反推 FSKU（下一刀）</div>

        <PlatformBindingPanel
          platform={platform}
          setPlatform={setPlatform}
          shopId={shopId}
          setShopId={setShopId}
          platformSkuId={platformSkuId}
          setPlatformSkuId={setPlatformSkuId}
          onLoadMirrorAndBindings={() => void handleLoadMirrorAndBindings()}
          mirror={B.mirror}
          mirrorLoading={B.mirrorLoading}
          mirrorError={B.mirrorError}
          currentBinding={B.currentBinding}
          historyBindings={B.historyBindings}
          bindingsLoading={B.bindingsLoading}
          bindingsError={B.bindingsError}
          reason={reason}
          setReason={setReason}
          selectedFskuId={selectedFskuId}
          selectedFsku={selectedFsku}
          canBindSelected={selectedFsku?.status === "published"}
          onBindSelectedFsku={() => void handleBindSelectedFsku()}
        />
      </section>
    </div>
  );
}
