// src/features/admin/shipping-providers/ui.ts
//
// Shipping Providers 模块私有 UI tokens（不做全局污染）
// 目标：页面 JSX 不再散落 text-sm / px-4 / py-3 等细节。
// 改样式只改这里一处。

export const UI = {
  // Typography
  title: "text-2xl",
  h2: "text-xl",
  body: "text-lg",
  small: "text-base",
  tiny: "text-sm",

  // Layout
  page: "space-y-6 p-6",
  card: "space-y-4 rounded-2xl border border-slate-200 bg-white p-5",
  cardHeader: "flex items-center justify-between gap-3",
  helper: "text-sm text-slate-600",
  error: "text-sm text-red-600",

  // Form
  field: "flex flex-col",
  label: "text-sm text-slate-600",
  input: "mt-1 rounded-xl border border-slate-300 px-4 py-3 text-lg w-full",
  inputMono: "mt-1 rounded-xl border border-slate-300 px-4 py-3 text-lg font-mono w-full",
  select: "mt-1 rounded-xl border border-slate-300 px-4 py-3 text-lg w-full",
  textareaMono: "mt-1 h-40 rounded-xl border border-slate-300 px-4 py-3 text-sm font-mono w-full",

  // Buttons
  btnPrimary:
    "inline-flex items-center rounded-2xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm disabled:opacity-60",
  btnPrimaryGreen:
    "inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-sm disabled:opacity-60",
  btnSecondary:
    "inline-flex items-center rounded-2xl border border-slate-300 px-5 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60",

  pill: "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold",
  pillActive: "bg-emerald-100 text-emerald-800",
  pillInactive: "bg-slate-200 text-slate-700",

  // Table
  tableWrap: "overflow-x-auto",
  table: "min-w-full text-base",
  theadRow: "border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600",
  th: "px-4 py-3 text-left whitespace-nowrap",
  tr: "border-b border-slate-100 hover:bg-slate-50",
  td: "px-4 py-3 whitespace-nowrap",
  tdMono: "px-4 py-3 whitespace-nowrap font-mono",
  empty: "px-4 py-10 text-center text-slate-400",

  // Minor
  badgeBtn: "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold",
  badgeBtnActive: "border-sky-600 bg-sky-50 text-sky-700",
  badgeBtnIdle: "border-slate-300 bg-white text-slate-800 hover:border-sky-400",

  // ===== Page-level (ShippingProvidersListPage / ProvidersTable) =====
  twoColGrid: "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
  createProviderGrid: "grid grid-cols-1 gap-4 md:grid-cols-6",

  providersHeadRow: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
  providersFiltersRow: "flex flex-wrap items-center gap-3",
  providersOnlyActiveLabel: "inline-flex items-center gap-2",
  providersOnlyActiveCheckbox: "h-4 w-4 rounded border-slate-300",
  providersSearchInput: "w-64 rounded-xl border border-slate-300 px-4 py-3 text-lg",
};
