export interface ParsedBarcode {
  raw: string;
  normalized: string;
}

/**
 * shared scan 轻量 parser：
 * - 只做原始扫码字符串标准化
 * - 不承担 qty / batch / 日期 / GS1 推导
 * - 真正的商品包装识别交给 PMS export barcode probe
 */
export function parseScanBarcode(raw: string): ParsedBarcode {
  const normalized = String(raw ?? "").trim();
  return {
    raw: String(raw ?? ""),
    normalized,
  };
}
