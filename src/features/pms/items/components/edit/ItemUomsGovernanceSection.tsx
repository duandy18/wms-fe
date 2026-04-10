// src/features/pms/items/components/edit/ItemUomsGovernanceSection.tsx
//
// 商品条码页内的单位治理区：
// - 治理最小包装单位（base item_uom）
// - 治理采购包装单位（purchase_default item_uom）
// - 治理单位换算倍率（ratio_to_base）
//
// 约束：
// - 当前页只治理“基准单位 + 采购包装单位”这两层结构
// - 其它历史 item_uoms 若存在，先只读展示，不在这里做删除型治理
// - 箱码绑定依赖采购包装单位；建议先维护单位，再治理箱码

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  createItemUom,
  fetchItemUoms,
  updateItemUom,
  type ItemUom,
} from "../../api/itemUomsOwnerApi";
import {
  parsePositiveIntOrNull,
  pickBaseUom,
  pickPurchaseDefaultUom,
} from "../../editor/itemEditorUtils";

function trim(v: string): string {
  return (v ?? "").trim();
}

function tagLabel(u: ItemUom): string {
  const tags: string[] = [];
  if (u.is_base) tags.push("最小包装单位");
  if (u.is_purchase_default) tags.push("采购包装单位");
  if (u.is_inbound_default) tags.push("入库默认");
  if (u.is_outbound_default) tags.push("出库默认");
  return tags.join(" / ") || "普通单位";
}

function sortUoms(list: ItemUom[]): ItemUom[] {
  const score = (u: ItemUom): number => {
    if (u.is_base) return 0;
    if (u.is_purchase_default) return 1;
    return 10;
  };
  return [...list].sort((a, b) => score(a) - score(b) || a.id - b.id);
}

