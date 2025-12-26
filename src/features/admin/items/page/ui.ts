// src/features/admin/items/page/ui.ts
//
// ItemsPage 模块私有 UI tokens（不污染全局）

export const UI = {
  page: "space-y-6 p-6",

  headerTitle: "text-2xl font-semibold text-slate-900",
  headerDesc: "mt-1 text-sm text-slate-500",
  mono: "font-mono",

  statsGrid: "grid grid-cols-1 gap-3 md:grid-cols-3",
  statCard: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm",
  statCardOk: "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm",
  statCardWarn: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm",
  statLabel: "text-[11px] text-slate-500",
  statLabelOk: "text-[11px] text-emerald-700",
  statLabelWarn: "text-[11px] text-amber-700",
  statValue: "mt-1 text-xl font-semibold text-slate-900",
  statValueOk: "mt-1 text-xl font-semibold text-emerald-900",
  statValueWarn: "mt-1 text-xl font-semibold text-amber-900",

  card: "space-y-3 rounded-xl border border-slate-200 bg-white p-4",
  h2: "text-sm font-semibold text-slate-800",
  hint11: "text-[11px] text-slate-500",

  // ✅ 补齐：给 ItemBarcodesCard 使用
  mutedText: "text-xs text-slate-500",

  infoBoxSky: "space-y-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-800",
  infoBox: "space-y-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700",
  warnText: "text-[11px] text-amber-700",
  errText: "text-[11px] text-red-600",
  okText: "text-emerald-700",

  errorBanner: "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600",

  listHeaderRow: "flex items-center justify-between",
  filterRow: "flex items-center gap-2 text-[11px] text-slate-600",
  filterBtnBase: "rounded px-2 py-1 border",
  filterBtnOn: "border-slate-900 text-slate-900",
  filterBtnIdle: "border-slate-300 text-slate-500",
  filterBtnEnabledOn: "border-emerald-500 text-emerald-700",
  filterBtnDisabledOn: "border-slate-500 text-slate-800",
};
