// src/features/admin/shipping-providers/scheme/brackets/ui.ts
//
// 录价页（brackets）私有 UI tokens（只影响录价页，不做全局污染）
// 目标：字体大小/表格密度/表格高度统一收口，避免散落 className。

import { UI as SchemeUI } from "../ui";

export const PUI = {
  // 继承 scheme 级 UI（保持风格一致），但只在录价页使用
  ...SchemeUI,

  // 卡片
  card: "rounded-2xl border border-slate-200 bg-white p-5",
  cardSoft: "rounded-2xl border border-slate-200 bg-slate-50 p-5",

  // 标题/说明（录价页偏“操作型”，字号更克制）
  title: "text-base font-semibold text-slate-900",
  subtitle: "mt-1 text-sm text-slate-600",
  hint: "text-xs text-slate-500",

  // ✅ 通用小字说明（替代组件里散落的 text-sm text-slate-600）
  metaText: "text-sm text-slate-600",
  inlineLabel: "text-sm text-slate-600",

  // 主流程表单（稍大一点，便于录入）
  formLabel: "text-xs text-slate-600",
  formSelect: "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm",
  formSelectMono: "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono",
  formInputMono: "rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono",

  // ✅ 主流程按钮（保存/复制）
  primaryBtn:
    "rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100",
  primaryBtnDisabled:
    "rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400",

  // 核对表（更紧凑）
  tableWrap: "mt-3 overflow-auto rounded-xl border border-slate-200",
  tableWrapHeight: "max-h-[520px]", // ✅ 调高度只改这里
  table: "min-w-full border-collapse text-sm",
  thead: "sticky top-0 z-10 bg-white",
  th: "border-b px-3 py-2 text-center text-xs font-mono text-slate-700 bg-white",
  thLeft: "border-b px-3 py-2 text-left text-xs text-slate-500 bg-white",
  tdZone: "px-3 py-3 text-sm font-mono text-slate-900",
  tdCell: "px-2 py-2 align-top",

  // ✅ 表格行/标记/异常提示（收口 QuoteMatrixTable 的散落样式）
  rowCurrentBg: "bg-amber-50",
  zoneCurrentBadge: "ml-2 text-xs text-amber-700",
  cellInvalidText: "text-center text-xs text-red-600",
  cellInnerWrap: "relative flex justify-center",

  // 单元格按钮（核对表里最常调的密度点）
  cellBtnBase: "w-full rounded-xl border px-3 py-2 text-left transition text-sm",
  cellBtnUnset: "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100 cursor-pointer",
  cellBtnManual: "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 cursor-pointer",
  cellBtnSet: "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 cursor-pointer",
  cellBtnDisabled: "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed",

  cellBtnPrimaryTextUnset: "font-semibold text-sky-700",
  cellBtnPrimaryTextManual: "font-semibold text-amber-700",
  cellBtnPrimaryTextSet: "font-mono",

  cellBtnBadgeEnabled:
    "shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50",
  cellBtnBadgeDisabled:
    "shrink-0 rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400",

  cellBtnSubText: "mt-1 text-[11px] text-slate-500",

  // 空态/警告
  warnBox: "mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800",
  infoBox: "mt-2 text-xs text-slate-500",

  // ============================================================
  // ✅ 单元格编辑器（弹层）专用 tokens（避免散落 text-[11px]/rounded-lg）
  // ============================================================
  editorWrap: "w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
  editorHeaderRow: "flex items-start justify-between gap-2",
  editorTitle: "text-xs font-semibold text-slate-800 truncate",
  editorSub: "mt-1 text-[11px] text-slate-500",
  editorSubMono: "font-mono",

  editorBtnRow: "flex items-center gap-1",
  editorBtnPrimary:
    "rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60",
  editorBtnNeutral:
    "rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60",
  editorBtnGhost:
    "shrink-0 rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60",

  editorSectionLabel: "text-[11px] text-slate-600",
  editorSelect: "w-full rounded-lg border border-slate-300 px-2 py-1 text-xs",
  editorInput: "w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono",
  editorInputSm: "w-20 rounded border border-slate-300 px-2 py-1 font-mono",
  editorInputXs: "w-20 rounded border border-slate-300 px-2 py-1 font-mono",
  editorRow: "mt-2 flex items-center gap-2 text-xs",
  editorCol: "mt-2 space-y-2 text-xs",
  editorHintBox: "mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-600",
  editorInlineHint: "text-slate-500",

  // ============================================================
  // ✅ ZoneEntryCard（批量录入）专用 tokens
  // ============================================================
  zoneEntryBtnEdit:
    "rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100",
  zoneEntryBtnNeutral:
    "rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100",
  zoneEntryBtnSave:
    "rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100",
  zoneEntryBtnSaveDisabled:
    "rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-400",

  zoneEntryTableWrap: "overflow-x-auto",
  zoneEntryTable: "min-w-full border-collapse",
  zoneEntryTh: "border-b px-3 py-2 text-left text-xs text-slate-500",
  zoneEntryTr: "border-b",
  zoneEntryTd: "px-3 py-3",
  zoneEntryTdSegment: "px-3 py-3 text-sm font-mono text-slate-800",
  zoneEntryTdStatus: "px-3 py-3 text-xs",

  zoneEntryInput: "w-32 rounded border border-slate-300 bg-white px-2 py-1 text-sm font-mono",
  zoneEntryInputDisabled: "w-32 rounded border border-slate-200 bg-slate-100 px-2 py-1 text-sm font-mono text-slate-500",

  zoneEntryInvalidBadge: "ml-2 text-xs text-red-600",
  zoneEntryInvalidText: "text-xs text-red-600",

  zoneEntryStatusMuted: "text-slate-500",
  zoneEntryStatusWarn: "text-amber-700",
  zoneEntryStatusBad: "text-red-600",
  zoneEntryStatusOk: "text-emerald-700",

  // ============================================================
  // ✅ PricingRuleEditor（重量分段）专用 tokens
  // ============================================================
  segmentsCard: "rounded-2xl border border-slate-200 bg-white p-4",
  segmentsTitle: "text-sm font-semibold text-slate-900",
  segmentsHint: "mt-1 text-xs text-slate-500",
  segmentsList: "mt-4 space-y-2",
  segmentsRow: "flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2",
  segmentsRowLabel: "min-w-[110px] text-xs font-mono text-slate-600",
  segmentsInputEditable: "w-28 rounded border border-slate-300 bg-white px-2 py-1 text-sm font-mono",
  segmentsInputLocked: "w-28 rounded border border-slate-200 bg-slate-100 px-2 py-1 text-sm font-mono text-slate-500",
  segmentsRangeSep: "text-slate-400",
  segmentsKgSuffix: "text-xs text-slate-400",
  segmentsDeleteBtn: "ml-auto text-xs text-red-600 hover:underline disabled:opacity-60",
  segmentsLockedText: "ml-auto text-xs text-slate-400",
  segmentsAddBtn:
    "mt-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60",

  // ============================================================
  // ✅ ZonePriceTable（旧版小表）专用 tokens
  // ============================================================
  zonePriceCard: "rounded-2xl border border-slate-200 bg-white p-4",
  zonePriceTitle: "text-sm font-semibold mb-3",
  zonePriceTableWrap: "overflow-x-auto",
  zonePriceTable: "min-w-full border-collapse",
  zonePriceThLeft: "border-b px-3 py-2 text-left text-xs text-slate-500",
  zonePriceThCenter: "border-b px-3 py-2 text-center text-xs font-mono",
  zonePriceTdLabel: "border-b px-3 py-3 text-sm text-slate-600",
  zonePriceTdCell: "border-b px-3 py-2 text-center",
  zonePriceSelect: "rounded border border-slate-300 px-2 py-1 text-sm",
  zonePriceInputsRow: "flex items-center justify-center gap-2 text-sm",
  zonePriceInputXs: "w-16 rounded border border-slate-300 px-1 py-1 font-mono",
  zonePriceInputSm: "w-20 rounded border border-slate-300 px-2 py-1 text-sm font-mono",
  zonePriceFootHint: "mt-3 text-xs text-slate-500",
};

export default PUI;
