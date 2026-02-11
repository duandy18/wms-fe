// src/features/ops/dev/OpsDevOrderParseSimulatorPage.tsx

import React, { useEffect, useMemo, useState } from "react";

import type { GenerateParams, JsonObject, RunResult, VariantRow } from "./order-parse-simulator/types";
import { postJson } from "./order-parse-simulator/api";
import { defaultVariantRows } from "./order-parse-simulator/seed";
import { VariantInputsCard } from "./order-parse-simulator/components/VariantInputsCard";
import { RunParamsCard } from "./order-parse-simulator/components/RunParamsCard";
import { SeedPreviewCard } from "./order-parse-simulator/components/SeedPreviewCard";
import { ResultCard } from "./order-parse-simulator/components/ResultCard";
import { AddressInputsCard, type OrderAddrIn } from "./order-parse-simulator/components/AddressInputsCard";

// ✅ 注意相对路径：ops/dev -> admin/stores
import { fetchStores } from "../../admin/stores/api";
import type { StoreListItem } from "../../admin/stores/types";

type SeedVariant = { variant_name: string; filled_code: string };
type SeedLink = { spu_key: string; title: string; variants: SeedVariant[] };
type SeedShop = { shop_id: string; title_prefix: string; links: SeedLink[] };
type DevFakeOrdersSeed = { platform: string; shops: SeedShop[]; order_addr?: OrderAddrIn | null };

function normalizeOpt(v: string): string | null {
  const s = v.trim();
  return s ? s : null;
}

