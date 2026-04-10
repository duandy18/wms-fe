// src/features/pms/suppliers/ui/index.ts
// 只影响 suppliers 页面（本目录内使用）

export const UI = {
  // 字号体系：回落到常规业务页密度
  title: "text-2xl",
  h2: "text-base",
  body: "text-sm",
  small: "text-xs",

  // 容器
  card: "rounded-xl border border-slate-200 bg-white p-6",
  subcard: "rounded-xl border border-slate-200 bg-slate-50 p-4",

  // 表格
  table: "min-w-full text-sm",
  theadRow: "h-12 text-slate-800",
  tbodyRow: "h-12",

  // 控件
  input: "w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white",
  select: "w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white",
  btn: "rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50",
  btnPrimary:
    "rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60",
  btnDanger:
    "rounded border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50",

  // 反馈
  errorBox:
    "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
  badgeOk:
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-emerald-100 text-emerald-800",
  badgeBad:
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-red-100 text-red-800",
} as const;
