// src/features/admin/items/barcodes-panel/ui.ts
//
// ItemBarcodesPanel 模块私有 UI tokens（不污染全局）

export const UI = {
  card: "space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3",
  headerRow: "flex items-center justify-between",
  title: "text-sm font-semibold text-slate-800",
  headerMeta: "text-[11px] text-slate-500",

  hint: "text-xs text-slate-500",
  error: "text-xs text-red-600",
  loading: "text-xs text-slate-500",

  tableWrap: "overflow-auto rounded border border-slate-200 bg-white",
  table: "min-w-full text-[11px]",
  thead: "bg-slate-50",
  th: "border-b px-2 py-1 text-left",
  tr: "border-t border-slate-100",
  td: "px-2 py-1",
  tdMono: "px-2 py-1 font-mono",

  primaryPill: "rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700",
  btnSetPrimary: "rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50",
  btnDelete: "text-[11px] text-red-600 hover:underline",

  formRow: "mt-2 flex flex-wrap items-center gap-2",
  inputBarcode: "min-w-[180px] rounded border bg-white px-2 py-1 text-[11px] font-mono",
  selectKind: "rounded border bg-white px-2 py-1 text-[11px]",
  btnAdd: "rounded bg-slate-900 px-3 py-1 text-[11px] text-white disabled:opacity-60",
};
