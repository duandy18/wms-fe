// src/features/admin/items/form/ui.ts
//
// ItemsFormSection 模块私有 UI tokens（不污染全局）

export const UI = {
  wrap: "grid grid-cols-1 items-start gap-6 lg:grid-cols-2",

  card: "space-y-4 rounded-xl border border-slate-200 bg-white p-4",
  h2: "text-sm font-semibold text-slate-800",

  grid2: "grid grid-cols-1 gap-4 text-sm md:grid-cols-2",
  grid4: "grid grid-cols-1 gap-4 text-sm md:grid-cols-4",

  label: "text-xs text-slate-600",
  hint: "text-[11px] text-slate-500",
  err: "text-xs text-red-600",

  input: "rounded-lg border px-3 py-2 text-sm",
  inputMono: "rounded-lg border px-3 py-2 font-mono text-sm",
  inputSm: "rounded-lg border px-2 py-1 text-sm",
  inputSmMono: "rounded-lg border px-2 py-1 font-mono",

  btnPrimary: "rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60",
  btnNeutral: "rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50",

  chip: "rounded-full border px-2 py-0.5 text-[11px] hover:bg-slate-50",
  pill: "rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono",
};
