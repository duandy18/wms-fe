// src/features/system/shop-bundles/ShopProductBundlesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
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

type UiNotice = { kind: "success" | "error"; message: string } | null;

function normalizeErrMsg(raw: unknown): string {
  const msg = raw instanceof Error ? raw.message : typeof raw === "string" ? raw : "发生未知错误";
  const s = String(msg || "").trim();
  const low = s.toLowerCase();

  if (low === "not found" || low.includes("http 404") || low.includes("404")) {
    return "接口未找到（404）。请确认后端已更新并重启：/fskus/{id}/unretire";
  }
  return s || "发生未知错误";
}

function toTs(s: string | null | undefined): number {
  if (!s) return 0;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function ShopProductBundlesPage() {
  const B = useShopBundles();

  const fskus = useMemo(() => safeFskus((B as unknown as { fskus: unknown }).fskus), [B]);
  const [selectedFskuId, setSelectedFskuId] = useState<number | null>(null);

  const [platform, setPlatform] = useState<Platform>("PDD");
  const [shopId, setShopId] = useState("1");
  const [platformSkuId, setPlatformSkuId] = useState("");
  const [reason, setReason] = useState("test");

  const [uiNotice, setUiNotice] = useState<UiNotice>(null);

  // ✅ 筛选控制（默认：只看可用；退休默认隐藏）
  const [onlyUsable, setOnlyUsable] = useState(true);
  const [showRetired, setShowRetired] = useState(false);

  const filteredSortedFskus = useMemo(() => {
    let arr = [...fskus];

    // 1) 过滤：只看可用
    if (onlyUsable) {
      arr = arr.filter((x) => x.status === "published");
    } else {
      // 不只看可用时：默认不展示退休，除非 showRetired 打开
      if (!showRetired) arr = arr.filter((x) => x.status !== "retired");
    }

    // 2) 排序：退休沉底（即使 showRetired 开启），其余按 updated_at 倒序
    arr.sort((a, b) => {
      const ar = a.status === "retired" ? 1 : 0;
      const br = b.status === "retired" ? 1 : 0;
      if (ar !== br) return ar - br;
      return toTs(b.updated_at) - toTs(a.updated_at);
    });

    return arr;
  }, [fskus, onlyUsable, showRetired]);

  // ✅ 如果筛选后看不到当前选中，自动清空选中，避免工作区“悬空编辑”
  useEffect(() => {
    if (selectedFskuId == null) return;
    const stillVisible = filteredSortedFskus.some((x) => x.id === selectedFskuId);
    if (!stillVisible) setSelectedFskuId(null);
  }, [selectedFskuId, filteredSortedFskus]);

  const selectedFsku: Fsku | null = useMemo(() => {
    if (selectedFskuId == null) return null;
    return fskus.find((x) => x.id === selectedFskuId) ?? null;
  }, [selectedFskuId, fskus]);

  function showSuccess(message: string) {
    setUiNotice({ kind: "success", message });
    window.setTimeout(() => {
      setUiNotice((cur) => (cur?.kind === "success" && cur.message === message ? null : cur));
    }, 2500);
  }

  function showError(raw: unknown) {
    const message = normalizeErrMsg(raw);
    setUiNotice({ kind: "error", message });
    window.setTimeout(() => {
      setUiNotice((cur) => (cur?.kind === "error" && cur.message === message ? null : cur));
    }, 4500);
  }

  async function handleCreateDraft(args: { name: string; shape: DraftShape; codeText: string }) {
    setUiNotice(null);
    try {
      const created = await B.createFskuDraft({
        name: args.name || "新组合",
        unit_label: "件",
      });

      // ✅ 关键修复：创建草稿后，必须让草稿可见，否则会被“只看可用”隐藏并触发清空选中 → items 不可选
      setOnlyUsable(false);
      setShowRetired(false);

      setSelectedFskuId(created.id);
      await B.refreshFskus();
      showSuccess(`已创建草稿：#${created.id} · ${created.name}`);
      return { id: created.id, name: created.name };
    } catch (e: unknown) {
      showError(e);
      throw e;
    }
  }

  async function handlePublishSelected(id: number) {
    setUiNotice(null);
    try {
      await B.publishFsku(id);
      await B.refreshFskus();
      showSuccess(`已发布：#${id}`);
    } catch (e: unknown) {
      showError(e);
      throw e;
    }
  }

  async function handleRetireSelected(id: number) {
    setUiNotice(null);
    try {
      await B.retireFsku(id);
      await B.refreshFskus();
      showSuccess(`已退休：#${id}`);
    } catch (e: unknown) {
      showError(e);
      throw e;
    }
  }

  async function handleUnretireSelected(id: number) {
    setUiNotice(null);
    try {
      await B.unretireFsku(id);
      await B.refreshFskus();
      showSuccess(`已恢复为可用：#${id}`);
    } catch (e: unknown) {
      showError(e);
      throw e;
    }
  }

  async function handleLoadMirrorAndBindings() {
    const sku = platformSkuId.trim();
    if (!sku) return showError("请输入 platform_sku_id。");
    const sid = parseShopId(shopId);
    if (sid == null) return showError("shop_id 必须是整数。");

    setUiNotice(null);
    await Promise.all([
      B.loadMirror({ platform, shop_id: sid, platform_sku_id: sku }),
      B.loadBindings({ platform, shop_id: sid, platform_sku_id: sku }),
    ]);
  }

  async function handleBindSelectedFsku() {
    const sku = platformSkuId.trim();
    if (!sku) return showError("请输入 platform_sku_id。");
    const sid = parseShopId(shopId);
    if (sid == null) return showError("shop_id 必须是整数。");
    if (selectedFskuId == null) return showError("请先选择一个 FSKU。");
    if (!reason.trim()) return showError("reason 为必填。");

    setUiNotice(null);
    await B.upsertBinding({
      platform,
      shop_id: sid,
      platform_sku_id: sku,
      fsku_id: selectedFskuId,
      reason,
    });
    await B.loadBindings({ platform, shop_id: sid, platform_sku_id: sku });
    showSuccess("绑定已写入（可在右侧历史中查看）");
  }

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">商铺商品组合</h1>
        <div className="text-[11px] text-slate-500">先建设 FSKU（主数据）；再做平台链接反推（下一刀）。</div>
      </header>

      {uiNotice ? (
        <div
          className={
            uiNotice.kind === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800"
              : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
          }
        >
          {uiNotice.message}
        </div>
      ) : null}

      <section className="space-y-6">
        <div className="text-sm font-semibold text-slate-800">一、建设 FSKU</div>

        <FskuListPanel
          fskus={filteredSortedFskus}
          loading={B.fskusLoading}
          onRefresh={() => void B.refreshFskus()}
          selectedFskuId={selectedFskuId}
          setSelectedFskuId={setSelectedFskuId}
          onRetireSelected={handleRetireSelected}
          onUnretireSelected={handleUnretireSelected}
          onlyUsable={onlyUsable}
          setOnlyUsable={setOnlyUsable}
          showRetired={showRetired}
          setShowRetired={setShowRetired}
        />

        <FskuBuildWorkspace
          fskuId={selectedFskuId}
          status={selectedFsku?.status ?? null}
          onCreateDraft={handleCreateDraft}
          onPublishSelected={handlePublishSelected}
        />
      </section>

      <PlatformBindingPanel
        platform={platform}
        setPlatform={setPlatform}
        shopId={shopId}
        setShopId={setShopId}
        platformSkuId={platformSkuId}
        setPlatformSkuId={setPlatformSkuId}
        onLoadMirrorAndBindings={handleLoadMirrorAndBindings}
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
        onBindSelectedFsku={handleBindSelectedFsku}
      />
    </div>
  );
}
