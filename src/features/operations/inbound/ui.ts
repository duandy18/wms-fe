// src/features/operations/inbound/ui.ts
// Inbound（采购收货页）私有 UI：集中调字体/间距/表格密度，不做全局污染

export const InboundUI = {
  // ===== 文字层级 =====
  title: "text-base font-semibold text-slate-800",
  subtitle: "text-sm text-slate-700",
  quiet: "text-[11px] text-slate-500",
  hint: "text-[12px] text-slate-600",
  danger: "text-[11px] text-rose-700",

  // ===== 卡片 =====
  card: "bg-white border border-slate-200 rounded-xl",
  cardPad: "p-5",
  cardGap: "space-y-4",

  // ===== 按钮 =====
  btnPrimary:
    "rounded-md bg-emerald-600 px-5 py-3 text-base font-medium text-white disabled:opacity-60",
  btnSecondary:
    "rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 hover:bg-slate-50 disabled:opacity-60",
  btnGhost:
    "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60",

  // ===== 输入框 =====
  inputText:
    "w-full rounded-md border border-slate-300 bg-white px-4 py-4 text-base font-mono focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-60",
  inputNumber:
    "w-full rounded-md border border-slate-300 bg-white px-3 py-4 text-base font-mono text-right focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-60",

  // ===== 表格（作业态）=====
  tableWrap: "max-h-72 overflow-y-auto rounded-lg bg-slate-50 border border-slate-100",
  table: "min-w-full border-collapse text-[14px]",
  thRow: "bg-slate-100 text-slate-600",
  th: "px-3 py-3 text-left",
  thRight: "px-3 py-3 text-right",
  thCenter: "px-3 py-3 text-center",
  tr: "border-t border-slate-100 align-top",
  td: "px-3 py-3",
  tdRight: "px-3 py-3 text-right font-mono",
  tdCenter: "px-3 py-3 text-center",
  rowActive: "bg-sky-50 ring-1 ring-sky-300",

  // ===== 表格输入框 =====
  tableInput:
    "w-28 rounded border border-slate-300 px-2 py-2 text-right font-mono bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-60",
} as const;
