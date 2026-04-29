import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../../../lib/api";
import { fetchItems } from "../../items/api/itemsOwnerApi";
import type { Item } from "../../../../contracts/item/contract";

type ItemUom = {
  id: number;
  item_id: number;
  uom: string;
  ratio_to_base: number;
  display_name?: string | null;
  net_weight_kg?: number | null;
  is_base: boolean;
  is_purchase_default: boolean;
  is_inbound_default: boolean;
  is_outbound_default: boolean;
};

const inputCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm";
const cardCls = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const btnCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60";
const primaryBtnCls = "rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60";

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function numOrNull(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function PmsItemUomsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [itemId, setItemId] = useState("0");
  const [uoms, setUoms] = useState<ItemUom[]>([]);
  const [editing, setEditing] = useState<ItemUom | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const [uom, setUom] = useState("PCS");
  const [ratio, setRatio] = useState("1");
  const [displayName, setDisplayName] = useState("");
  const [netWeightKg, setNetWeightKg] = useState("");
  const [isBase, setIsBase] = useState(false);
  const [isPurchaseDefault, setIsPurchaseDefault] = useState(false);
  const [isInboundDefault, setIsInboundDefault] = useState(false);
  const [isOutboundDefault, setIsOutboundDefault] = useState(false);

  const selectedItem = useMemo(
    () => items.find((x) => String(x.id) === itemId) ?? null,
    [items, itemId],
  );

  const sortedUoms = useMemo(
    () => [...uoms].sort((a, b) => Number(b.is_base) - Number(a.is_base) || a.ratio_to_base - b.ratio_to_base || a.id - b.id),
    [uoms],
  );

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchItems();
      setItems(rows);
      setItemId((prev) => (prev !== "0" && rows.some((x) => String(x.id) === prev) ? prev : String(rows[0]?.id ?? 0)));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  const loadUoms = useCallback(async (nextItemId = itemId) => {
    const id = Number(nextItemId);
    if (!id) {
      setUoms([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setUoms(await apiGet<ItemUom[]>(`/item-uoms/item/${id}`));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void loadItems();
  }, []);

  useEffect(() => {
    void loadUoms(itemId);
  }, [itemId, loadUoms]);

  function resetForm() {
    setEditing(null);
    setUom("PCS");
    setRatio("1");
    setDisplayName("");
    setNetWeightKg("");
    setIsBase(false);
    setIsPurchaseDefault(false);
    setIsInboundDefault(false);
    setIsOutboundDefault(false);
  }

  function startEdit(row: ItemUom) {
    setEditing(row);
    setUom(row.uom);
    setRatio(String(row.ratio_to_base));
    setDisplayName(row.display_name ?? "");
    setNetWeightKg(row.net_weight_kg == null ? "" : String(row.net_weight_kg));
    setIsBase(row.is_base);
    setIsPurchaseDefault(row.is_purchase_default);
    setIsInboundDefault(row.is_inbound_default);
    setIsOutboundDefault(row.is_outbound_default);
    setError(null);
    setHint(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = Number(itemId);
    if (!id) {
      setError("请选择商品");
      return;
    }

    const ratioNum = Number(ratio);
    if (!uom.trim()) {
      setError("请输入单位");
      return;
    }
    if (!Number.isFinite(ratioNum) || ratioNum < 1) {
      setError("换算倍率必须 >= 1");
      return;
    }

    const payload = {
      item_id: id,
      uom: uom.trim().toUpperCase(),
      ratio_to_base: Math.trunc(ratioNum),
      display_name: displayName.trim() || null,
      net_weight_kg: numOrNull(netWeightKg),
      is_base: isBase,
      is_purchase_default: isPurchaseDefault,
      is_inbound_default: isInboundDefault,
      is_outbound_default: isOutboundDefault,
    };

    setSaving(true);
    setError(null);
    setHint(null);
    try {
      if (editing) {
        await apiPatch<ItemUom>(`/item-uoms/${editing.id}`, payload);
        setHint("包装单位已保存");
      } else {
        await apiPost<ItemUom>("/item-uoms", payload);
        setHint("包装单位已新增");
      }
      resetForm();
      await loadUoms();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: ItemUom) {
    if (!window.confirm(`确认删除包装单位 ${row.uom}？`)) return;
    setSaving(true);
    setError(null);
    setHint(null);
    try {
      await apiDelete(`/item-uoms/${row.id}`);
      setHint("包装单位已删除");
      await loadUoms();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">包装单位</h1>
        <p className="mt-1 text-sm text-slate-500">维护商品包装单位、换算倍率、默认采购/入库/出库单位与净重。</p>
      </header>

      {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {hint ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{hint}</div> : null}

      <section className={cardCls}>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <select className={inputCls} value={itemId} onChange={(e) => setItemId(e.target.value)} disabled={loading}>
            <option value="0">请选择商品</option>
            {items.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.sku} / {item.name}
              </option>
            ))}
          </select>
          <button className={btnCls} type="button" onClick={() => void loadItems()} disabled={loading}>刷新商品</button>
        </div>
        {selectedItem ? (
          <div className="mt-2 text-xs text-slate-500">
            当前商品：<span className="font-mono">{selectedItem.sku}</span> / {selectedItem.name}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form className={cardCls} onSubmit={submit}>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">{editing ? "编辑包装单位" : "新增包装单位"}</div>
            {editing ? <button type="button" className="text-xs text-slate-500" onClick={resetForm}>取消</button> : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs text-slate-600">单位</span>
              <input className={`${inputCls} w-full font-mono`} value={uom} onChange={(e) => setUom(e.target.value.toUpperCase())} />
            </label>
            <label>
              <span className="mb-1 block text-xs text-slate-600">换算到基础单位倍率</span>
              <input className={`${inputCls} w-full`} type="number" min={1} value={ratio} onChange={(e) => setRatio(e.target.value)} />
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">展示名称</span>
            <input className={`${inputCls} w-full`} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">净重 kg</span>
            <input className={`${inputCls} w-full`} inputMode="decimal" value={netWeightKg} onChange={(e) => setNetWeightKg(e.target.value)} />
          </label>

          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={isBase} onChange={(e) => setIsBase(e.target.checked)} /> 基础单位</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isPurchaseDefault} onChange={(e) => setIsPurchaseDefault(e.target.checked)} /> 采购默认</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isInboundDefault} onChange={(e) => setIsInboundDefault(e.target.checked)} /> 入库默认</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isOutboundDefault} onChange={(e) => setIsOutboundDefault(e.target.checked)} /> 出库默认</label>
          </div>

          <button className={`${primaryBtnCls} mt-4`} type="submit" disabled={saving || !Number(itemId)}>
            {editing ? "保存包装单位" : "新增包装单位"}
          </button>
        </form>

        <section className={cardCls}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">包装单位列表</div>
            <button className={btnCls} type="button" onClick={() => void loadUoms()} disabled={loading}>刷新</button>
          </div>

          <div className="overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2">单位</th>
                  <th className="px-3 py-2">展示</th>
                  <th className="px-3 py-2">倍率</th>
                  <th className="px-3 py-2">净重</th>
                  <th className="px-3 py-2">标记</th>
                  <th className="px-3 py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedUoms.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2 font-mono">{row.uom}</td>
                    <td className="px-3 py-2">{row.display_name ?? ""}</td>
                    <td className="px-3 py-2">{row.ratio_to_base}</td>
                    <td className="px-3 py-2">{row.net_weight_kg ?? ""}</td>
                    <td className="px-3 py-2 text-xs">
                      {[
                        row.is_base ? "基础" : null,
                        row.is_purchase_default ? "采购" : null,
                        row.is_inbound_default ? "入库" : null,
                        row.is_outbound_default ? "出库" : null,
                      ].filter(Boolean).join(" / ")}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button type="button" className={btnCls} onClick={() => startEdit(row)}>编辑</button>
                        <button type="button" className={btnCls} onClick={() => void remove(row)} disabled={saving}>删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedUoms.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">暂无包装单位</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
