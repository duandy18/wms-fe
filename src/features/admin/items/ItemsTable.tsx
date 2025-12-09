// src/features/admin/items/ItemsTable.tsx
// 商品列表（增强版）
// - 展示主条码 / 条码数
// - 行内编辑名称/规格/单位/供应商/重量
// - 「管理条码」按钮会选中商品并展开右侧条码管理面板

import React, { useEffect, useRef, useState } from "react";
import { useItemsStore } from "./itemsStore";
import type { Item } from "./api";
import { updateItem } from "./api";
import {
  fetchSuppliersBasic,
  type SupplierBasic,
} from "../../../master-data/suppliersApi";

type ApiErrorShape = {
  message?: string;
};

export const ItemsTable: React.FC = () => {
  const items = useItemsStore((s) => s.items);
  const loading = useItemsStore((s) => s.loading);
  const primaryBarcodes = useItemsStore((s) => s.primaryBarcodes);
  const barcodeCounts = useItemsStore((s) => s.barcodeCounts);
  const filter = useItemsStore((s) => s.filter);
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const loadItems = useItemsStore((s) => s.loadItems);
  const setError = useItemsStore((s) => s.setError);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setPanelOpen = useItemsStore((s) => s.setPanelOpen);

  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  const [suppliers, setSuppliers] = useState<SupplierBasic[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftSpec, setDraftSpec] = useState("");
  const [draftUom, setDraftUom] = useState("");
  const [draftEnabled, setDraftEnabled] = useState(true);
  const [draftSupplierId, setDraftSupplierId] = useState<number | null>(null);
  const [draftWeightKg, setDraftWeightKg] = useState<string>("");

  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const loadSuppliers = async () => {
      setSuppliersLoading(true);
      try {
        const data = await fetchSuppliersBasic();
        setSuppliers(data.filter((s) => s.active !== false));
      } finally {
        setSuppliersLoading(false);
      }
    };
    void loadSuppliers();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const row = rowRefs.current[selectedItem.id];
    if (row && typeof row.scrollIntoView === "function") {
      row.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [selectedItem]);

  const displayItems = items.filter((it: Item) => {
    const enabled = it.enabled ?? true;
    if (filter === "enabled") return !!enabled;
    if (filter === "disabled") return !enabled;
    return true;
  });

  const startEdit = (it: Item) => {
    setEditingId(it.id);
    setDraftName(it.name);
    setDraftSpec(it.spec ?? "");
    setDraftUom(it.uom ?? "");
    setDraftEnabled(it.enabled ?? true);
    setDraftSupplierId(it.supplier_id ?? null);
    const w = it.weight_kg;
    setDraftWeightKg(
      w !== null && w !== undefined ? String(w) : "",
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSavingId(null);
  };

  const handleSave = async (id: number) => {
    setSavingId(id);
    setError(null);

    let weight_kg: number | null = null;
    const trimmed = draftWeightKg.trim();
    if (trimmed) {
      const num = Number(trimmed);
      if (!Number.isFinite(num) || num < 0) {
        setError("重量(kg) 必须是大于等于 0 的数字");
        setSavingId(null);
        return;
      }
      weight_kg = num;
    }

    try {
      await updateItem(id, {
        name: draftName,
        spec: draftSpec || null,
        uom: draftUom || null,
        enabled: draftEnabled,
        supplier_id: draftSupplierId ?? null,
        weight_kg,
      });
      await loadItems();
      setEditingId(null);
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setError(err?.message ?? "更新商品失败");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500">加载中...</div>;
  }
  if (displayItems.length === 0) {
    return <div className="text-sm text-slate-500">暂无商品。</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="max-h-[520px] overflow-x-auto overflow-y-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className="border-b px-3 py-2 text-left">ID</th>
              <th className="border-b px-3 py-2 text-left">SKU</th>
              <th className="border-b px-3 py-2 text-left">名称</th>
              <th className="border-b px-3 py-2 text-left">规格</th>
              <th className="border-b px-3 py-2 text-left">单位</th>
              <th className="border-b px-3 py-2 text-left">重量(kg)</th>
              <th className="border-b px-3 py-2 text-left">供应商</th>
              <th className="border-b px-3 py-2 text-left">主条码</th>
              <th className="border-b px-3 py-2 text-left">条码数</th>
              <th className="border-b px-3 py-2 text-left">状态</th>
              <th className="border-b px-3 py-2 text-left">创建时间</th>
              <th className="border-b px-3 py-2 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {displayItems.map((it: Item) => {
              const enabled = it.enabled ?? true;
              const createdAt = it.created_at ?? "";
              const isEditing = editingId === it.id;

              const supplierName =
                it.supplier_name ?? it.supplier ?? "";

              const primary = primaryBarcodes[it.id] || "-";
              const count = barcodeCounts[it.id] ?? 0;

              const isActiveRow =
                selectedItem && selectedItem.id === it.id;

              const weightVal = it.weight_kg;

              return (
                <tr
                  key={it.id}
                  ref={(el) => {
                    rowRefs.current[it.id] = el;
                  }}
                  className={
                    "border-t border-slate-100 " +
                    (isActiveRow
                      ? "bg-sky-50 ring-1 ring-sky-300"
                      : enabled
                      ? ""
                      : "bg-slate-50 text-slate-400")
                  }
                >
                  <td className="px-3 py-2">{it.id}</td>

                  <td className="whitespace-nowrap px-3 py-2 font-mono">
                    {it.sku}
                  </td>

                  {/* 名称 */}
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-48 rounded border px-2 py-1 text-sm"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                      />
                    ) : (
                      it.name
                    )}
                  </td>

                  {/* 规格 */}
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-40 rounded border px-2 py-1 text-sm"
                        value={draftSpec}
                        onChange={(e) => setDraftSpec(e.target.value)}
                      />
                    ) : (
                      it.spec || "-"
                    )}
                  </td>

                  {/* 单位 */}
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-20 rounded border px-2 py-1 text-sm"
                        value={draftUom}
                        onChange={(e) => setDraftUom(e.target.value)}
                      />
                    ) : (
                      it.uom || "-"
                    )}
                  </td>

                  {/* 重量(kg) */}
                  <td className="px-3 py-2 text-right">
                    {isEditing ? (
                      <input
                        className="w-24 rounded border px-2 py-1 text-right text-sm font-mono"
                        value={draftWeightKg}
                        onChange={(e) =>
                          setDraftWeightKg(e.target.value)
                        }
                        placeholder={
                          weightVal !== null && weightVal !== undefined
                            ? String(weightVal)
                            : ""
                        }
                      />
                    ) : weightVal !== null &&
                      weightVal !== undefined ? (
                      <span className="font-mono">{weightVal}</span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* 供应商 */}
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <select
                        className="w-48 rounded border px-2 py-1 text-sm"
                        value={draftSupplierId ?? ""}
                        disabled={suppliersLoading}
                        onChange={(e) =>
                          setDraftSupplierId(
                            e.target.value
                              ? Number(e.target.value)
                              : null,
                          )
                        }
                      >
                        <option value="">无（暂不指定）</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code ? `[${s.code}] ${s.name}` : s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      supplierName || "-"
                    )}
                  </td>

                  {/* 主条码 */}
                  <td className="px-3 py-2 font-mono">{primary}</td>

                  {/* 条码数量 */}
                  <td className="px-3 py-2">{count}</td>

                  {/* 状态 */}
                  <td className="px-3 py-2">
                    {enabled ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                        启用
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-xs text-slate-500">
                        已停用
                      </span>
                    )}
                  </td>

                  {/* 创建时间 */}
                  <td className="whitespace-nowrap px-3 py-2">
                    {createdAt}
                  </td>

                  {/* 操作 */}
                  <td className="whitespace-nowrap px-3 py-2">
                    <button
                      type="button"
                      className="mr-2 rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                      onClick={() => {
                        setSelectedItem(it);
                        setPanelOpen(true);
                      }}
                    >
                      管理条码
                    </button>

                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="mr-2 rounded border border-emerald-500 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 disabled:opacity-60"
                          disabled={savingId === it.id}
                          onClick={() => void handleSave(it.id)}
                        >
                          {savingId === it.id ? "保存中…" : "保存"}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
                          onClick={cancelEdit}
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => startEdit(it)}
                      >
                        编辑商品
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
