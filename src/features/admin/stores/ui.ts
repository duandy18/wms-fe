// src/features/admin/stores/ui.ts
//
// Stores 模块私有 UI tokens（不污染全局）
// 目标：表单/表格/按钮密度统一收口，一处改整页生效。

export const UI = {
  // ===== Common card =====
  card: "bg-white border border-slate-200 rounded-xl space-y-3",
  cardP4: "bg-white border border-slate-200 rounded-xl p-4 space-y-3",
  cardP5: "bg-white border border-slate-200 rounded-xl p-5 space-y-4",

  titleLg: "text-lg font-semibold text-slate-800",
  titleBase: "text-base font-semibold text-slate-900",
  hint: "text-sm text-slate-500",
  hintXs: "text-xs text-slate-500",
  labelSm: "text-sm text-slate-500",
  labelXs: "text-xs text-slate-600",

  // ===== Form =====
  formGrid4: "grid grid-cols-1 md:grid-cols-4 gap-4 text-base",
  formRowWrap: "flex flex-wrap gap-4 items-end text-sm",
  fieldCol: "flex flex-col gap-1",
  inputBase: "border rounded-lg px-3 py-2 text-base",
  inputW64: "border rounded px-3 py-2 text-base w-64",
  inputW28: "border rounded px-3 py-2 text-base w-28",
  checkboxRow: "flex items-center gap-2 text-base",

  btnPrimary: "px-5 py-2 rounded-lg bg-slate-900 text-white text-base disabled:opacity-60",
  btnPrimaryHover: "px-5 py-2 rounded-lg bg-slate-900 text-white text-base font-medium hover:bg-slate-800 disabled:opacity-50",

  // ===== Table: common frame =====
  tableSection: "bg-white border border-slate-200 rounded-xl overflow-hidden",
  tableEmpty: "px-4 py-6 text-base text-slate-500",
  tableLoading: "px-4 py-6 text-base text-slate-600",

  tableToolbar: "px-4 pt-3 pb-2 flex items-center justify-between",
  tableToolbarText: "text-sm text-slate-500",
  tableToolbarToggle: "text-sm text-slate-600 flex items-center gap-2",

  table: "min-w-full text-sm",
  thead: "bg-slate-50 border-b border-slate-300",
  th: "px-4 py-3 text-left",
  thHint: "block text-xs text-slate-500",

  // ✅ th 宽度快捷（给 StoreBindingsTable 用）
  thW32: "px-4 py-3 text-left w-32",
  thW36: "px-4 py-3 text-left w-36",

  // widths
  colW16: "w-16",
  colW24: "w-24",
  colW28: "w-28",
  colW32: "w-32",
  colW40: "w-40",
  colW48: "w-48",
  colW56: "w-56",

  tr: "border-b border-slate-200 hover:bg-slate-50",
  trInactive: "bg-slate-50 text-slate-400",
  td: "px-4 py-3",
  tdStrong: "px-4 py-3 font-medium",
  tdText: "px-4 py-3 text-sm",

  // sort header
  sortBtnBase: "inline-flex items-center gap-0.5",
  sortBtnActive: "text-slate-900 font-semibold",
  sortBtnIdle: "text-slate-700",
  sortArrow: "text-[11px]",

  // route mode select
  routeSelect: "border rounded px-3 py-1.5 text-sm",

  // status toggle btn
  btnSmBase: "px-3 py-1.5 rounded-lg border text-xs",
  btnEnable: "border-emerald-400 text-emerald-700 hover:bg-emerald-50",
  btnDisable: "border-slate-400 text-slate-800 hover:bg-slate-100",
  btnDisabled: "border-slate-300 text-slate-400 cursor-not-allowed",

  // detail btn
  btnDetailIdle: "border-slate-400 text-slate-800 hover:bg-slate-100",
  btnDetailDisabled: "border-slate-300 text-slate-400 cursor-not-allowed",

  // ===== Bindings table =====
  rowActions: "flex gap-2",
  btnSmIdle: "border-slate-300 text-slate-800 hover:bg-slate-100",
  btnSmDisabled: "border-slate-200 text-slate-300 cursor-not-allowed",
  btnDanger: "px-3 py-1 rounded border border-red-300 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60",

  pillTop: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
  pillOk: "inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200",
  pillInactive: "inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 border border-slate-200",

  // ===== Default warehouse card =====
  defaultCard: "bg-white border border-slate-200 rounded-xl p-4 space-y-2",
  defaultLine: "flex flex-col gap-1 text-sm text-slate-700",
  defaultRow: "flex items-center gap-2",
  defaultIdHint: "text-xs text-slate-500",
  defaultNameStrong: "font-medium",
  defaultMissing: "text-sm text-slate-600",

  // ===== Platform auth card =====
  authCard: "bg-white border-2 border-slate-300 rounded-2xl p-6 space-y-4 shadow-sm",
  authHead: "flex justify-between items-start",
  authTitle: "text-lg font-bold text-slate-900",
  authSub: "text-base text-slate-700 font-medium",
  authSubMeta: "text-slate-500 text-sm ml-2",
  authBody: "text-base text-slate-700 space-y-2",
  authKey: "text-slate-500 mr-2",
  authActions: "mt-3 flex flex-wrap gap-3",
  authBtn: "px-4 py-2 rounded-lg border border-slate-400 text-base text-slate-800 hover:bg-slate-100",
  authStatusLoading: "text-base text-slate-500 font-medium",
  authStatusNone: "px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-base font-medium",
  authStatusManual: "px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-base font-medium border border-amber-300",
  authStatusOAuth: "px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-base font-medium border border-emerald-300",

  readOnlyText: "text-slate-400 text-xs",

  // ===== Inline error =====
  inlineErr: "text-xs text-red-500 mt-1",
};
