// src/features/operations/scan/barcodeParser.ts

export interface ParsedBarcode {
  raw: string;

  // 基础字段
  item_id?: number;
  qty?: number;
  batch_code?: string;
  warehouse_id?: number;

  // 扩展字段（日期）
  production_date?: string; // YYYY-MM-DD
  expiry_date?: string;     // YYYY-MM-DD

  // 原始 token，便于调试观察
  tokens?: string[];
}

/**
 * 主入口：解析一条扫码字符串，返回结构化字段。
 *
 * 支持两层：
 * 1）简单前缀 / KV：ITEM:xxx QTY:xx BATCH:xxx WH:1 PD:20250223 EXP:20260223
 * 2）简化 GS1：形如 "(01)......(11)YYMMDD(17)YYMMDD(10)BATCH"
 *
 * 设计原则：
 * - 能解析的就解析（日期/批次），解析不了的保持 raw；
 * - 不强行猜测不存在的信息（例如普通 EAN/UPC 条码）。
 */
export function parseScanBarcode(raw: string): ParsedBarcode {
  const trimmed = raw.trim();
  const base: ParsedBarcode = { raw: trimmed };

  if (!trimmed) return base;

  // 1) 简单前缀 / KV 解析
  const simple = parseSimpleTokens(trimmed);
  let merged: ParsedBarcode = { ...base, ...simple };

  // 2) 如果像 GS1，再尝试附加解析
  if (looksLikeGs1(trimmed)) {
    const gs1 = parseGs1Barcode(trimmed);
    merged = { ...merged, ...gs1 };
  }

  // 3) 内部批次码辅助规则：纯 6 位数字 batch_code 视为 YYMMDD
  if (!merged.production_date && merged.batch_code) {
    const maybeDate = parseSixDigitDateAsProd(merged.batch_code);
    if (maybeDate) {
      merged.production_date = maybeDate;
    }
  }

  return merged;
}

/**
 * 简单前缀 / KV 解析：
 *   ITEM:3001
 *   QTY:3
 *   BATCH:ABC123
 *   WH:1
 *   PD:20250223 / PROD:2025-02-23
 *   EXP:20260223 / ED:2026-02-23
 *
 * 允许空格 / 逗号 / 分号分隔。
 */
function parseSimpleTokens(raw: string): ParsedBarcode {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const result: ParsedBarcode = { raw, tokens };

  for (const t of tokens) {
    const [k, v] = t.split(":", 2);
    if (!v) continue;

    const key = k.toUpperCase();
    const val = v.trim();

    switch (key) {
      case "ITEM":
        result.item_id = safeInt(val);
        break;
      case "QTY":
        result.qty = safeInt(val);
        break;
      case "BATCH":
      case "LOT":
        result.batch_code = val;
        break;
      case "WH":
      case "WAREHOUSE":
        result.warehouse_id = safeInt(val);
        break;

      // 生产日期键：PD / PROD / PRODUCTION / MFG 等
      case "PD":
      case "PROD":
      case "PRODUCTION":
      case "MFG":
      case "MFG_DATE": {
        const d = parseFlexibleDate(val);
        if (d) result.production_date = d;
        break;
      }

      // 到期日期键：EXP / ED / EXPIRY / EXPIRE 等
      case "EXP":
      case "ED":
      case "EXPIRY":
      case "EXPIRE":
      case "EXPIRATION": {
        const d = parseFlexibleDate(val);
        if (d) result.expiry_date = d;
        break;
      }

      default:
        break;
    }
  }

  return result;
}

/**
 * 非严格判断：看起来像 GS1 条码就试着按 GS1 解析一遍。
 */
function looksLikeGs1(raw: string): boolean {
  // 超简陋规则：全是数字和括号，长度>=12
  return /^[0-9()]+$/.test(raw) && raw.length >= 12;
}

/**
 * 解析极简 GS1：
 *  - (10) 批号 → batch_code
 *  - (11) 生产日期 YYMMDD → production_date
 *  - (17) 到期日 YYMMDD → expiry_date
 *
 * 其他 AI 先忽略，后面有需要再加。
 */
function parseGs1Barcode(raw: string): Partial<ParsedBarcode> {
  const out: Partial<ParsedBarcode> = {};

  const aiPattern = /\((\d{2})\)([0-9A-Za-z]+)/g;
  let match: RegExpExecArray | null;

  while ((match = aiPattern.exec(raw)) !== null) {
    const ai = match[1];
    const value = match[2];

    switch (ai) {
      case "10":
        out.batch_code = value;
        break;
      case "11":
        out.production_date = parseGs1Date(value);
        break;
      case "17":
        out.expiry_date = parseGs1Date(value);
        break;
      default:
        break;
    }
  }

  return out;
}

/**
 * GS1 YYMMDD → YYYY-MM-DD
 */
function parseGs1Date(v: string): string | undefined {
  if (!/^\d{6}$/.test(v)) return undefined;
  const yy = parseInt(v.slice(0, 2), 10);
  const mm = parseInt(v.slice(2, 4), 10);
  const dd = parseInt(v.slice(4, 6), 10);
  if (!mm || mm > 12 || !dd || dd > 31) return undefined;

  const year = 2000 + yy;
  const month = String(mm).padStart(2, "0");
  const day = String(dd).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 通用日期解析：
 * 支持：
 *  - YYYY-MM-DD
 *  - YYYYMMDD
 *  - YYMMDD （解释为 2000+YY）
 */
function parseFlexibleDate(v: string): string | undefined {
  const s = v.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    const yy = Number(y);
    const mm = Number(m);
    const dd = Number(d);
    if (isValidYMD(yy, mm, dd)) {
      const month = String(mm).padStart(2, "0");
      const day = String(dd).padStart(2, "0");
      return `${yy}-${month}-${day}`;
    }
    return undefined;
  }

  // YYYYMMDD
  if (/^\d{8}$/.test(s)) {
    const yy = Number(s.slice(0, 4));
    const mm = Number(s.slice(4, 6));
    const dd = Number(s.slice(6, 8));
    if (isValidYMD(yy, mm, dd)) {
      const month = String(mm).padStart(2, "0");
      const day = String(dd).padStart(2, "0");
      return `${yy}-${month}-${day}`;
    }
    return undefined;
  }

  // YYMMDD -> 2000+YY
  if (/^\d{6}$/.test(s)) {
    const yy = 2000 + Number(s.slice(0, 2));
    const mm = Number(s.slice(2, 4));
    const dd = Number(s.slice(4, 6));
    if (isValidYMD(yy, mm, dd)) {
      const month = String(mm).padStart(2, "0");
      const day = String(dd).padStart(2, "0");
      return `${yy}-${month}-${day}`;
    }
    return undefined;
  }

  return undefined;
}

function isValidYMD(y: number, m: number, d: number): boolean {
  if (!y || !m || !d) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  // 不纠结每月天数/闰年，粗校验够用；精确校验可后续增强
  return true;
}

/**
 * 内部 6 位日期批次码：YYMMDD → 生产日期
 * 仅在 batch_code 为 6 位纯数字，且看起来像日期时启用。
 */
function parseSixDigitDateAsProd(code: string): string | undefined {
  const s = code.trim();
  if (!/^\d{6}$/.test(s)) return undefined;
  return parseFlexibleDate(s);
}

function safeInt(v: string): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
