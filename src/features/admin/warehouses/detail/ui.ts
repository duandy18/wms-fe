// src/features/admin/warehouses/detail/ui.ts
// 模块私有样式 token：只服务 warehouses 详情页，不做全局污染

export const UI = {
  pageWrap: "space-y-8 p-10",
  section: "space-y-8 rounded-2xl border border-slate-200 bg-white p-10",
  title2: "text-2xl font-semibold",
  hint: "mt-2 text-base text-slate-500",

  okBanner:
    "rounded-xl px-5 py-4 text-xl text-emerald-800 bg-emerald-50 border border-emerald-100 flex flex-wrap items-center justify-between gap-3",
  errBanner: "rounded-xl px-5 py-4 text-xl text-red-700 bg-red-50 border border-red-100",

  // ---------------------------
  // 上方：仓库基本信息（变小些）
  // ---------------------------
  labelBasic: "text-sm text-slate-500",
  inputBasic: "rounded-2xl border px-4 py-3 text-lg",
  inputBasicMono: "rounded-2xl border px-4 py-3 text-lg font-mono",
  selectBasic: "rounded-2xl border px-4 py-3 text-lg",
  btnPrimaryBasic:
    "rounded-2xl bg-slate-900 px-8 py-4 text-lg text-white disabled:opacity-60",

  btnLink: "text-xl text-sky-700 underline",
  btnLinkMuted: "text-xl text-slate-700 underline",

  // ---------------------------
  // 下方：服务省份（变大些 + 高度统一）
  // ---------------------------
  spBtn: "rounded-2xl bg-slate-900 px-8 py-4 text-xl text-white disabled:opacity-60",
  spOk: "rounded-xl px-5 py-4 text-base text-emerald-800 bg-emerald-50 border border-emerald-100",
  spErr: "rounded-xl px-5 py-4 text-base text-red-700 bg-red-50 border border-red-100",

  spPanel: "rounded-2xl border border-slate-100 bg-slate-50 p-6",
  spPanelTitle: "text-lg font-semibold text-slate-900",
  spPanelHint: "mt-1 text-base text-slate-500",

  spSearchLabel: "text-base text-slate-600",
  spSearchInput:
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg",

  // 左侧列表滚动区
  spListBox:
    "mt-4 max-h-[360px] overflow-auto rounded-xl border border-slate-100 bg-white p-3",
  spListItem: "flex items-center gap-3 rounded-lg px-2 py-2",
  spListItemHover: "hover:bg-slate-50",
  spListText: "text-base",
  spListBadge: "text-sm text-slate-600",

  // 右侧预览
  spPreviewBox: "rounded-2xl border border-slate-100 bg-slate-50 p-6",
  spPreviewTitle: "text-lg font-semibold text-slate-900",
  spPreviewHint: "mt-2 text-base text-slate-500",
  spPreviewInner:
    "mt-4 max-h-[360px] overflow-auto rounded-xl bg-white border border-slate-100 p-4",
} as const;
