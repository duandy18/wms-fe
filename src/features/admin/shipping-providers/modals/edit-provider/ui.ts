// src/features/admin/shipping-providers/modals/edit-provider/ui.ts
//
// EditProviderModal 私有 UI tokens（不污染全局）
// 目标：ModalFrame / ProviderForm / ContactsTable / ContactCreateForm 密度统一收口。
// 注意：这里只管“弹窗体系”，不改 shipping-providers/scheme 的 UI。

export const MUI = {
  // overlay & container
  overlay: "fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-6",
  frame: "w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl",

  // header
  headerRow: "flex items-start justify-between gap-3",
  title: "text-lg font-semibold text-slate-900",
  subtitle: "mt-1 text-sm text-slate-600",
  footerRow: "mt-5 flex justify-end",

  // buttons
  btnClose:
    "rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60",

  // error
  errorBox: "mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",

  // content spacing
  body: "mt-4",
  sectionGap: "mt-6",

  // provider form
  providerGrid: "grid grid-cols-1 gap-4 md:grid-cols-4",
  providerNameCol: "md:col-span-2",
  providerFooterRow: "flex items-end gap-3 md:col-span-4",
  checkboxRow: "flex items-center gap-2 text-sm text-slate-700",

  // contact block
  contactsCard: "mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4",
  contactsTitle: "text-sm font-semibold text-slate-900",

  // contact create form
  contactCreateGrid: "mt-3 grid grid-cols-1 gap-3 md:grid-cols-6",
  contactNameCol: "md:col-span-2",
  contactFooterRow: "flex items-end gap-2 md:col-span-6",

  // inputs (modal scope)
  label: "text-xs text-slate-600",
  input: "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm",
  inputMono: "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono",
  select: "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm",

  // contact table
  tableWrap: "mt-4 overflow-auto rounded-xl border border-slate-200 bg-white",
  table: "min-w-full text-sm",
  thead: "bg-slate-50",
  theadTr: "border-b",
  th: "px-3 py-2 text-left",
  tr: "border-b",
  td: "px-3 py-2",
  tdMono: "px-3 py-2 font-mono",
  tdRight: "px-3 py-2 text-right",
  emptyRow: "px-3 py-6 text-center text-sm text-slate-500",

  actionsRow: "flex justify-end gap-2",
  btnXs:
    "rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60",
  btnDangerXs:
    "rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60",
  btnSuccessXs:
    "rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60",
};
