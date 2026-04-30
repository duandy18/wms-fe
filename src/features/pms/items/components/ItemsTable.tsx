// src/features/pms/items/ItemsTable.tsx
// 商品列表（商品主数据核心视图）
//
// 职责收敛：
// - 列表只消费后端 /items/list-rows owner 读模型
// - 主表只展示商品本体与策略字段
// - 详情展开只调用 /items/{item_id}/list-detail
// - 编辑时按 item_id 拉完整 /items/{id}，再进入商品编辑器

import React, { useMemo, useState } from "react";
import { fetchItemById } from "../api/itemsOwnerApi";
import { fetchItemListDetail } from "../api/itemListOwnerApi";
import type { ItemListDetail, ItemListRow } from "../contracts/itemList";
import { useItemsStore } from "../model/itemsStore";
import ItemsListTable from "./ItemsListTable";

const EDITOR_ANCHOR_ID = "items-editor";

export const ItemsTable: React.FC = () => {
  const listRows = useItemsStore((s) => s.listRows);
  const filter = useItemsStore((s) => s.filter);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setError = useItemsStore((s) => s.setError);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [detailLoadingItemId, setDetailLoadingItemId] = useState<number | null>(null);
  const [detailByItemId, setDetailByItemId] = useState<Record<number, ItemListDetail>>({});

  const rows = useMemo(() => {
    if (filter === "enabled") return listRows.filter((i) => i.enabled);
    if (filter === "disabled") return listRows.filter((i) => !i.enabled);
    return listRows;
  }, [listRows, filter]);

  const gotoEditor = () => {
    const el = document.getElementById(EDITOR_ANCHOR_ID);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onEdit = async (row: ItemListRow) => {
    if (!row.item_id || row.item_id <= 0) return;

    setEditingItemId(row.item_id);
    setError(null);

    try {
      const item = await fetchItemById(row.item_id);
      setSelectedItem(item);
      gotoEditor();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载商品详情失败";
      setError(msg);
    } finally {
      setEditingItemId(null);
    }
  };

  const onToggleDetail = async (row: ItemListRow) => {
    if (!row.item_id || row.item_id <= 0) return;

    if (expandedItemId === row.item_id) {
      setExpandedItemId(null);
      return;
    }

    const cached = detailByItemId[row.item_id];
    if (cached) {
      setExpandedItemId(row.item_id);
      return;
    }

    setDetailLoadingItemId(row.item_id);
    setError(null);

    try {
      const detail = await fetchItemListDetail(row.item_id);
      setDetailByItemId((prev) => ({
        ...prev,
        [row.item_id]: detail,
      }));
      setExpandedItemId(row.item_id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载商品列表详情失败";
      setError(msg);
    } finally {
      setDetailLoadingItemId(null);
    }
  };

  return (
    <ItemsListTable
      rows={rows}
      editingItemId={editingItemId}
      expandedItemId={expandedItemId}
      detailLoadingItemId={detailLoadingItemId}
      detailByItemId={detailByItemId}
      onEdit={(row) => void onEdit(row)}
      onToggleDetail={(row) => void onToggleDetail(row)}
    />
  );
};

export default ItemsTable;
