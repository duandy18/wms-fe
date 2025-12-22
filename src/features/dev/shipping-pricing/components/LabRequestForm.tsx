// src/features/dev/shipping-pricing/components/LabRequestForm.tsx

import React from "react";

export const LabRequestForm: React.FC<{
  loading: boolean;
  err: string | null;

  schemeIdText: string;
  setSchemeIdText: (v: string) => void;

  province: string;
  setProvince: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;

  realWeightKg: string;
  setRealWeightKg: (v: string) => void;

  lengthCm: string;
  setLengthCm: (v: string) => void;
  widthCm: string;
  setWidthCm: (v: string) => void;
  heightCm: string;
  setHeightCm: (v: string) => void;

  flags: string;
  setFlags: (v: string) => void;

  dimsWarning: boolean;

  onRun: () => void;
  onClear: () => void;
}> = (p) => {
  const {
    loading,
    err,
    schemeIdText,
    setSchemeIdText,
    province,
    setProvince,
    city,
    setCity,
    district,
    setDistrict,
    realWeightKg,
    setRealWeightKg,
    lengthCm,
    setLengthCm,
    widthCm,
    setWidthCm,
    heightCm,
    setHeightCm,
    flags,
    setFlags,
    dimsWarning,
    onRun,
    onClear,
  } = p;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">构造算价请求（/shipping-quote/calc）</div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">scheme_id *</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
            value={schemeIdText}
            onChange={(e) => setSchemeIdText(e.target.value)}
            placeholder="例如 1"
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">real_weight_kg *</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
            value={realWeightKg}
            onChange={(e) => setRealWeightKg(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">flags（逗号分隔）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="bulky,irregular"
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">province</label>
          <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" value={province} onChange={(e) => setProvince(e.target.value)} disabled={loading} />
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">city</label>
          <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" value={city} onChange={(e) => setCity(e.target.value)} disabled={loading} />
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">district</label>
          <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={loading} />
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">length_cm</label>
          <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} disabled={loading} />
        </div>
        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">width_cm</label>
          <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} disabled={loading} />
        </div>
        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-slate-600">height_cm</label>
          <input className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} disabled={loading} />
        </div>
      </div>

      {dimsWarning ? <div className="mt-2 text-sm text-amber-700">提示：体积三项必须都填且为合法数字，才会参与计算。</div> : null}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className={"rounded-xl px-4 py-2 text-sm font-semibold " + (loading ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800")}
          onClick={onRun}
          disabled={loading}
        >
          {loading ? "运行中…" : "运行 calc"}
        </button>

        <button
          type="button"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onClear}
          disabled={loading}
        >
          清空结果
        </button>

        {err ? <span className="text-sm text-red-700">{err}</span> : null}
      </div>
    </div>
  );
};

export default LabRequestForm;
