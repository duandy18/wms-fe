// src/features/admin/suppliers/ui.ts
//
// Suppliers 模块私有 UI tokens（不污染全局）
// 目标：页面密度、表格样式、输入按钮统一收口

export const UI = {
  page: "space-y-6 p-6",

  card: "space-y-3 rounded-xl border border-slate-200 bg-white p-4",
  titleRow: "flex items-center justify-between gap-2",
  h2: "text-sm font-semibold text-slate-800",

  errorText: "text-xs text-red-600",
  hintText: "text-xs text-slate-500",
  mutedText: "text-xs text-slate-600",

  formGrid: "grid grid-cols-1 gap-3 text-sm md:grid-cols-6",
  label: "text-xs text-slate-500",
  input: "mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm",
  inputMono: "mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm font-mono",

  btnPrimary: "inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm disabled:opacity-60",
  btnNeutral: "rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60",

  filtersRow: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
  filtersWrap: "flex flex-wrap items-center gap-2 text-xs",
  checkbox: "h-3 w-3 rounded border-slate-300",
  searchInput: "w-40 rounded-md border border-slate-300 px-2 py-1",

  tableWrap: "overflow-x-auto",
  table: "min-w-full text-xs",
  theadRow: "border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500",
  th: "px-2 py-1 text-left",
  tr: "border-b border-slate-100 hover:bg-slate-50",
  td: "px-2 py-1",
  tdMono: "px-2 py-1 font-mono text-[11px]",
  emptyRow: "px-2 py-4 text-center text-slate-400",

  statusBtnBase: "inline-flex items-center rounded-full px-2 py-0.5 text-[11px]",
  statusOn: "bg-emerald-100 text-emerald-800",
  statusOff: "bg-slate-200 text-slate-600",
};
