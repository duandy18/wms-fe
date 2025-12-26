// src/features/admin/stores/detail/ui.ts
//
// StoreDetailPage 模块私有 UI tokens（不污染全局）

export const UI = {
  page: "space-y-4 p-4",

  backLink: "text-sm text-sky-700 underline",

  bannerErr: "rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600",
  bannerOk: "rounded border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700",

  card: "space-y-4 rounded-xl border border-slate-200 bg-white p-4",
  cardTitle: "text-base font-semibold text-slate-900",
  metaLine: "text-xs text-slate-500",

  formGrid: "grid grid-cols-1 gap-4 text-sm md:grid-cols-2",
  field: "flex flex-col gap-1",
  label: "text-xs text-slate-500",
  input: "rounded-lg border px-3 py-2 text-sm",

  btnPrimary: "rounded-lg bg-slate-900 px-5 py-2 text-sm text-white disabled:opacity-60",

  loadingText: "text-sm text-slate-500",
};
