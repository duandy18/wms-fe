// src/features/ops/dev/order-parse-simulator/components/RunParamsCard.tsx

import React from "react";

export function RunParamsCard(props: {
  count: number;
  linesMin: number;
  linesMax: number;
  qtyMin: number;
  qtyMax: number;
  rngSeed: number;
  withReplay: boolean;
  watchCodesText: string;
  onCountChange: (n: number) => void;
  onLinesMinChange: (n: number) => void;
  onLinesMaxChange: (n: number) => void;
  onQtyMinChange: (n: number) => void;
  onQtyMaxChange: (n: number) => void;
  onRngSeedChange: (n: number) => void;
  onWithReplayChange: (b: boolean) => void;
  onWatchCodesTextChange: (s: string) => void;
}) {
  const p = props;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">运行参数</div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-sm text-slate-700">
          生成订单数 count
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="number"
            value={p.count}
            min={1}
            max={500}
            onChange={(e) => p.onCountChange(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-700">
          rng_seed（复现用）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="number"
            value={p.rngSeed}
            min={0}
            onChange={(e) => p.onRngSeedChange(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-700">
          lines_min
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="number"
            value={p.linesMin}
            min={1}
            max={10}
            onChange={(e) => p.onLinesMinChange(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-700">
          lines_max
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="number"
            value={p.linesMax}
            min={1}
            max={10}
            onChange={(e) => p.onLinesMaxChange(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-700">
          qty_min
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="number"
            value={p.qtyMin}
            min={1}
            max={100}
            onChange={(e) => p.onQtyMinChange(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-700">
          qty_max
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="number"
            value={p.qtyMax}
            min={1}
            max={100}
            onChange={(e) => p.onQtyMaxChange(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-700 col-span-2">
          watch_filled_codes（逗号分隔）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm"
            value={p.watchCodesText}
            onChange={(e) => p.onWatchCodesTextChange(e.target.value)}
            placeholder="UT-REPLAY-FSKU-1,FSKU-1"
          />
        </label>
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={p.withReplay} onChange={(e) => p.onWithReplayChange(e.target.checked)} />
        with_replay（包含 /platform-orders/replay）
      </label>
    </div>
  );
}
