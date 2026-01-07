// src/features/operations/inbound/ui.ts
// Inbound（采购收货页）私有 UI：集中调字体/间距/表格密度，不做全局污染
//
// 当前版本：再大一号（标题/正文/表格/按钮/输入框整体上调一档）
// 目标：站着也能看清、扫表更快、输入更不容易错。

export const InboundUI = {
  // ===== 基础卡片 =====
  card: "bg-white border border-slate-200 rounded-xl",
  cardPad: "p-6", // p-5 -> p-6
  cardGap: "space-y-5", // space-y-4 -> space-y-5

  // ===== 文本 =====
  title: "text-xl font-semibold text-slate-800", // text-lg -> text-xl
  subtitle: "text-lg text-slate-700", // text-base -> text-lg
  quiet: "text-sm text-slate-500", // 12px -> text-sm
  hint: "text-sm text-slate-600",
  danger: "text-sm text-rose-700",

  // ===== 按钮 =====
  btnPrimary:
    "rounded-md bg-emerald-600 px-6 py-3.5 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-60",
  btnSecondary:
    "rounded-md border border-slate-300 bg-white px-6 py-3.5 text-lg text-slate-700 hover:bg-slate-50 disabled:opacity-60",
  btnGhost:
    "rounded-md border border-slate-300 bg-white px-5 py-3 text-base text-slate-700 hover:bg-slate-50 disabled:opacity-60",

  // ===== 输入框 =====
  inputText:
    "w-full rounded-md border border-slate-300 bg-white px-5 py-4 text-xl font-mono " +
    "focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-60",
  inputNumber:
    "w-full rounded-md border border-slate-300 bg-white px-4 py-4 text-xl font-mono text-right " +
    "focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-60",

  // ===== 表格（作业态）=====
  tableWrap: "max-h-80 overflow-y-auto rounded-lg bg-slate-50 border border-slate-100", // 72 -> 80
  table: "min-w-full border-collapse text-lg", // text-base -> text-lg
  thRow: "bg-slate-100 text-slate-800",
  th: "px-4 py-3.5 text-left font-semibold",
  thRight: "px-4 py-3.5 text-right font-semibold",
  thCenter: "px-4 py-3.5 text-center font-semibold",
  tr: "border-t border-slate-100 align-top",
  td: "px-4 py-3.5",
  tdRight: "px-4 py-3.5 text-right font-mono",
  tdCenter: "px-4 py-3.5 text-center",
  rowActive: "bg-sky-50 ring-2 ring-sky-300", // 更明显

  tableInput:
    "w-32 rounded border border-slate-300 px-3 py-2.5 text-right text-lg font-mono bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-60",

  // ===== 状态色（可选）=====
  statusOk: "text-emerald-700",
  statusWarn: "text-amber-700",
  statusErr: "text-rose-700",
  statusIdle: "text-slate-500",
} as const;

// 兼容别名：如果你有的文件在用 inboundUI，就让它指向同一份配置
export const inboundUI = InboundUI;
