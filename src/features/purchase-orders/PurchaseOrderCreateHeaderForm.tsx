// src/features/purchase-orders/PurchaseOrderCreateHeaderForm.tsx
// 采购单头部输入卡
// - 第一行：供应商 / 仓库 / 采购人 / 采购时间
// - 第二行：备注

import React from "react";
import type { SupplierBasic } from "../../domains/partners/export/contracts/supplierBasic";

interface PurchaseOrderCreateHeaderFormProps {
  supplierId: number | null;
  supplierName: string;
  supplierOptions: SupplierBasic[];
  suppliersLoading: boolean;
  suppliersError: string | null;

  warehouseId: string;
  purchaser: string;
  purchaseTime: string;
  remark: string;

  error: string | null;

  onSelectSupplier: (id: number | null) => void;
  onChangeWarehouseId: (v: string) => void;
  onChangePurchaser: (v: string) => void;
  onChangePurchaseTime: (v: string) => void;
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
  purchaser,
  purchaseTime,
  remark,
  error,
  onSelectSupplier,
  onChangeWarehouseId,
  onChangePurchaser,
  onChangePurchaseTime,
  onChangeRemark,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-900">采购单头部信息</h2>
        <p className="mt-1 text-sm text-slate-500">
          头表只录计划合同字段，不录执行态字段。采购单号、状态、金额等由后端生成或回显。
        </p>
      </div>

      {error ? <div className="text-base text-red-600">{error}</div> : null}
      {suppliersError ? <div className="text-base text-red-600">{suppliersError}</div> : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 text-base">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">供应商（必选）</label>
          <select
            className="rounded-xl border border-slate-300 px-4 py-3 text-base"
            value={supplierId ?? ""}
            disabled={suppliersLoading}
            onChange={(e) => onSelectSupplier(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{suppliersLoading ? "加载中…" : "请选择供应商"}</option>
            {supplierOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `[${s.code}] ${s.name}` : s.name}
              </option>
            ))}
          </select>
          {supplierName ? (
            <span className="text-sm text-slate-500">当前选择：{supplierName}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">仓库（必选）</label>
          <select
            className="rounded-xl border border-slate-300 px-4 py-3 text-base"
            value={warehouseId}
            onChange={(e) => onChangeWarehouseId(e.target.value)}
          >
            <option value="">请选择仓库</option>
            <option value="1">WH1 · 默认仓</option>
            <option value="2">WH2 · 备用仓</option>
            <option value="3">WH3 · 退货仓</option>
          </select>
          <span className="text-sm text-slate-500">
            当前版本仍使用固定仓库列表；后续应改为仓库主数据接口。
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">采购人（必填）</label>
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 text-base"
            value={purchaser}
            onChange={(e) => onChangePurchaser(e.target.value)}
            placeholder="采购人姓名或工号"
          />
          <span className="text-sm text-slate-500">
            用于责任追踪和报表统计，例如：张三 / ZS01。
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600">采购时间（必填）</label>
          <input
            type="datetime-local"
            className="rounded-xl border border-slate-300 px-4 py-3 text-base"
            value={purchaseTime}
            onChange={(e) => onChangePurchaseTime(e.target.value)}
          />
          <span className="text-sm text-slate-500">
            通常为下单时间或采购确认时间。
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-600">备注（可选）</label>
        <textarea
          className="min-h-[96px] rounded-xl border border-slate-300 px-4 py-3 text-base"
          value={remark}
          onChange={(e) => onChangeRemark(e.target.value)}
          placeholder="填写头部备注，例如：交期要求、到货说明、采购背景等"
        />
      </div>
    </section>
  );
};
