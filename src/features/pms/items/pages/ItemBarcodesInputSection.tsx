import React from "react";
import type { RefObject } from "react";
import type { Item } from "../../../../contracts/item/contract";
import type { ItemBarcodeCompositeRow } from "../api/itemBarcodesOwnerApi";
import ItemBarcodesSection from "../components/edit/ItemBarcodesSection";
import ItemUomsGovernanceSection from "../components/edit/ItemUomsGovernanceSection";

type Props = {
  loadingItems: boolean;
  keyword: string;
  onChangeKeyword: (value: string) => void;

  filteredItems: Item[];
  selectedItemId: number | null;
  onChangeSelectedItemId: (value: number | null) => void;
  selectedItem: Item | null;

  editingRow: ItemBarcodeCompositeRow | null;
  reloadToken: number;
  barcodeCardRef: RefObject<HTMLDivElement | null>;

  pendingBarcode: string | null;
  onConsumePendingBarcode: () => void;

  onPackagingChanged: () => Promise<void> | void;
  onBarcodesSaved: () => Promise<void> | void;
  onCancelEdit: () => void;
};

const ItemBarcodesInputSection: React.FC<Props> = ({
  loadingItems,
  keyword,
  onChangeKeyword,
  filteredItems,
  selectedItemId,
  onChangeSelectedItemId,
  selectedItem,
  editingRow,
  reloadToken,
  barcodeCardRef,
  pendingBarcode,
  onConsumePendingBarcode,
  onPackagingChanged,
  onBarcodesSaved,
  onCancelEdit,
}) => {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <div className="text-base font-semibold text-slate-900">选择商品</div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,0.9fr)_minmax(360px,1.1fr)]">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">搜索商品</label>
          <input
            className="w-full rounded border bg-white px-3 py-2"
            placeholder="按 SKU / 商品名称 / 规格 / 品牌 / 品类 / 供应商搜索"
            value={keyword}
            onChange={(e) => onChangeKeyword(e.target.value)}
            disabled={loadingItems}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">选择商品</label>
          <select
            className="w-full rounded border bg-white px-3 py-2"
            value={selectedItemId ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onChangeSelectedItemId(raw ? Number(raw) : null);
            }}
            disabled={loadingItems}
          >
            <option value="">请选择商品</option>
            {filteredItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sku} ｜ {item.name}
                {item.spec ? ` ｜ ${item.spec}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedItem ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div>
            当前商品：<span className="font-medium">{selectedItem.name}</span>
          </div>
          <div className="mt-1">
            SKU：<span className="font-mono">{selectedItem.sku}</span>
            <span className="mx-2 text-slate-300">|</span>
            规格：{selectedItem.spec ?? "—"}
            <span className="mx-2 text-slate-300">|</span>
            供应商：{selectedItem.supplier_name ?? "—"}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-500">
          请先选择一个商品，再开始录入包装和条码绑定。
        </div>
      )}

      {selectedItem ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ItemUomsGovernanceSection
            itemId={selectedItem.id}
            onChanged={onPackagingChanged}
          />

          <div ref={barcodeCardRef}>
            <ItemBarcodesSection
              itemId={selectedItem.id}
              editingRow={editingRow}
              reloadToken={reloadToken}
              scannedCode={pendingBarcode}
              onScannedCodeConsumed={onConsumePendingBarcode}
              onSaved={onBarcodesSaved}
              onCancelEdit={onCancelEdit}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ItemBarcodesInputSection;
