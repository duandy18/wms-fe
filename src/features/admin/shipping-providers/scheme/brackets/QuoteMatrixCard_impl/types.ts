// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixCard/types.ts

export type EditingCell = {
  zoneId: number;
  key: string;
  min: number;
  max: number | null;
};

export type DisplayTone = "ok" | "empty" | "warn";

export type DisplayText = {
  text: string;
  tone: DisplayTone;
};
