// src/features/purchase-orders/PurchaseOrderCreateHeaderForm.tsx

import React from "react";
import type { SupplierBasic } from "../../master-data/suppliersApi";

interface PurchaseOrderCreateHeaderFormProps {
  supplierId: number | null;
  supplierName: string;
  supplierOptions: SupplierBasic[];
  suppliersLoading: boolean;
  suppliersError: string | null;

  warehouseId: string;
  remark: string;
  error: string | null;

  onSelectSupplier: (id: number | null) => void;
  onChangeWarehouseId: (v: string) => void;
  onChangeRemark: (v: string) => void;
}

export const PurchaseOrderCreateHeaderForm: React.FC<
  PurchaseOrderCreateHeaderFormProps
> = ({
  supplierId,
  supplierName,
  supplierOptions,
  suppliersLoading,
  suppliersError,
  warehouseId,
  remark,
  error,
  onSelectSupplier,
  onChangeWarehouseId,
  onChangeRemark,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">
        采购单头部信息
      </h2>

      {error && <div className="text-xs text-red-600">{error}</div>}

      {suppliersError && (
        <div className="text-xs text-red-600">{suppliersError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {/* 供应商下拉 */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500">供应商</label>
          <select
            className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={supplierId ?? ""}
            disabled={suppliersLoading}
            onChange={(e) =>
              onSelectSupplier(
                e.target.value ? Number(e.target.value) : null,
              )
            }
          >
            <option value="">
              {suppliersLoading ? "加载中…" : "请选择供应商"}
            </option>
            {supplierOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `[${s.code}] ${s.name}` : s.name}
              </option>
            ))}
          </select>
          {supplierName && (
            <span className="mt-1 text-[11px] text-slate-500">
              当前选择：{supplierName}
            </span>
          )}
        </div>

        {/* 仓库 ID */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500">仓库 ID</label>
          <input
            className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={warehouseId}
            onChange={(e) => onChangeWarehouseId(e.target.value)}
            placeholder="1"
          />
        </div>

        {/* 备注 */}
        <div className="flex flex-col md:col-span-1">
          <label className="text-xs text-slate-500">备注</label>
          <input
            className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={remark}
            onChange={(e) => onChangeRemark(e.target.value)}
            placeholder="整单备注（可选）"
          />
        </div>
      </div>
    </section>
  );
};
