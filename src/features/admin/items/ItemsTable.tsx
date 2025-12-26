// src/features/admin/items/ItemsTable.tsx
// 商品列表（增强版）
// - 展示主条码 / 条码数
// - 行内编辑名称/规格/单位/供应商/重量
// - 「管理条码」按钮会选中商品并展开右侧条码管理面板

import React from "react";
import { UI } from "./table/ui";
import { useItemsTableModel } from "./table/hooks/useItemsTableModel";
import ItemsTableView from "./table/components/ItemsTableView";

export const ItemsTable: React.FC = () => {
  const vm = useItemsTableModel();

  if (vm.loading) {
    return <div className={UI.loadingText}>加载中...</div>;
  }

  if (vm.items.length === 0) {
    return <div className={UI.loadingText}>暂无商品。</div>;
  }

  return (
    <ItemsTableView
      items={vm.items}
      selectedItemId={vm.selectedItemId}
      primaryBarcodes={vm.primaryBarcodes}
      barcodeCounts={vm.barcodeCounts}
      rowRefs={vm.rowRefs}
      suppliers={vm.suppliers}
      suppliersLoading={vm.suppliersLoading}
      editingId={vm.editingId}
      draft={vm.draft}
      onChangeDraft={(patch) => vm.setDraft((prev) => ({ ...prev, ...patch }))}
      savingId={vm.savingId}
      onOpenBarcodes={vm.openBarcodes}
      onStartEdit={vm.startEdit}
      onCancelEdit={vm.cancelEdit}
      onSave={vm.handleSave}
    />
  );
};

export default ItemsTable;
