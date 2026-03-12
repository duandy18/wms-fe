// src/features/admin/shipping-providers/scheme/workbench/cards/surcharges/CitySurchargeCardEditor.tsx
//
// 分拆说明：
// - 从 SurchargesCard.tsx 中拆出。
// - 当前只负责单张城市附加费卡。

import React from "react";
import { fetchGeoCities, type GeoItem } from "../../../../api/geo";
import { UI } from "../../../ui";
import SuccessBar from "../../SuccessBar";
import { useFlashOkBar } from "../../useFlashOkBar";
import type { SurchargeRuleRow } from "../../domain/types";
import type { SurchargesCardProps } from "./types";
import CityItemEditor from "./CityItemEditor";

type Props = {
  row: SurchargeRuleRow;
  disabled: boolean;
  saving: boolean;
  errorMessage: string | null;
  onSaveRow: (clientId: string) => Promise<boolean>;
  onUpdateRow: SurchargesCardProps["onUpdateRow"];
  onRemoveRow: SurchargesCardProps["onRemoveRow"];
  onAddCityToRow: SurchargesCardProps["onAddCityToRow"];
  onUpdateCity: SurchargesCardProps["onUpdateCity"];
  onRemoveCity: SurchargesCardProps["onRemoveCity"];
};

const CitySurchargeCardEditor: React.FC<Props> = ({
  row,
  disabled,
  saving,
  errorMessage,
  onSaveRow,
  onUpdateRow,
  onRemoveRow,
  onAddCityToRow,
  onUpdateCity,
  onRemoveCity,
}) => {
  const [cityOptions, setCityOptions] = React.useState<GeoItem[]>([]);
  const [cityLoading, setCityLoading] = React.useState(false);
  const { okMsg, flashOk, clearOk } = useFlashOkBar();

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!row.provinceCode) {
        setCityOptions([]);
        return;
      }

      setCityLoading(true);
      try {
        const rows = await fetchGeoCities(row.provinceCode);
        if (cancelled) return;
        setCityOptions(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setCityOptions([]);
      } finally {
        if (!cancelled) setCityLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [row.provinceCode]);

  const handleSaveRow = React.useCallback(async () => {
    const ok = await onSaveRow(row.clientId);
    if (ok) {
      flashOk(`${row.provinceName || row.provinceCode || "当前省份"}城市附加费已保存。`);
    }
  }, [flashOk, onSaveRow, row.clientId, row.provinceCode, row.provinceName]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
            省份：{row.provinceName || row.provinceCode || "未选择"}
          </div>

          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
            模式：指定城市收费
          </div>

          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={row.active}
              disabled={disabled || saving}
              onChange={(e) =>
                onUpdateRow(row.clientId, {
                  active: e.target.checked,
                })
              }
            />
            启用
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={UI.btnPrimaryGreen}
            onClick={() => void handleSaveRow()}
            disabled={disabled || saving}
          >
            {saving ? "保存中…" : "保存"}
          </button>
          <button
            type="button"
            className={UI.btnDangerSm}
            onClick={() => onRemoveRow(row.clientId)}
            disabled={disabled || saving}
          >
            删除配置
          </button>
        </div>
      </div>

      <div className="mt-3">
        <SuccessBar msg={okMsg} onClose={clearOk} />
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-3 text-xs text-slate-500">
        该卡表示“指定城市收费”，同一省内可挂多个城市子项。
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-800">城市子配置</div>
            <div className="mt-1 text-xs text-slate-500">
              每个城市单独设置加价；当前省级固定加价恒为 0。允许先建空容器，后续再慢慢补城市。
            </div>
          </div>
          <div className="flex items-center gap-3">
            {cityLoading ? <div className="text-xs text-slate-500">加载中…</div> : null}
            <button
              type="button"
              className={UI.btnNeutralSm}
              onClick={() => onAddCityToRow(row.clientId)}
              disabled={disabled || saving || !row.provinceCode}
            >
              新增城市
            </button>
          </div>
        </div>

        {row.cities.length === 0 ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            当前还没有城市子配置。可以先保存这张空容器卡，后续再补城市。
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {row.cities.map((city) => (
              <CityItemEditor
                key={city.clientId}
                rowClientId={row.clientId}
                city={city}
                disabled={disabled}
                saving={saving}
                cityOptions={cityOptions}
                onUpdateCity={onUpdateCity}
                onRemoveCity={onRemoveCity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySurchargeCardEditor;
