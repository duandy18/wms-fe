import React, { useEffect, useRef } from "react";
import ItemBarcodesInputSection from "./ItemBarcodesInputSection";
import ItemBarcodesListSection from "./ItemBarcodesListSection";
import { useItemBarcodesPageModel } from "./useItemBarcodesPageModel";

const ItemBarcodesPage: React.FC = () => {
  const barcodeCardRef = useRef<HTMLDivElement | null>(null);

  const m = useItemBarcodesPageModel();

  useEffect(() => {
    if (!m.editingRow) return;
    requestAnimationFrame(() => {
      barcodeCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [m.editingRow]);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">商品条码</h1>
        <p className="mt-1 text-sm text-slate-500">
          本页统一治理商品包装与条码绑定。操作顺序：先选商品，再保存包装，最后绑定条码；下方列表只做结果展示和修改入口。
        </p>
      </header>

      {m.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {m.error}
        </div>
      ) : null}

      {m.barcodeHint ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
          {m.barcodeHint}
        </div>
      ) : null}

      <ItemBarcodesInputSection
        loadingItems={m.loadingItems}
        keyword={m.keyword}
        onChangeKeyword={m.setKeyword}
        filteredItems={m.filteredItems}
        selectedItemId={m.selectedItemId}
        onChangeSelectedItemId={m.handleSelectItemId}
        selectedItem={m.selectedItem}
        editingRow={m.editingRow}
        reloadToken={m.reloadToken}
        barcodeCardRef={barcodeCardRef}
        pendingBarcode={m.pendingBarcode}
        onConsumePendingBarcode={m.clearPendingBarcode}
        onPackagingChanged={m.handlePackagingChanged}
        onBarcodesSaved={m.handleBarcodesSaved}
        onCancelEdit={m.clearEditingRow}
      />

      <ItemBarcodesListSection
        rows={m.rows}
        loading={m.loadingRows}
        refreshing={m.loadingItems || m.loadingRows}
        onReload={m.reloadAll}
        onModify={m.handleModify}
      />
    </div>
  );
};

export default ItemBarcodesPage;
