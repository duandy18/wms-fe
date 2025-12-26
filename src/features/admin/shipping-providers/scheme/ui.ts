// src/features/admin/shipping-providers/scheme/ui.ts
//
// Scheme 子模块私有 UI tokens（只影响运价工作台，不做全局污染）
// 目标：集中控制“字体大小/密度”，页面组件不再散落 text-sm/text-base 等细节。

import { UI as BaseUI } from "../ui";

export const UI = {
  ...BaseUI,

  // ===== Common (scheme-scope) =====
  cardTight: "rounded-2xl border border-slate-200 bg-white p-5",
  cardSoft: "rounded-2xl border border-slate-200 bg-slate-50 p-5",

  panelTitle: "text-base font-semibold text-slate-900",
  panelHint: "text-sm text-slate-600",
  sectionTitle: "text-sm font-semibold text-slate-800",

  headerRow: "flex flex-wrap items-center justify-between gap-3",
  headerMeta: "text-sm text-slate-600",
  headerMetaMono: "text-sm text-slate-600 font-mono",

  selectBase: "rounded-xl border border-slate-300 px-3 py-2 text-base",
  inputBase: "mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base",
  inputMono: "mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono",
  textareaMono: "mt-1 h-32 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono",

  emptyText: "text-sm text-slate-600",
  helpText: "text-sm text-slate-600",
  tinyHelpText: "text-xs text-slate-500",

  rowTight: "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2",
  rowMonoText: "text-sm text-slate-700 font-mono",
  rowIdTiny: "ml-2 text-xs text-slate-400",

  btnNeutralSm:
    "inline-flex items-center rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60",
  btnNeutral:
    "inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60",

  btnDangerSm:
    "inline-flex items-center rounded-xl border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60",
  btnDanger:
    "inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60",

  statusOn: "font-semibold text-emerald-700",
  statusOff: "font-semibold text-slate-500",

  // ===== Scheme 子模块：Workbench Header / Tabs =====
  workbenchTitle: "text-lg font-semibold text-slate-900",
  workbenchSubtitle: "mt-1 text-sm text-slate-600",
  workbenchHeaderActions: "flex items-center gap-2",
  workbenchBackBtn: BaseUI.btnSecondary,

  workbenchSyncBar: "mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600",

  tabsWrap: `${BaseUI.card} flex flex-wrap gap-2`,
  tabBtn: BaseUI.badgeBtn,
  tabBtnActive: BaseUI.badgeBtnActive,
  tabBtnIdle: BaseUI.badgeBtnIdle,

  // ===== Scheme 子模块：Region Selector =====
  regionSearchInput: "w-full md:w-72 rounded-xl border border-slate-300 px-3 py-2 text-base",

  // item box / text
  regionItemBox: "flex items-center gap-2 rounded-xl border px-4 py-3",
  regionItemText: "truncate text-base text-slate-900",
  regionItemTextHit: "truncate text-base font-semibold text-slate-900",

  // header
  regionTitle: "text-base font-semibold text-slate-900",
  regionHint: "text-sm text-slate-600",
  regionMeta: "text-sm text-slate-600",

  // ✅ 新增：占用提示 / 禁用态（模块私有）
  // - 用于：已被其他 Zone 占用的省份展示 “已占用”
  regionItemBadge: "ml-auto text-xs text-slate-500",
  // - 禁用态透明度（由组件决定何时禁用）
  regionItemDisabledOpacity: "opacity-70",

  // ===== Scheme 子模块：Zones Panel =====
  zonePageTitle: "text-base font-semibold text-slate-900",
  zonePageHint: "text-sm text-slate-600",
  zoneSectionTitle: "text-sm font-semibold text-slate-800",
  zoneLabel: BaseUI.label,
  zoneInput: "mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base",
  zoneCommitBtn:
    "rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-60",

  // ===== Scheme 子模块：Zones List / Row =====
  zoneListEmpty: "text-sm text-slate-600",
  zoneTableHeadWrap: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3",
  zoneTableHeadRow: "grid grid-cols-12 items-center gap-2 text-sm font-semibold text-slate-700",
  zoneRowWrap: "rounded-2xl border p-4",
  zoneRowSelected: "border-sky-300 bg-sky-50",
  zoneRowNormal: "border-slate-200 bg-white",
  zoneIndexBadge:
    "inline-flex min-w-[2.25rem] items-center justify-center rounded-xl bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700",
  zoneIdMono: "font-mono text-sm text-slate-700",
  zoneStatusPill: "inline-flex items-center rounded-xl px-3 py-1 text-sm font-semibold",
  zoneStatusActive: "bg-emerald-50 text-emerald-700",
  zoneStatusInactive: "bg-red-50 text-red-700",
  zoneToggleBtnBase: "inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-60",
  zoneToggleBtnActive: "border border-red-200 text-red-700 hover:bg-red-50",
  zoneToggleBtnInactive: "border border-emerald-200 text-emerald-700 hover:bg-emerald-50",
  zoneMetaLine: "mt-2 text-sm text-slate-500",

  // ===== Members =====
  memberEmpty: "text-sm text-slate-600",
  memberRowWrap: "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2",
  memberRowText: "text-sm text-slate-700 font-mono",
  memberRowId: "ml-2 text-xs text-slate-400",

  // ===== Brackets =====
  bracketEmpty: "text-sm text-slate-600",
  bracketSummary: "px-1 text-sm text-slate-600",
  bracketListWrap: "space-y-2",
  bracketRowWrap: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2",
  bracketRowText: "text-sm text-slate-700",
  bracketActive: "font-semibold text-emerald-700",
  bracketInactive: "font-semibold text-slate-500",

  // ===== Surcharges (基础既有) =====
  surchargeEmpty: "text-sm text-slate-600",
  surchargeItemWrap: "space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-3",
  surchargeSummaryText: "text-sm text-slate-700",
  surchargeNameLine: "text-sm text-slate-800",
  surchargeNameStrong: "font-semibold",
  surchargeMetaMono: "ml-2 font-mono text-slate-500",
  surchargeFooterHint: "text-sm text-slate-600",

  // ============================================================
  // ✅ 新增：Overview（SchemeOverviewPanel）tokens
  // ============================================================
  overviewWrap: "space-y-4",
  overviewGrid: "mt-4 grid grid-cols-1 gap-3 md:grid-cols-5",
  overviewStatCard: "rounded-xl border border-slate-200 bg-slate-50 p-3",
  overviewStatLabel: "text-xs text-slate-500",
  overviewStatValue: "mt-1 text-lg font-semibold font-mono text-slate-900",
  overviewStatSub: "mt-1 text-xs text-slate-500",
  overviewFooterRow: "mt-4 flex flex-wrap items-center justify-between gap-3",
  overviewFooterHint: "text-xs text-slate-500",
  overviewExportBtn:
    "rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100",

  // ============================================================
  // ✅ 新增：Preview（QuotePreviewForm / QuotePreviewResult）tokens
  // ============================================================
  previewCard: "rounded-2xl border border-slate-200 bg-slate-50 p-4",
  previewGrid3: "mt-3 grid grid-cols-1 gap-3 md:grid-cols-3",
  previewGrid4: "mt-3 grid grid-cols-1 gap-3 md:grid-cols-4",
  previewFieldCol: "flex flex-col",
  previewLabel: "text-sm text-slate-600",
  previewSelect: "mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base",
  previewInput: "mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base",
  previewInputMono: "mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono",
  previewHint: "mt-1 text-xs text-slate-500",
  previewDetails: "mt-3 rounded-2xl border border-slate-200 bg-white p-3",
  previewDetailsSummary: "cursor-pointer text-sm font-semibold text-slate-800",
  previewDimsWarning: "mt-2 text-sm text-amber-700",

  previewResultCard: "rounded-2xl border border-slate-200 bg-white p-5",
  previewResultBody: "mt-3 space-y-3",
  previewResultGrid4: "grid grid-cols-1 gap-3 md:grid-cols-4",
  previewResultStatCard: "rounded-2xl border border-slate-200 bg-slate-50 p-4",
  previewResultStatLabel: "text-sm text-slate-600",
  previewResultStatValue: "mt-1 text-base font-semibold text-slate-900 font-mono",
  previewResultStatSub: "mt-1 text-sm text-slate-500 font-mono",
  previewResultTinyMono: "mt-1 text-xs text-slate-600 font-mono",
  previewResultMono: "font-mono",
  previewResultWeightLine: "mt-2 text-sm text-slate-700",
  previewResultSummaryCard: "rounded-2xl border border-slate-200 bg-white p-4",
  previewResultSummaryMono: "mt-2 text-xs text-slate-700 font-mono",
  previewResultSummaryTotalRow: "mt-3 border-t border-slate-200 pt-3 text-sm text-slate-800",
  previewResultSummaryTotalValue: "ml-2 font-mono text-base font-semibold",
  previewResultFootHint: "text-xs text-slate-500",

  // ============================================================
  // ✅ 新增：Surcharge 列表/创建分卡 tokens（SurchargeList / create/*）
  // ============================================================
  surchargeTableWrap: "overflow-x-auto",
  surchargeTable: "min-w-full border-collapse",
  surchargeTheadRow: "border-b border-slate-200 text-left text-sm font-semibold text-slate-700",
  surchargeThIndex: "px-3 py-2 w-[72px]",
  surchargeTh: "px-3 py-2",
  surchargeThAmount: "px-3 py-2 w-[160px]",
  surchargeThState: "px-3 py-2 w-[120px]",
  surchargeThOps: "px-3 py-2 w-[220px]",

  surchargeTr: "border-b border-slate-100 text-sm",
  surchargeTdIndex: "px-3 py-2 text-slate-700 font-mono",
  surchargeTd: "px-3 py-2",
  surchargeTdAmount: "px-3 py-2 font-mono text-slate-900",

  surchargeDestRow: "flex items-center gap-2",
  surchargeDestPillBase: "inline-flex items-center rounded-xl px-3 py-1 text-sm font-semibold",
  surchargeDestPillProvince: "bg-slate-100 text-slate-700",
  surchargeDestPillCity: "bg-sky-50 text-sky-700",
  surchargeDestPillOther: "bg-amber-50 text-amber-700",
  surchargeDestLabel: "text-slate-900",
  surchargeRuleName: "mt-1 text-xs text-slate-500",

  surchargeStatusPillBase: "inline-flex items-center rounded-xl px-3 py-1 text-sm font-semibold",
  surchargeStatusOn: "bg-emerald-50 text-emerald-700",
  surchargeStatusOff: "bg-slate-100 text-slate-600",

  surchargeOpsRow: "flex gap-2",
  surchargeListHint: "mt-2 text-sm text-slate-600",

  // create 分卡通用（你拆出来的 ProvincesSectionCard/CitiesSectionCard/ScopeTableSectionCard/SectionHeader）
  surchargeSectionCard: "rounded-2xl border border-slate-200 bg-white p-4",
  surchargeSectionBody: "mt-3",

  // scope table（SelectedScopePriceTable）
  surchargeScopeCard: "rounded-2xl border border-slate-200 bg-white p-4",
  surchargeScopeHeadRow: "flex items-start justify-between gap-3",
  surchargeScopeTitle: "text-sm font-semibold text-slate-800",
  surchargeScopeHint: "mt-1 text-sm text-slate-600",
  surchargeScopeMeta: "text-sm text-slate-600",
  surchargeScopeEmpty: "mt-3 text-sm text-slate-600",
  surchargeScopeTableArea: "mt-3 overflow-x-auto",
  surchargeScopeTable: "min-w-full border-collapse",
  surchargeScopeTheadRow: "border-b border-slate-200 text-left text-sm font-semibold text-slate-700",
  surchargeScopeThIndex: "px-3 py-2 w-[72px]",
  surchargeScopeThType: "px-3 py-2 w-[110px]",
  surchargeScopeTh: "px-3 py-2",
  surchargeScopeThAmount: "px-3 py-2 w-[220px]",
  surchargeScopeTr: "border-b border-slate-100 text-sm",
  surchargeScopeTd: "px-3 py-2",
  surchargeScopeTdText: "px-3 py-2 text-slate-900",
  surchargeScopeFootHint: "mt-2 text-xs text-slate-500",

  // scope card header/actions（ScopeTableSectionCard/SectionHeader 复用）
  surchargeScopeHeaderRow: "flex items-start justify-between gap-3",
  surchargeScopeActionsRow: "flex items-center gap-2",
  surchargeValidationError: "mt-2 text-sm text-red-700",

  // bulky card
  surchargeBulkyHeaderRow: "flex items-start justify-between gap-3",
  surchargeBulkyGrid: "mt-4 grid grid-cols-1 gap-4 md:grid-cols-6",
  surchargeBulkyToggleCol: "flex items-center gap-3 md:col-span-2",
  surchargeBulkyToggleText: "text-sm text-slate-700",
  surchargeBulkyAmountCol: "flex flex-col md:col-span-2",
  surchargeBulkyDisabledHint: "mt-2 text-sm text-slate-500",

  // city picker（CityPicker.tsx）
  cityPickerHeaderRow: "flex items-start justify-between gap-4",
  cityPickerToolbar: "mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
  cityPickerToolbarHint: "text-sm text-slate-600",
  cityPickerProvList: "mt-4 space-y-3",
  cityPickerProvCardBase: "rounded-2xl border p-4",
  cityPickerProvCardOn: "border-emerald-300 bg-emerald-50",
  cityPickerProvCardOff: "border-slate-200 bg-white",
  cityPickerProvHeadRow: "flex items-center justify-between gap-3",
  cityPickerProvLabel: "inline-flex items-center gap-3",
  cityPickerProvName: "text-base font-semibold text-slate-900",
  cityPickerProvCount: "text-sm text-slate-500",
  cityPickerProvStatusOn: "text-sm text-slate-600",
  cityPickerProvStatusOff: "text-sm text-slate-500",
  cityPickerCityGrid: "mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6",
  cityPickerCityHover: "hover:bg-slate-50",
};

export default UI;