export default function OpsDevOrderParseSimulatorPage() {
  // 固定平台（当前后端 seed 默认 PDD；后续若要扩展平台，再把这里做下拉）
  const platform = "PDD";

  // stores 下拉（/stores）
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [storesLoading, setStoresLoading] = useState<boolean>(false);
  const [storesError, setStoresError] = useState<string | null>(null);

  const [shopId, setShopId] = useState<string>(""); // 必填：从下拉选择
  const [titlePrefix, setTitlePrefix] = useState<string>(""); // 可选：拼接到 title 前
  const [spuKey, setSpuKey] = useState<string>("SPU-DEMO-1"); // 必填：parse_seed 强校验
  const [goodsTitle, setGoodsTitle] = useState<string>("顽皮猫粮 冻干拌粮（模拟链接）");

  const [addr, setAddr] = useState<OrderAddrIn>({
    receiver_name: null,
    receiver_phone: null,
    province: null,
    city: null,
    district: null,
    detail: null,
    zipcode: null,
  });

  const [rows, setRows] = useState<VariantRow[]>(defaultVariantRows());

  const [count, setCount] = useState<number>(80);
  const [linesMin, setLinesMin] = useState<number>(1);
  const [linesMax, setLinesMax] = useState<number>(3);
  const [qtyMin, setQtyMin] = useState<number>(1);
  const [qtyMax, setQtyMax] = useState<number>(3);
  const [rngSeed, setRngSeed] = useState<number>(42);
  const [withReplay, setWithReplay] = useState<boolean>(true);
  const [watchCodesText, setWatchCodesText] = useState<string>("FC-DEMO-001");

  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JsonObject | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setStoresLoading(true);
      setStoresError(null);

      try {
        const resp = await fetchStores();
        const list = Array.isArray(resp.data) ? resp.data : [];
        const filtered = list.filter((x) => x.active && String(x.platform).toUpperCase() === platform);

        if (mounted) {
          setStores(filtered);

          // 首次加载：如果当前 shopId 不在列表里，默认选第一个
          if (filtered.length > 0) {
            const has = filtered.some((x) => x.shop_id === shopId);
            if (!has) setShopId(filtered[0].shop_id);
          }
        }
      } catch (e) {
        if (mounted) {
          setStoresError(e instanceof Error ? e.message : "加载商铺失败");
        }
      } finally {
        // ✅ eslint(no-unsafe-finally)：finally 里不要 return
        if (mounted) setStoresLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [platform]); // eslint-disable-line react-hooks/exhaustive-deps

  const watchCodes = useMemo(() => {
    return watchCodesText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [watchCodesText]);

  function onRowChange(idx: number, patch: Partial<VariantRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  const seedObj: DevFakeOrdersSeed = useMemo(() => {
    const variants: SeedVariant[] = rows
      .map((r) => ({
        variant_name: (r.variant_name || "").trim(),
        filled_code: (r.filled_code || "").trim(),
      }))
      // ⚠️ parse_seed 强校验 filled_code 必填，所以这里只保留有 filled_code 的行
      .filter((v) => v.filled_code.length > 0)
      .slice(0, 6);

    const orderAddr: OrderAddrIn = {
      receiver_name: addr.receiver_name ?? null,
      receiver_phone: addr.receiver_phone ?? null,
      province: addr.province ?? null,
      city: addr.city ?? null,
      district: addr.district ?? null,
      detail: addr.detail ?? null,
      zipcode: addr.zipcode ?? null,
    };

    return {
      platform,
      order_addr: orderAddr,
      shops: [
        {
          shop_id: shopId,
          title_prefix: titlePrefix,
          links: [
            {
              spu_key: spuKey,
              title: goodsTitle,
              variants,
            },
          ],
        },
      ],
    };
  }, [platform, shopId, titlePrefix, spuKey, goodsTitle, rows, addr]);

  const seedText = useMemo(() => JSON.stringify(seedObj, null, 2), [seedObj]);

  function validateCommon(): { ok: true } | { ok: false; message: string } {
    if (!shopId.trim()) return { ok: false, message: "请选择商铺（shop_id）" };
    if (!spuKey.trim()) return { ok: false, message: "spu_key 必填（用于模拟链接/商品维度）" };

    if (linesMin > linesMax) return { ok: false, message: "lines_min 不能大于 lines_max" };
    if (qtyMin > qtyMax) return { ok: false, message: "qty_min 不能大于 qty_max" };

    const hasAnyFilledCode = rows.some((r) => (r.filled_code || "").trim().length > 0);
    if (!hasAnyFilledCode) return { ok: false, message: "请至少填写一个规格编码（filled_code）" };

    return { ok: true };
  }

  async function onGeneratePreview() {
    setError(null);
    setResult(null);

    const v = validateCommon();
    if (!v.ok) {
      setError(v.message);
      return;
    }

    const generate: GenerateParams = {
      count,
      lines_min: linesMin,
      lines_max: linesMax,
      qty_min: qtyMin,
      qty_max: qtyMax,
      rng_seed: rngSeed,
    };

    const payload = {
      seed: seedObj,
      generate,
    };

    setRunning(true);
    try {
      const data = await postJson<JsonObject>("/dev/fake-orders/generate", payload);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setRunning(false);
    }
  }

  async function onRun() {
    setError(null);
    setResult(null);

    const v = validateCommon();
    if (!v.ok) {
      setError(v.message);
      return;
    }

    const generate: GenerateParams = {
      count,
      lines_min: linesMin,
      lines_max: linesMax,
      qty_min: qtyMin,
      qty_max: qtyMax,
      rng_seed: rngSeed,
    };

    const payload = {
      seed: seedObj,
      generate,
      watch_filled_codes: watchCodes,
      with_replay: withReplay,
    };

    setRunning(true);
    try {
      const data = await postJson<RunResult>("/dev/fake-orders/run", payload);
      setResult(data as unknown as JsonObject);
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setRunning(false);
    }
  }

  const storeOptions = useMemo(() => {
    return stores.map((s) => ({
      shop_id: s.shop_id,
      label: `${s.name} (${s.shop_id})`,
    }));
  }, [stores]);

  return (
    <div className="p-4 space-y-4">
      <VariantInputsCard
        platform={platform}
        storesLoading={storesLoading}
        storesError={storesError}
        storeOptions={storeOptions}
        shopId={shopId}
        titlePrefix={titlePrefix}
        spuKey={spuKey}
        goodsTitle={goodsTitle}
        rows={rows}
        onShopIdChange={setShopId}
        onTitlePrefixChange={setTitlePrefix}
        onSpuKeyChange={setSpuKey}
        onGoodsTitleChange={setGoodsTitle}
        onRowChange={onRowChange}
      />

      <AddressInputsCard
        value={addr}
        onChange={(next) => {
          setAddr({
            receiver_name: normalizeOpt(next.receiver_name ?? "") ?? null,
            receiver_phone: normalizeOpt(next.receiver_phone ?? "") ?? null,
            province: next.province ?? null,
            city: next.city ?? null,
            district: next.district ?? null,
            detail: next.detail ?? null,
            zipcode: normalizeOpt(next.zipcode ?? "") ?? null,
          });
        }}
      />

      <RunParamsCard
        count={count}
        linesMin={linesMin}
        linesMax={linesMax}
        qtyMin={qtyMin}
        qtyMax={qtyMax}
        rngSeed={rngSeed}
        withReplay={withReplay}
        watchCodesText={watchCodesText}
        onCountChange={setCount}
        onLinesMinChange={setLinesMin}
        onLinesMaxChange={setLinesMax}
        onQtyMinChange={setQtyMin}
        onQtyMaxChange={setQtyMax}
        onRngSeedChange={setRngSeed}
        onWithReplayChange={setWithReplay}
        onWatchCodesTextChange={setWatchCodesText}
      />

      <SeedPreviewCard seedText={seedText} />

      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm disabled:opacity-50"
            onClick={onGeneratePreview}
            disabled={running}
            type="button"
          >
            {running ? "生成中…" : "生成预览"}
          </button>

          <button
            className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm disabled:opacity-50"
            onClick={onRun}
            disabled={running}
            type="button"
          >
            {running ? "运行中…" : "运行解析"}
          </button>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>

        <div className="text-xs text-slate-500 mt-2">
          提示：解析锚点只有 filled_code；地址不影响解析，但会影响履约状态（例如缺省省份会导致 FULFILLMENT_BLOCKED）。
        </div>
      </div>

      <ResultCard result={result} />
    </div>
  );
}
