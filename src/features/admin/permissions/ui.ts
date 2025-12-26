// src/features/admin/permissions/ui.ts
//
// Permissions 模块私有 UI tokens（不污染全局）
// 目标：权限字典页密度/字体/表格统一收口。

export const UI = {
  page: "space-y-4 text-sm",

  header: "flex items-center justify-between",
  h2: "text-lg font-semibold",
  desc: "mt-1 text-xs text-slate-600",
  codePill: "font-mono text-[11px] bg-slate-100 px-1 rounded",

  errBanner: "border border-red-200 bg-red-50 rounded px-3 py-2 text-red-600",

  card: "bg-white border rounded-xl p-4 space-y-3",
  h3: "text-base font-semibold text-slate-800",

  formGrid: "grid grid-cols-1 md:grid-cols-3 gap-3",
  field: "flex flex-col gap-1",
  label: "text-xs text-slate-600",
  input: "border rounded px-3 py-2 text-sm",
  btnPrimary: "px-4 py-2 bg-sky-600 text-white rounded text-sm disabled:opacity-60",

  listWrap: "border bg-white rounded-xl overflow-hidden",
  listLoading: "p-4 text-sm text-slate-600",
  listEmpty: "p-4 text-sm text-slate-500",

  table: "min-w-full text-sm",
  thead: "bg-slate-50 border-b",
  th: "px-3 py-2 text-left",
  tr: "border-b hover:bg-slate-50",
  td: "px-3 py-2",
  tdMono: "px-3 py-2 font-mono text-[12px]",
  dash: "text-slate-400",
};
