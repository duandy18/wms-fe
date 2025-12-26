// src/features/admin/stores/bindWarehouseForm/ui.ts
//
// StoreBindWarehouseForm 私有 UI tokens（仅影响该表单，不污染全局）
// 后续可合并进 src/features/admin/stores/ui.ts 做全模块统一。

export const UI = {
  card: "bg-white border border-slate-200 rounded-xl p-4 space-y-3",

  title: "text-base font-semibold text-slate-900",

  formRow: "flex flex-wrap gap-4 items-end text-sm",

  labelCol: "flex flex-col gap-1",
  labelRow: "flex items-center gap-2",

  labelText: "text-slate-600",

  select: "border rounded px-3 py-2 text-base w-64",
  inputNumber: "border rounded px-3 py-2 text-base w-28",

  errorText: "text-xs text-red-500 mt-1",

  btnSubmit:
    "px-5 py-2 rounded-lg bg-slate-900 text-white text-base font-medium hover:bg-slate-800 disabled:opacity-50",
};
