// src/features/ops/dev/order-parse-simulator/components/SeedPreviewCard.tsx

import React, { useState } from "react";

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

export function SeedPreviewCard(props: { seedText: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function onCopy() {
    setCopied(null);
    try {
      await copyToClipboard(props.seedText);
      setCopied("已复制 seed JSON");
      setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied("复制失败（浏览器限制）");
      setTimeout(() => setCopied(null), 1500);
    }
  }

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b rounded-t-xl">
        <div className="text-sm font-semibold text-slate-900">seed（自动生成，可复制）</div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onCopy} type="button">
            复制 seed
          </button>
          {copied ? <span className="text-xs text-slate-600">{copied}</span> : null}
        </div>
      </div>
      <textarea className="w-full font-mono text-xs p-3 outline-none" rows={10} value={props.seedText} readOnly />
    </div>
  );
}
