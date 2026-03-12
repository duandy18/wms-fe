// src/features/admin/shipping-providers/scheme/workbench/cards/surcharges/CityItemEditor.tsx
//
// 分拆说明：
// - 从 SurchargesCard.tsx 中拆出。
// - 当前只负责单条城市子项编辑器。

import React from "react";
import type { GeoItem } from "../../../../api/geo";
import { UI } from "../../../ui";
import type { SurchargeConfigCityRow } from "../../domain/types";
import type { SurchargesCardProps } from "./types";

type Props = {
  rowClientId: string;
  city: SurchargeConfigCityRow;
  disabled: boolean;
  saving: boolean;
  cityOptions: GeoItem[];
  onUpdateCity: SurchargesCardProps["onUpdateCity"];
  onRemoveCity: SurchargesCardProps["onRemoveCity"];
};

const CityItemEditor: React.FC<Props> = ({
  rowClientId,
  city,
  disabled,
  saving,
  cityOptions,
  onUpdateCity,
  onRemoveCity,
}) => {
  const selectedCode = city.cityCode;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className={UI.tinyHelpText}>城市</div>
          <select
            className={UI.selectBase}
            value={selectedCode}
            disabled={disabled || saving}
            onChange={(e) => {
              const code = String(e.target.value || "");
              const hit = cityOptions.find((x) => String(x.code ?? "") === code);
              onUpdateCity(rowClientId, city.clientId, {
                cityCode: code,
                cityName: hit ? String(hit.name ?? "") : "",
              });
            }}
          >
            <option value="">请选择城市</option>
            {cityOptions.map((opt) => {
              const code = String(opt.code ?? "");
              const name = String(opt.name ?? "");
              return (
                <option key={code} value={code}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <div className={UI.tinyHelpText}>城市加价</div>
          <input
            className={UI.inputBase}
            value={city.fixedAmount}
            disabled={disabled || saving}
            onChange={(e) =>
              onUpdateCity(rowClientId, city.clientId, {
                fixedAmount: e.target.value,
              })
            }
            placeholder="例如 3"
          />
        </div>

        <div className="flex items-end justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={city.active}
              disabled={disabled || saving}
              onChange={(e) =>
                onUpdateCity(rowClientId, city.clientId, {
                  active: e.target.checked,
                })
              }
            />
            启用
          </label>

          <button
            type="button"
            className={UI.btnDangerSm}
            onClick={() => onRemoveCity(rowClientId, city.clientId)}
            disabled={disabled || saving}
          >
            删除城市
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityItemEditor;
