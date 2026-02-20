// src/features/admin/items/ItemsTable.tsx
// 商品列表（商品主数据核心视图）
//
// 职责收敛：
// - 本文件只做：取 store 状态、过滤 rows、触发“上方编辑器进入编辑模式”、渲染表格
// - 表格渲染交给 components/ItemsListTable
// - 商品编辑器统一由 ItemsFormSection 承担（本文件不再弹窗编辑）

import React, { useMemo } from "react";
import type { Item } from "@/contracts/item/contract";
import { useItemsStore } from "./itemsStore";
import ItemsListTable from "./components/ItemsListTable";

const EDITOR_ANCHOR_ID = "items-editor";

export const ItemsTable: React.FC = () => {
  const items = useItemsStore((s) => s.items);
  const filter = useItemsStore((s) => s.filter);
  const primaryBarcodes = useItemsStore((s) => s.primaryBarcodes);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);

  const rows = useMemo(() => {
    if (filter === "enabled") return items.filter((i) => i.enabled);
    if (filter === "disabled") return items.filter((i) => !i.enabled);
    return items;
  }, [items, filter]);

  const gotoEditor = () => {
    // 尽量滚动到编辑器锚点；没有也不报错
    const el = document.getElementById(EDITOR_ANCHOR_ID);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onEdit = (it: Item) => {
    // ✅ 单一入口：列表编辑只负责“切换上方编辑器状态”
    setSelectedItem(it);
    gotoEditor();
  };

  return (
    <>
      <ItemsListTable
        rows={rows}
        primaryBarcodes={primaryBarcodes}
        onEdit={(it) => void onEdit(it)}
        // ✅ 合并：管理条码也走上方编辑器（条码区块在编辑器内）
        onManageBarcodes={(it) => void onEdit(it)}
      />
    </>
  );
};

export default ItemsTable;
