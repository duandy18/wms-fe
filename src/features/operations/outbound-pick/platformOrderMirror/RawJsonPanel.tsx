// src/features/operations/outbound-pick/platformOrderMirror/RawJsonPanel.tsx
import React, { useMemo, useState } from "react";
import { safeJson } from "./jsonPick";

async function copyText(text: string): Promise<boolean> {
  // 优先使用 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 继续 fallback
    }
  }

  // fallback：textarea + execCommand
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export const RawJsonPanel: React.FC<{
  title?: string;
  payload: unknown;
  defaultOpen?: boolean;
}> = ({ title = "Raw JSON（完整镜像）", payload, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => safeJson(payload), [payload]);

  async function handleCopy() {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      alert("复制失败，请手动复制。");
    }
  }

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          className="text-[11px] font-semibold text-slate-700 hover:text-slate-900"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "▾ " : "▸ "}
          {title}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            onClick={handleCopy}
          >
            {copied ? "已复制 ✓" : "复制 JSON"}
          </button>
        </div>
      </div>

      {open ? (
        <pre className="max-h-[360px] overflow-auto px-3 py-2 text-[11px] leading-5 text-slate-800">
{text}
        </pre>
      ) : null}
    </div>
  );
};
