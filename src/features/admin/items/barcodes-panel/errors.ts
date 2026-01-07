// src/features/admin/items/barcodes-panel/errors.ts

type ApiErrorShape = {
  message?: string;
  response?: {
    data?: {
      detail?: string;
    };
  };
};

export function getErrorMessage(e: unknown, fallback: string): string {
  const err = e as ApiErrorShape;
  return err?.response?.data?.detail ?? err?.message ?? fallback;
}
