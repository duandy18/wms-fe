// src/features/admin/items/sku-builder/ui.ts
//
// SkuBuilderPanel 模块私有 UI tokens（不污染全局）

export const UI = {
  card: "border border-slate-200 rounded-xl bg-white p-4 space-y-3",

  headerRow: "flex items-center justify-between gap-2",
  title: "text-sm font-semibold text-slate-800",
  hint11: "text-[11px] text-slate-500",
  hint11Muted: "text-[11px] text-slate-400",
  mono: "font-mono",

  fieldsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs",
  fieldWrap: "space-y-1",
  label: "text-slate-600",
  input: "w-full rounded border border-slate-300 px-2 py-1 text-xs",
  select: "w-full rounded border border-slate-300 px-2 py-1 text-xs",
  miniHelp: "text-[11px] text-slate-400",

  weightRow: "flex gap-2",
  weightInput: "w-24 rounded border border-slate-300 px-2 py-1 text-xs",
  unitSelect: "w-20 rounded border border-slate-300 px-2 py-1 text-xs",

  previewBox: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs",
  previewRow: "flex items-center justify-between gap-2",
  previewLabel: "text-slate-600",
  previewValue: "font-mono text-sm text-slate-900",

  actionsRow: "flex flex-wrap items-center gap-2 text-xs",
  btnBase: "px-3 py-1 rounded border text-xs",
  btnPrimaryOn: "bg-slate-900 text-white border-slate-900 hover:bg-slate-800",
  btnPrimaryOff: "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed",
  btnSecondOn: "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100",
  btnSecondOff: "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed",
};
