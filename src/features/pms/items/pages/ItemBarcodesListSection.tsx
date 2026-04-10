// src/features/pms/items/pages/ItemBarcodesListSection.tsx

import React from "react";
import type { ItemBarcodeCompositeRow } from "../api/itemBarcodesOwnerApi";
import { BarcodesTable } from "../barcodes-panel/BarcodesTable";

type Props = {
  rows: ItemBarcodeCompositeRow[];
  loading: boolean;
  refreshing: boolean;
  onReload: () => Promise<void> | void;
  onModify: (row: ItemBarcodeCompositeRow) => void;
};

const ItemBarcodesListSection: React.FC<Props> = ({
  rows,
  loading,
  refreshing,
  onReload,
  onModify,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">商品条码列表</div>
          <div className="mt-1 text-sm text-slate-500">
            列表按“一个商品 + 一个包装”展示；未绑定条码的包装也会显示，点“修改”后回到上方继续绑定。
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onReload()}
          disabled={refreshing}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {refreshing ? "刷新中…" : "刷新列表"}
        </button>
      </div>

      <BarcodesTable
        rows={rows}
        loading={loading}
        onModify={onModify}
      />
    </section>
  );
};

export default ItemBarcodesListSection;
