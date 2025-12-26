// src/features/admin/users/panels/users-panel/ui.ts
//
// UsersPanel 模块私有 UI tokens（不污染全局）

export const UI = {
  page: "space-y-4 text-sm",

  h2: "text-lg font-semibold",

  errorBanner: "border border-red-200 bg-red-50 text-red-600 px-3 py-2 rounded",

  card: "bg-white border rounded-xl p-4 space-y-3",
  cardTitle: "text-base font-semibold",

  formGrid: "grid grid-cols-1 md:grid-cols-3 gap-3",
  label: "text-xs text-slate-600",
  input: "border rounded px-3 py-2 w-full",
  select: "border rounded px-3 py-2 w-full",

  roleWrap: "flex flex-wrap gap-2",
  roleCheck: "flex items-center gap-1",

  btnPrimary: "px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-50",
  btnRow: "flex items-end",

  listWrap: "border bg-white rounded-xl overflow-hidden",
  listEmpty: "p-4 text-slate-500",
  listLoading: "p-4",

  table: "min-w-full text-sm",
  thead: "bg-slate-50 border-b",
  th: "px-3 py-2 text-left",
  tr: "border-b hover:bg-slate-50",
  td: "px-3 py-2",
  rolePill: "inline-block px-2 py-0.5 bg-slate-100 rounded text-xs mr-1",
  statusOn: "px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs",
  statusOff: "px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs",

  actionsWrap: "flex gap-2 text-xs",
  btnSmall: "px-2 py-1 border rounded hover:bg-slate-100",
  btnWarn: "px-2 py-1 border border-amber-400 text-amber-700 rounded hover:bg-amber-50",

  // modal
  modalMask: "fixed inset-0 bg-black/30 flex items-center justify-center z-50",
  modalCard: "bg-white rounded-xl p-6 w-[520px] shadow-xl space-y-4",
  modalTitle: "text-lg font-semibold",
  modalForm: "space-y-4",
  modalGrid: "grid grid-cols-2 gap-3",
  modalRolesWrap: "flex flex-wrap gap-2 mt-1",
  modalFooter: "flex justify-end gap-3 pt-2",
  modalCancel: "px-4 py-2 text-sm text-slate-600 hover:text-slate-900",
  modalSave: "px-4 py-2 text-sm rounded-lg bg-sky-600 text-white disabled:opacity-50",
};
