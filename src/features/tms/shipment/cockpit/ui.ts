// src/features/tms/shipment/cockpit/ui.ts
//
// Shipment Cockpit 模块私有 UI tokens（不污染全局）
// 目标：
// - 从旧“三列执行台”切到“单列顺序式发运作业台”
// - 统一卡片、表格、状态、按钮样式
// - 第一轮先服务静态壳子，不做复杂交互

export const UI = {
  page: "space-y-4 p-6",

  stageStack: "space-y-4",

  card: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
  cardMuted:
    "rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm",
  cardHeader: "mb-4 flex items-center justify-between gap-3",
  cardTitleWrap: "flex items-center gap-3",
  stageNo:
    "inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-900 px-2 text-sm font-semibold text-white",
  h2: "text-lg font-semibold text-slate-800",
  h3: "text-base font-semibold text-slate-800",

  label: "text-sm text-slate-600",
  helper: "text-sm text-slate-500",
  muted: "text-sm text-slate-500",
  mono: "font-mono",

  input: "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-base",
  inputMono:
    "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-base font-mono",

  btnPrimary:
    "inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60",
  btnSecondary:
    "inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",

  btnGroup: "flex flex-wrap gap-2",
  btnSegmentActive:
    "inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white",
  btnSegmentIdle:
    "inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700",

  errorBox:
    "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",

  summaryGrid: "grid grid-cols-1 gap-3 md:grid-cols-2",
  summaryBox: "rounded-2xl border border-slate-200 bg-slate-50 p-4",
  summaryList: "space-y-2 text-sm text-slate-700",

  kvRow: "flex items-start gap-2",
  kvLabel: "min-w-[88px] font-semibold text-slate-700",
  kvValue: "break-words text-slate-800",

  tableWrap: "overflow-hidden rounded-2xl border border-slate-200",
  tableScroll: "overflow-x-auto",
  table: "min-w-full border-collapse text-sm",
  thead: "bg-slate-50 text-slate-600",
  th: "px-4 py-3 text-left font-semibold",
  td: "px-4 py-3 align-top text-slate-800",
  tr: "border-t border-slate-100",

  badgeBase:
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
  badgeSlate: "border-slate-200 bg-slate-50 text-slate-700",
  badgeAmber: "border-amber-200 bg-amber-50 text-amber-700",
  badgeBlue: "border-sky-200 bg-sky-50 text-sky-700",
  badgeGreen: "border-emerald-200 bg-emerald-50 text-emerald-700",
  badgeRed: "border-rose-200 bg-rose-50 text-rose-700",

  packageList: "space-y-3",
  packageCard: "rounded-2xl border border-slate-200 bg-slate-50 p-4",
  packageHeader: "mb-3 flex items-center justify-between gap-3",
  packageMeta: "space-y-2 text-sm text-slate-700",

  actionRow: "mt-4 flex flex-wrap gap-2",
  sectionNote:
    "mt-3 rounded-2xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500",
};