const ItemUomsGovernanceSection: React.FC<{ itemId: number }> = ({ itemId }) => {
  const [uoms, setUoms] = useState<ItemUom[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [baseUom, setBaseUom] = useState("");
  const [purchaseUom, setPurchaseUom] = useState("");
  const [purchaseRatio, setPurchaseRatio] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const list = await fetchItemUoms(itemId);
      setUoms(list);

      const base = pickBaseUom(list);
      const purchase = pickPurchaseDefaultUom(list);

      setBaseUom(base?.uom ?? "");
      if (purchase && !purchase.is_base) {
        setPurchaseUom(purchase.uom ?? "");
        setPurchaseRatio(String(purchase.ratio_to_base ?? ""));
      } else {
        setPurchaseUom("");
        setPurchaseRatio("");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "加载包装单位失败";
      setError(msg);
      setUoms([]);
      setBaseUom("");
      setPurchaseUom("");
      setPurchaseRatio("");
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rows = useMemo(() => sortUoms(uoms), [uoms]);

  const equationText = useMemo(() => {
    const base = trim(baseUom);
    const purchase = trim(purchaseUom);
    const ratio = parsePositiveIntOrNull(purchaseRatio);

    if (!base || !purchase || ratio == null) return null;
    return `1 ${purchase} = ${ratio} × ${base}`;
  }, [baseUom, purchaseUom, purchaseRatio]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextBase = trim(baseUom);
    const nextPurchase = trim(purchaseUom);
    const nextPurchaseRatio = parsePositiveIntOrNull(purchaseRatio);

    if (!nextBase) {
      setError("最小包装单位不能为空");
      setSuccess(null);
      return;
    }

    if (!nextPurchase && trim(purchaseRatio)) {
      setError("请填写采购包装单位，或清空采购包装倍率");
      setSuccess(null);
      return;
    }

    if (nextPurchase && nextPurchase === nextBase) {
      setError("采购包装单位不能与最小包装单位相同；没有独立采购包装时请留空");
      setSuccess(null);
      return;
    }

    if (nextPurchase && nextPurchaseRatio == null) {
      setError("采购包装倍率必须是整数，且 ≥ 1");
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const current = await fetchItemUoms(itemId);
      const currentBase = pickBaseUom(current);

      // 1) 先确保 base item_uom 正确
      if (currentBase) {
        const needBaseUpdate =
          currentBase.uom !== nextBase ||
          currentBase.ratio_to_base !== 1 ||
          currentBase.is_base !== true ||
          currentBase.is_inbound_default !== true ||
          currentBase.is_outbound_default !== true ||
          currentBase.is_purchase_default !== !nextPurchase;

        if (needBaseUpdate) {
          await updateItemUom(currentBase.id, {
            item_id: itemId,
            uom: nextBase,
            ratio_to_base: 1,
            is_base: true,
            is_inbound_default: true,
            is_outbound_default: true,
            is_purchase_default: !nextPurchase,
          });
        }
      } else {
        await createItemUom({
          item_id: itemId,
          uom: nextBase,
          ratio_to_base: 1,
          is_base: true,
          is_purchase_default: !nextPurchase,
          is_inbound_default: true,
          is_outbound_default: true,
        });
      }

      const refreshed = await fetchItemUoms(itemId);
      const refreshedBase = pickBaseUom(refreshed);
      if (!refreshedBase) {
        throw new Error("缺少基准单位，保存失败");
      }

      // 2) 再处理 purchase_default item_uom
      if (!nextPurchase) {
        const toClear = refreshed.filter(
          (u) => u.is_purchase_default && u.id !== refreshedBase.id,
        );
        for (const u of toClear) {
          await updateItemUom(u.id, { is_purchase_default: false });
        }

        if (!refreshedBase.is_purchase_default) {
          await updateItemUom(refreshedBase.id, { is_purchase_default: true });
        }
      } else {
        const toClear = refreshed.filter(
          (u) => u.is_purchase_default && u.uom !== nextPurchase,
        );
        for (const u of toClear) {
          await updateItemUom(u.id, { is_purchase_default: false });
        }

        if (refreshedBase.is_purchase_default && refreshedBase.uom !== nextPurchase) {
          await updateItemUom(refreshedBase.id, { is_purchase_default: false });
        }

        const same = refreshed.find((u) => u.uom === nextPurchase) ?? null;
        if (same) {
          await updateItemUom(same.id, {
            item_id: itemId,
            uom: nextPurchase,
            ratio_to_base: nextPurchaseRatio as number,
            is_purchase_default: true,
          });
        } else {
          await createItemUom({
            item_id: itemId,
            uom: nextPurchase,
            ratio_to_base: nextPurchaseRatio as number,
            is_purchase_default: true,
          });
        }
      }

      await refresh();
      setSuccess("包装单位 / 单位换算已保存");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存包装单位失败";
      setError(msg);
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">包装单位 / 单位换算</div>
          <div className="mt-1 text-sm text-slate-500">
            先维护最小包装单位与采购包装单位，再治理条码/箱码。
          </div>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading || saving}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        当前页只治理“最小包装单位 + 采购包装单位”两层结构；
        若历史上存在其它 item_uoms，本页先只读展示，不做删除型治理。
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {equationText ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          当前换算：<span className="font-mono">{equationText}</span>
        </div>
      ) : null}

      <div className="overflow-auto rounded border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="border-b px-3 py-2 text-left font-semibold">ID</th>
              <th className="border-b px-3 py-2 text-left font-semibold">单位</th>
              <th className="border-b px-3 py-2 text-left font-semibold">倍率</th>
              <th className="border-b px-3 py-2 text-left font-semibold">角色</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                  包装单位加载中…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                  当前商品尚未配置 item_uoms。
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{u.id}</td>
                  <td className="px-3 py-2 font-mono">{u.uom}</td>
                  <td className="px-3 py-2 font-mono">{u.ratio_to_base}</td>
                  <td className="px-3 py-2 text-slate-700">{tagLabel(u)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">最小包装单位</label>
          <input
            className="w-full rounded border px-3 py-2 bg-white font-mono"
            placeholder="必填，如：PCS / 袋"
            value={baseUom}
            onChange={(e) => setBaseUom(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">采购包装单位</label>
          <input
            className="w-full rounded border px-3 py-2 bg-white font-mono"
            placeholder="可选，如：箱 / 件"
            value={purchaseUom}
            onChange={(e) => setPurchaseUom(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">采购包装倍率</label>
          <input
            className="w-full rounded border px-3 py-2 bg-white font-mono"
            placeholder="整数 ≥ 1，如：12"
            value={purchaseRatio}
            onChange={(e) => setPurchaseRatio(e.target.value)}
            disabled={saving || !trim(purchaseUom)}
            inputMode="numeric"
          />
        </div>

        <div className="md:col-span-3 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {saving ? "保存中…" : "保存包装单位"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ItemUomsGovernanceSection;
