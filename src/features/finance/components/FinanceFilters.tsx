import type { DateRange } from "../model/dateRange";

type FinanceFiltersProps = {
  range: DateRange;
  onRangeChange: (field: keyof DateRange, value: string) => void;
  onQuickRange: (days: 30 | 90) => void;
  onRefresh: () => void;
  loading: boolean;
  error: string | null;
  showPlatformStore?: boolean;
  platform?: string;
  storeCode?: string;
  onPlatformChange?: (value: string) => void;
  onStoreCodeChange?: (value: string) => void;
};

export function FinanceFilters({
  range,
  onRangeChange,
  onQuickRange,
  onRefresh,
  loading,
  error,
  showPlatformStore = false,
  platform = "",
  storeCode = "",
  onPlatformChange,
  onStoreCodeChange,
}: FinanceFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3 text-xs text-slate-700">
          <div className="text-xs font-semibold text-slate-800">筛选条件</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span>从</span>
              <input
                type="date"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={range.from_date}
                onChange={(e) => onRangeChange("from_date", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>到</span>
              <input
                type="date"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={range.to_date}
                onChange={(e) => onRangeChange("to_date", e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => onQuickRange(30)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              最近 30 天
            </button>
            <button
              type="button"
              onClick={() => onQuickRange(90)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              最近 90 天
            </button>
          </div>

          {showPlatformStore && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="flex items-center gap-1">
                <span>平台</span>
                <input
                  className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="如 PDD"
                  value={platform}
                  onChange={(e) => onPlatformChange?.(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
                <span>店铺编码</span>
                <input
                  className="w-40 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="store_code"
                  value={storeCode}
                  onChange={(e) => onStoreCodeChange?.(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 text-xs">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className={
              "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white " +
              (loading ? "bg-sky-400 opacity-70" : "bg-sky-600 hover:bg-sky-700")
            }
          >
            {loading ? "加载中…" : "刷新"}
          </button>
          {error && (
            <div className="max-w-xs rounded-md border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
