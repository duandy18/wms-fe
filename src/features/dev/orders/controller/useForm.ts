// src/features/dev/orders/controller/useForm.ts
import React, { useState } from "react";
import type { FormState } from "./types";

export function useFormState(args: {
  initialPlatform?: string;
  initialShopId?: string;
  initialExtOrderNo?: string;
}) {
  const [form, setForm] = useState<FormState>({
    platform: args.initialPlatform || "PDD",
    shopId: args.initialShopId || "1",
    extOrderNo: args.initialExtOrderNo || "",
  });

  const onChange =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  return {
    form,
    setForm,
    onChange,
  };
}
