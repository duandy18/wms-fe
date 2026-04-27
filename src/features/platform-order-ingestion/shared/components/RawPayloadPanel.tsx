import React, { useMemo, useState } from "react";
import { poiUi } from "../ui";

function formatJson(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export const RawPayloadPanel: React.FC<{
  title: string;
  payload: unknown;
  defaultOpen?: boolean;
}> = ({ title, payload, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const text = useMemo(() => formatJson(payload), [payload]);

  return (
    <section className={poiUi.card}>
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={poiUi.cardTitle}>{title}</span>
        <span className="text-sm text-slate-500">{open ? "收起" : "展开"}</span>
      </button>

      {open ? (
        <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">
{text}
        </pre>
      ) : null}
    </section>
  );
};
