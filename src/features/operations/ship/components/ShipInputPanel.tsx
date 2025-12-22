// src/features/operations/ship/components/ShipInputPanel.tsx

import React from "react";
import HidScalePanel from "../HidScalePanel";
import { UI } from "../ui";

type Props = {
  orderRef: string;
  onOrderRefChange: (v: string) => void;

  weightKg: string;
  onWeightChange: (v: string) => void;

  packagingWeightKg: string;
  onPackagingWeightChange: (v: string) => void;

  province: string;
  city: string;
  district: string;
  onProvinceChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onDistrictChange: (v: string) => void;

  loadingCalc: boolean;
  onCalc: () => void;
};

export const ShipInputPanel: React.FC<Props> = ({
  orderRef,
  onOrderRefChange,
  weightKg,
  onWeightChange,
  packagingWeightKg,
  onPackagingWeightChange,
  province,
  city,
  district,
  onProvinceChange,
  onCityChange,
  onDistrictChange,
  loadingCalc,
  onCalc,
}) => {
  return (
    <section className={UI.card}>
      <h2 className={UI.h2}>订单 / 重量</h2>

      <div className="mt-3 space-y-3">
        <div className="flex flex-col">
          <label className={UI.label}>订单号 / 平台单号</label>
          <input
            className={UI.input}
            placeholder="ORD:PDD:1:EXT123"
            value={orderRef}
            onChange={(e) => onOrderRefChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className={UI.label}>包裹毛重(kg)</label>
            <input
              className={UI.inputMono}
              value={weightKg}
              onChange={(e) => onWeightChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className={UI.label}>包材重量(kg)</label>
            <input
              className={UI.inputMono}
              value={packagingWeightKg}
              onChange={(e) => onPackagingWeightChange(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className={UI.label}>省份</label>
            <input
              className={UI.input}
              value={province}
              onChange={(e) => onProvinceChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className={UI.label}>城市 / 区县</label>
            <div className="mt-1 flex gap-2">
              <input
                className="w-1/2 rounded-xl border border-slate-300 px-3 py-2 text-base"
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
              />
              <input
                className="w-1/2 rounded-xl border border-slate-300 px-3 py-2 text-base"
                value={district}
                onChange={(e) => onDistrictChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          className={UI.btnPrimary}
          disabled={loadingCalc}
          onClick={onCalc}
        >
          {loadingCalc ? "计算中…" : "计算运费"}
        </button>

        <HidScalePanel onWeightLocked={(w) => onWeightChange(w.toFixed(3))} />

        <p className="text-sm text-slate-500">
          · 修改重量或地址将使旧报价失效，需要重新算价。<br />
          · 电子称锁重后会自动回填重量。
        </p>
      </div>
    </section>
  );
};
