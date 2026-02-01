// src/features/admin/shipping-providers/scheme/table/cards/quote-explain/weight.ts

import type { Dims } from "../../../preview/types";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function parseDims(args: { lengthCm: string; widthCm: string; heightCm: string }): Dims | null {
  const lt = args.lengthCm.trim();
  const wt = args.widthCm.trim();
  const ht = args.heightCm.trim();

  if (!lt && !wt && !ht) return null;
  if (!lt || !wt || !ht) return null;

  const l = Number(lt);
  const w = Number(wt);
  const h = Number(ht);

  if (!Number.isFinite(l) || !Number.isFinite(w) || !Number.isFinite(h)) return null;
  if (l <= 0 || w <= 0 || h <= 0) return null;

  return { length_cm: l, width_cm: w, height_cm: h };
}

export function calcVolumeWeightKg(dims: Dims | null): number | null {
  if (!dims) return null;
  const vw = (dims.length_cm * dims.width_cm * dims.height_cm) / 8000;
  if (!Number.isFinite(vw) || vw <= 0) return null;
  return round2(vw);
}

export function calcChargeableWeightKg(args: { realWeightKg: string; volumeWeightKg: number | null }): number | null {
  const real = Number(args.realWeightKg);
  const realOk = Number.isFinite(real) && real > 0;
  const volOk = args.volumeWeightKg != null && Number.isFinite(args.volumeWeightKg) && args.volumeWeightKg > 0;

  if (!realOk && !volOk) return null;
  if (!realOk && volOk) return args.volumeWeightKg!;
  if (realOk && !volOk) return round2(real);
  return round2(Math.max(real, args.volumeWeightKg!));
}

export function shouldShowDimsWarning(args: { lengthCm: string; widthCm: string; heightCm: string; dims: Dims | null }): boolean {
  const any = Boolean(args.lengthCm.trim() || args.widthCm.trim() || args.heightCm.trim());
  if (!any) return false;
  return args.dims === null;
}
