// src/features/admin/items/table/ui.ts
//
// ItemsTable 模块私有 UI tokens（不污染全局）
// - 表格密度/高度/输入控件/按钮统一收口

export const UI = {
  loadingText: "text-sm text-slate-500",

  wrap: "overflow-hidden rounded-lg border border-slate-200",
  scroll: "max-h-[520px] overflow-x-auto overflow-y-auto",

  table: "min-w-full border-collapse text-sm",
  thead: "sticky top-0 z-10 bg-slate-50",
  th: "border-b px-3 py-2 text-left",
  trBase: "border-t border-slate-100",
  trSelected: "bg-sky-50 ring-1 ring-sky-300",
  trDisabled: "bg-slate-50 text-slate-400",

  td: "px-3 py-2",
  tdMono: "whitespace-nowrap px-3 py-2 font-mono",
  tdMonoSm: "px-3 py-2 font-mono text-[11px]",
  tdRight: "px-3 py-2 text-right",

  inputBase: "rounded border px-2 py-1 text-sm",
  inputMonoRight: "w-24 rounded border px-2 py-1 text-right text-sm font-mono",
  inputName: "w-48 rounded border px-2 py-1 text-sm",
  inputSpec: "w-40 rounded border px-2 py-1 text-sm",
  inputUom: "w-20 rounded border px-2 py-1 text-sm",
  selectSupplier: "w-48 rounded border px-2 py-1 text-sm",

  pillOn: "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700",
  pillOff: "rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-xs text-slate-500",

  btn: "rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50",
  btnSave: "mr-2 rounded border border-emerald-500 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 disabled:opacity-60",
  btnCancel: "rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50",
};
