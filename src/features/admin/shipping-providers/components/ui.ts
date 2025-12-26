// src/features/admin/shipping-providers/components/ui.ts
//
// shipping-providers/components 子模块私有 UI tokens（不污染全局）
// 目标：SchemesPanel 等组件的表格/表单/提示卡密度统一收口。
// 说明：后续可合并进 ../ui.ts（需要你提供该文件完整内容）。

export const CUI = {
  // header
  headRow: "flex items-center justify-between gap-3",
  title: "text-slate-900 font-semibold",
  providerHint: "text-sm text-slate-600",
  providerNone: "text-sm text-slate-500",
  mono: "font-mono",

  // layout helpers
  stack: "space-y-3",
  row: "flex items-center gap-3",
  rowBetween: "flex items-center justify-between gap-3",

  // empty hint
  emptyCard: "rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600",

  // create card
  subCard: "rounded-2xl border border-slate-200 bg-slate-50 p-4",
  subTitle: "text-sm font-semibold text-slate-800",
  grid5: "mt-3 grid grid-cols-1 gap-3 md:grid-cols-5",
  fieldCol: "flex flex-col",
  label: "text-sm text-slate-600",
  input: "mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base",
  inputMono: "mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono",
  select: "mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base",
  createBtnCol: "flex items-end",

  // list header
  listHead: "flex flex-wrap items-center justify-between gap-3",
  listMeta: "text-sm text-slate-600",
  listMetaMuted: "ml-2 text-xs text-slate-500",
  checkRow: "inline-flex items-center gap-2 text-sm text-slate-600",
  checkBox: "h-4 w-4 rounded border-slate-300",
  listActionsRow: "flex items-center gap-3",

  // table
  tableWrap: "overflow-x-auto rounded-2xl border border-slate-200",
  table: "min-w-full text-base",
  thead: "bg-slate-50 border-b border-slate-200",
  th: "px-4 py-3 text-left text-sm font-semibold text-slate-600",
  tr: "border-b border-slate-100 hover:bg-slate-50",
  td: "px-4 py-3",
  tdMono: "px-4 py-3 font-mono",
  tdMonoSm: "px-4 py-3 font-mono text-sm",
  emptyRow: "px-4 py-10 text-center text-slate-400",

  // status pill
  statusPill: "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
  statusOn: "bg-emerald-100 text-emerald-800",
  statusOff: "bg-slate-200 text-slate-700",

  // workbench button (表格内)
  btnWorkbench:
    "inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100",
};
