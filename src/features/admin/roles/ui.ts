// src/features/admin/roles/ui.ts
//
// Roles 模块私有 UI tokens（不污染全局）
// 目标：角色管理页密度/字体/表格/滚动区统一收口，一处改整页生效。

export const UI = {
  page: "space-y-4 text-sm",

  h2: "text-lg font-semibold",
  h3: "text-base font-semibold",

  errBanner: "text-sm text-red-600 bg-red-50 border px-3 py-2 rounded",

  card: "bg-white border rounded-xl p-4 space-y-3",

  formGrid: "grid grid-cols-1 md:grid-cols-3 gap-3",
  field: "flex flex-col gap-1",
  label: "text-xs text-slate-600",
  input: "border rounded-lg px-3 py-2",
  btnPrimary: "px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60",

  // list
  listWrap: "bg-white border rounded-xl overflow-hidden",
  listLoading: "px-4 py-6",
  listEmpty: "px-4 py-6 text-slate-500",

  table: "min-w-full text-sm",
  thead: "bg-slate-50 border-b",
  th: "px-3 py-2 text-left",
  tr: "border-b hover:bg-slate-50",
  td: "px-3 py-2",
  dash: "text-slate-400",
  actionLink: "text-xs text-sky-700 hover:underline",

  // edit perms
  permPanelTitle: "text-base font-semibold",
  permBox: "max-h-64 overflow-auto border rounded-lg p-2",
  permHint: "px-2 py-1 text-xs text-slate-500",
  permGrid: "grid grid-cols-1 md:grid-cols-2 gap-1 text-xs",
  permRow: "flex items-center gap-2 px-2 py-1 hover:bg-slate-50 cursor-pointer",
  permName: "font-mono text-[11px]",

  btnSavePerms: "px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60",
};
