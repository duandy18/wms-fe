// src/features/admin/warehouses/ui.ts
//
// Warehouses 模块私有 UI tokens（不污染全局）
// 目标：页面级字号/密度/表格/按钮统一收口，一处改整页生效。

export const UI = {
  // ===== Page =====
  page: "space-y-4 p-4",

  // 标题/返回
  backLink: "text-sm text-sky-700 underline",

  // 反馈
  errBanner: "rounded px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-100",
  infoText: "text-sm text-slate-500",

  // Detail Card
  detailCard: "space-y-5 rounded-xl border border-slate-200 bg-white p-5",
  detailIdLine: "text-base",
  detailIdLabel: "mr-2 text-slate-500",
  detailIdValue: "font-semibold",

  // Form layout
  formGrid: "grid grid-cols-1 gap-4 text-base md:grid-cols-2 lg:grid-cols-3",
  field: "flex flex-col gap-1",
  label: "text-sm text-slate-500",
  input: "rounded-lg border px-3 py-2 text-base",
  select: "rounded-lg border px-3 py-2 text-base",
  btnSave: "rounded-lg bg-slate-900 px-5 py-2 text-base text-white disabled:opacity-60",
  noPerm: "text-sm text-slate-500",

  // Invalid param
  invalidParam: "p-4 text-sm text-red-600",

  // ===== Table (WarehousesTable) =====
  tableSection: "bg-white border border-slate-200 rounded-xl overflow-hidden",
  tableEmpty: "px-4 py-6 text-base text-slate-500",
  tableLoading: "px-4 py-6 text-base text-slate-600",

  tableToolbar: "px-4 pt-3 pb-2 flex items-center justify-between",
  tableToolbarText: "text-sm text-slate-500",
  tableToolbarToggle: "text-sm text-slate-600 flex items-center gap-2",

  table: "min-w-full text-sm",
  thead: "bg-slate-50 border-b border-slate-300",
  th: "px-4 py-3 text-left",

  // widths
  colW16: "w-16",
  colW28: "w-28",
  colW32: "w-32",
  colW36: "w-36",
  colW40: "w-40",
  colW64: "w-64",

  tr: "border-b border-slate-200 hover:bg-slate-50",
  trInactive: "bg-slate-50 text-slate-400",
  td: "px-4 py-3",
  tdStrong: "px-4 py-3 font-medium",

  sortBtnBase: "inline-flex items-center gap-0.5",
  sortBtnActive: "text-slate-900 font-semibold",
  sortBtnIdle: "text-slate-700",
  sortArrow: "text-[11px]",

  // buttons
  btnCellBase: "px-3 py-1.5 rounded-lg border text-xs",
  btnEnable: "border-emerald-400 text-emerald-700 hover:bg-emerald-50",
  btnDisable: "border-slate-400 text-slate-800 hover:bg-slate-100",
  btnDisabled: "border-slate-300 text-slate-400 cursor-not-allowed",

  // "detail" button
  btnDetailIdle: "border-slate-400 text-slate-800 hover:bg-slate-100",
  btnDetailDisabled: "border-slate-300 text-slate-400 cursor-not-allowed",
};
