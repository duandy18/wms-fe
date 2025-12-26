// src/features/admin/items/ItemBarcodesPanel.tsx
//
// 条码管理面板（底部独立卡片版）
// - 总是渲染一个卡片；
//   * 若尚未选中商品：显示提示文案；
//   * 若已有 selectedItem：显示条码列表 + 新增/设主/删除。
// - 有 scannedBarcode 时自动把条码灌入“新增条码”的输入框，方便从扫描台上下文进入绑定流程。

import React from "react";
import { UI } from "./barcodes-panel/ui";
import { useItemBarcodesPanelModel } from "./barcodes-panel/hooks/useItemBarcodesPanelModel";

import BarcodesEmptyHint from "./barcodes-panel/components/BarcodesEmptyHint";
import BarcodesTable from "./barcodes-panel/components/BarcodesTable";
import AddBarcodeForm from "./barcodes-panel/components/AddBarcodeForm";

export const ItemBarcodesPanel: React.FC = () => {
  const vm = useItemBarcodesPanelModel();

  return (
    <section className={UI.card}>
      <div className={UI.headerRow}>
        <h3 className={UI.title}>条码管理</h3>
        {vm.selectedItem ? (
          <span className={UI.headerMeta}>
            当前商品：#{vm.selectedItem.id} / {vm.selectedItem.sku}
          </span>
        ) : null}
      </div>

      {!vm.selectedItem ? (
        <BarcodesEmptyHint selected={false} />
      ) : (
        <>
          {vm.error ? <div className={UI.error}>{vm.error}</div> : null}

          {vm.loading ? (
            <div className={UI.loading}>条码加载中…</div>
          ) : vm.barcodes.length === 0 ? (
            <BarcodesEmptyHint selected={true} />
          ) : (
            <BarcodesTable
              barcodes={vm.barcodes}
              onSetPrimary={vm.setPrimary}
              onDelete={vm.removeBarcode}
            />
          )}

          <AddBarcodeForm
            newCode={vm.newCode}
            newKind={vm.newKind}
            saving={vm.saving}
            onChangeCode={vm.setNewCode}
            onChangeKind={vm.setNewKind}
            onSubmit={vm.addBarcode}
          />
        </>
      )}
    </section>
  );
};

export default ItemBarcodesPanel;
