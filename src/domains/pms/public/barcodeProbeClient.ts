// src/domains/pms/public/barcodeProbeClient.ts
import { apiPost } from "../../../lib/api";
import type { BarcodeProbeResponse } from "./contracts/barcodeProbe";

export async function probeItemBarcode(
  barcode: string,
): Promise<BarcodeProbeResponse> {
  const code = String(barcode ?? "").trim();
  return apiPost<BarcodeProbeResponse>("/items/barcode-probe", {
    barcode: code,
  });
}
