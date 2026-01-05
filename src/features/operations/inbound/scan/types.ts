// src/features/operations/inbound/scan/types.ts

export type StatusLevel = "idle" | "ok" | "warn" | "error";

export type ApiErrorShape = {
  message?: string;
};
