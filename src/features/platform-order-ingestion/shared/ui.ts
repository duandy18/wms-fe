export const poiUi = {
  page: "space-y-6 p-4",
  hero: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
  heroTitle: "mt-2 text-2xl font-semibold text-slate-900",
  heroDesc: "mt-2 max-w-4xl text-sm leading-6 text-slate-600",
  grid2: "grid grid-cols-1 gap-4 lg:grid-cols-2",
  grid3: "grid grid-cols-1 gap-4 lg:grid-cols-3",
  card: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
  cardSoft: "rounded-2xl border border-slate-200 bg-slate-50 p-5",
  cardTitle: "text-base font-semibold text-slate-900",
  cardDesc: "mt-1 text-sm leading-6 text-slate-600",
  sectionTitle: "text-lg font-semibold text-slate-900",
  muted: "text-sm text-slate-500",
  list: "mt-4 space-y-2 text-sm text-slate-700",
  listItem: "flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2",
  pill: "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700",
  primaryLink:
    "inline-flex items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800",
  secondaryLink:
    "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
  button:
    "inline-flex items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
  secondaryButton:
    "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
  dangerButton:
    "inline-flex items-center justify-center rounded-xl border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:border-red-200 disabled:bg-red-100 disabled:text-red-300",
  input:
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500",
  select:
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500",
  checkbox:
    "h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500",
  label: "text-xs font-medium text-slate-500",
  value: "mt-1 text-sm text-slate-900",
  tableWrap: "overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm",
  table: "min-w-full border-collapse text-sm",
  th: "whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-600",
  td: "border-b border-slate-100 px-3 py-2 text-sm text-slate-800",
  error: "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700",
  success: "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700",
};

export type PlatformOrderIngestionPlatform = "pdd" | "taobao" | "jd";

export const platformOrderIngestionLabels: Record<
  PlatformOrderIngestionPlatform,
  string
> = {
  pdd: "拼多多",
  taobao: "淘宝",
  jd: "京东",
};
