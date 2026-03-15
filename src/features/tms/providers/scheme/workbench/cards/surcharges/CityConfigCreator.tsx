// src/features/tms/providers/scheme/workbench/cards/surcharges/CityConfigCreator.tsx
//
// 分拆说明：
// - 从 SurchargesCard.tsx 中拆出。
// - 当前只负责“城市附加费容器创建器”。

import React from "react";
import type { GeoItem } from "../../../../api/geo";
import { UI } from "../../../ui";
import type { ProvinceSelection } from "./types";
import { filterOptions } from "./utils";

type Props = {
  disabled: boolean;
  saving: boolean;
  options: GeoItem[];
  existingProvinceCodes: Set<string>;
  onConfirm: (item: ProvinceSelection) => Promise<boolean>;
};

const CityConfigCreator: React.FC<Props> = ({
  disabled,
  saving,
  options,
  existingProvinceCodes,
  onConfirm,
}) => {
  const [keyword, setKeyword] = React.useState("");
  const [selected, setSelected] = React.useState<ProvinceSelection | null>(null);

  const availableOptions = React.useMemo(() => {
    return filterOptions(
      options.filter((opt) => !existingProvinceCodes.has(String(opt.code ?? ""))),
      keyword,
    );
  }, [existingProvinceCodes, keyword, options]);

  const handleConfirm = React.useCallback(async () => {
    if (!selected) return;
    const ok = await onConfirm(selected);
    if (ok) {
      setSelected(null);
      setKeyword("");
    }
  }, [onConfirm, selected]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800">新增城市附加费</div>
          <div className="mt-1 text-xs text-slate-500">
            先选择一个省，再创建“指定城市收费”容器。创建完成后，再在该卡里逐条维护城市。
          </div>
        </div>

        <button
          type="button"
          className={UI.btnPrimaryGreen}
          onClick={() => void handleConfirm()}
          disabled={disabled || saving || !selected}
        >
          创建城市配置
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className={UI.tinyHelpText}>候选省份</div>
          <input
            className={`${UI.inputBase} mt-2`}
            value={keyword}
            disabled={disabled || saving}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="输入省份名称或编码搜索"
          />

          <div className="mt-3 max-h-64 space-y-2 overflow-auto">
            {availableOptions.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                当前没有可新增城市配置的省份。
              </div>
            ) : (
              availableOptions.map((opt) => {
                const code = String(opt.code ?? "");
                const name = String(opt.name ?? "");
                const checked = selected?.provinceCode === code;

                return (
                  <button
                    key={code}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                      checked
                        ? "border-amber-300 bg-amber-50 text-amber-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    disabled={disabled || saving}
                    onClick={() =>
                      setSelected({
                        provinceCode: code,
                        provinceName: name,
                      })
                    }
                  >
                    <span className="truncate">{name}</span>
                    <span className="ml-3 shrink-0 text-xs">
                      {checked ? "已选择" : "选择"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className={UI.tinyHelpText}>待创建城市配置</div>
          <div className="mt-3 min-h-[120px]">
            {!selected ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                还没有选择省份。
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                <div className="text-sm font-semibold text-amber-900">
                  {selected.provinceName || selected.provinceCode}
                </div>
                <div className="mt-1 text-xs text-amber-800">
                  创建后会生成一张“指定城市收费”卡，省级固定加价保持为 0。
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityConfigCreator;
