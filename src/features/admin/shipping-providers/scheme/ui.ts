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

  workbenchSyncBar:
    "mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600",

  tabsWrap: `${BaseUI.card} flex flex-wrap gap-2`,
  tabBtn: BaseUI.badgeBtn,
  tabBtnActive: BaseUI.badgeBtnActive,
  tabBtnIdle: BaseUI.badgeBtnIdle,

  // ===== Scheme 子模块：Region Selector =====
  regionSearchInput: "w-full md:w-72 rounded-xl border border-slate-300 px-3 py-2 text-base",
  regionItemBox: "flex items-center gap-2 rounded-xl border px-4 py-3",
  regionItemText: "truncate text-base text-slate-900",
  regionItemTextHit: "truncate text-base font-semibold text-slate-900",
  regionTitle: "text-base font-semibold text-slate-900",
  regionHint: "text-sm text-slate-600",
  regionMeta: "text-sm text-slate-600",

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

  // ===== Surcharges =====
  surchargeEmpty: "text-sm text-slate-600",
  surchargeItemWrap: "space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-3",
  surchargeSummaryText: "text-sm text-slate-700",
  surchargeNameLine: "text-sm text-slate-800",
  surchargeNameStrong: "font-semibold",
  surchargeMetaMono: "ml-2 font-mono text-slate-500",
  surchargeFooterHint: "text-sm text-slate-600",
};
