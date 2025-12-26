// src/features/orders/page/ui.ts
//
// OrdersPage 模块私有 UI tokens（不污染全局）

export const UI = {
  page: "space-y-4 p-6",

  card: "space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm",
  listCard: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",

  err: "text-xs text-red-600",
  hint: "text-xs text-slate-500",
  mono11: "font-mono text-[11px]",

  // filters
  filtersRow: "flex flex-wrap items-end gap-4",
  field: "flex flex-col gap-1",
  fieldLabel: "text-xs text-slate-500",
  input: "h-9 rounded border border-slate-300 px-2 text-sm",
  inputW28: "h-9 w-28 rounded border border-slate-300 px-2 text-sm",
  inputW32: "h-9 w-32 rounded border border-slate-300 px-2 text-sm",
  inputW20: "h-9 w-20 rounded border border-slate-300 px-2 text-sm",
  btnQuery:
    "inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60",

  // detail
  detailHeadRow: "flex flex-wrap items-center justify-between gap-2",
  detailTitle: "text-sm font-semibold text-slate-800",
  detailActions: "flex flex-wrap items-center gap-2 text-xs",
  pillBtn: "rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100",
  devLink: "inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100",

  grid3: "grid grid-cols-1 gap-y-2 text-xs md:grid-cols-3 md:gap-x-8",
  label11: "text-[11px] text-slate-500",

  factsHead: "flex items-center justify-between",
  factsTitle: "text-xs font-semibold text-slate-700",
  factsMeta: "text-[11px] text-slate-500",
  factsWrap: "overflow-x-auto rounded-md border border-slate-200",
  factsTable: "min-w-full text-[11px]",
  factsThead: "bg-slate-50 text-[11px] font-semibold text-slate-600",
  factsTr: "border-t border-slate-100",
  factsTd: "px-2 py-1",
  factsTdMono: "px-2 py-1 font-mono text-[11px]",
};
