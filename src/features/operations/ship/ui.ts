// src/features/operations/ship/ui.ts
//
// Ship Cockpit 模块私有 UI tokens（不污染全局）
// 目标：让作业台页面的字体/间距“可控、可维护”。

export const UI = {
  page: "space-y-4 p-6",

  card: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
  h2: "text-lg font-semibold text-slate-800",
  label: "text-sm text-slate-600",
  helper: "text-sm text-slate-500",

  input: "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-base",
  inputMono:
    "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-base font-mono",
  btnPrimary:
    "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-base font-semibold text-white shadow-sm disabled:opacity-70",
  btnSecondary:
    "inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60",

  errorBox:
    "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",

  pill:
    "inline-flex items-center rounded-full border px-3 py-2 text-left transition",
  pillActive: "border-sky-500 bg-sky-50",
  pillIdle: "border-slate-200 hover:border-sky-300 hover:bg-slate-50",

  badgeRec:
    "mt-1 rounded-full bg-emerald-100 px-2 py-[2px] text-sm font-semibold text-emerald-700",
};
