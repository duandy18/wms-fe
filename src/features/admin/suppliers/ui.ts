// src/features/admin/suppliers/ui.ts
// 只影响 suppliers 页面（本目录内使用）

export const UI = {
  // 字号体系：最大不超过 PageTitle 的 title
  title: "text-2xl",
  h2: "text-xl",
  body: "text-lg",
  small: "text-base",

  // 容器
  card: "rounded-2xl border border-slate-200 bg-white p-8",
  subcard: "rounded-2xl border border-slate-200 bg-slate-50 p-6",

  // 表格
  table: "min-w-full text-lg",
  theadRow: "h-16 text-slate-800",
  tbodyRow: "h-16",

  // 控件
  input: "w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg",
  select: "w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg",
  btn: "rounded-2xl border border-slate-300 px-6 py-3 text-lg hover:bg-slate-50",
  btnPrimary:
    "rounded-2xl bg-slate-900 px-8 py-4 text-lg text-white disabled:opacity-60",
  btnDanger:
    "rounded-2xl border border-red-300 px-6 py-3 text-lg text-red-700 hover:bg-red-50",

  // 反馈
  errorBox:
    "rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-lg text-red-700",
  badgeOk:
    "inline-flex items-center rounded-full px-4 py-2 text-lg font-semibold bg-emerald-100 text-emerald-800",
  badgeBad:
    "inline-flex items-center rounded-full px-4 py-2 text-lg font-semibold bg-red-100 text-red-800",
} as const;
