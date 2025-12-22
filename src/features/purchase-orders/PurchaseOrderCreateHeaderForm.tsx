// src/features/purchase-orders/PurchaseOrderCreateHeaderForm.tsx
// 采购单头部信息（大字号 Cockpit 版 + 仓库下拉 + 采购人/时间必填）

import React from "react";
import type { SupplierBasic } from "../../master-data/suppliersApi";

interface PurchaseOrderCreateHeaderFormProps {
  supplierId: number | null;
  supplierName: string;
  supplierOptions: SupplierBasic[];
  suppliersLoading: boolean;
  suppliersError: string | null;

  warehouseId: string;
  purchaser: string;
  purchaseTime: string;

  error: string | null;

  onSelectSupplier: (id: number | null) => void;
  onChangeWarehouseId: (v: string) => void;
  onChangePurchaser: (v: string) => void;
  onChangePurchaseTime: (v: string) => void;
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
  purchaser,
  purchaseTime,
  error,
  onSelectSupplier,
  onChangeWarehouseId,
  onChangePurchaser,
  onChangePurchaseTime,
}) => {
  const handleWarehouseSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const v = e.target.value;
    onChangeWarehouseId(v);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">
        采购单头部信息
      </h2>

      {error && (
        <div className="text-base text-red-600">
          {error}
        </div>
      )}

      {suppliersError && (
        <div className="text-base text-red-600">
          {suppliersError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
        {/* 供应商 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">
            供应商（必选）
          </label>
          <select
            className="mt-1 rounded-xl border border-slate-300 px-4 py-3 text-base"
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
            <span className="text-sm text-slate-500">
              当前选择：{supplierName}
            </span>
          )}
        </div>

        {/* 仓库：只保留下拉选择 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">
            仓库（必选）
          </label>
          <select
            className="mt-1 rounded-xl border border-slate-300 px-4 py-3 text-base"
            value={warehouseId || ""}
            onChange={handleWarehouseSelect}
          >
            <option value="">请选择仓库</option>
            <option value="1">WH1 · 默认仓</option>
            <option value="2">WH2 · 备用仓</option>
            <option value="3">WH3 · 退货仓</option>
          </select>
          <span className="text-sm text-slate-500">
            当前版本使用固定仓库列表，后续可以从“仓库主数据”自动拉取。
          </span>
        </div>

        {/* 采购人 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">
            采购人（必填）
          </label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-4 py-3 text-base"
            value={purchaser}
            onChange={(e) => onChangePurchaser(e.target.value)}
            placeholder="采购人姓名或工号"
          />
          <span className="text-sm text-slate-500">
            用于责任追踪和报表统计，例如：张三 / ZS01。
          </span>
        </div>

        {/* 采购时间 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">
            采购时间（必填）
          </label>
          <input
            type="datetime-local"
            className="mt-1 rounded-xl border border-slate-300 px-4 py-3 text-base"
            value={purchaseTime}
            onChange={(e) => onChangePurchaseTime(e.target.value)}
          />
          <span className="text-sm text-slate-500">
            通常为下单时间或采购单确认时间，用于统计采购节奏与供应商表现。
          </span>
        </div>
      </div>
    </section>
  );
};
