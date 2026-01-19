// src/features/admin/warehouses/detail/ProvinceCitySplitPanel.tsx
import React, { useMemo, useState } from "react";
import { CN_PROVINCES } from "./provinces";

function toSet(list: string[]): Set<string> {
  const s = new Set<string>();
  for (const x of list || []) {
    const v = (x || "").trim();
    if (v) s.add(v);
  }
  return s;
}

export const ProvinceCitySplitPanel: React.FC<{
  canWrite: boolean;
  saving: boolean;
  error: string | null;

  // 当前“按城市配置”的省
  citySplitProvinces: string[];

  // 当前仓的省选择集合（用于校验：只能升级已勾选省）
  selectedProvinces: string[];

  onAdd: (provinces: string[]) => Promise<void> | void;
  onRemove: (province: string) => Promise<void> | void;
}> = (p) => {
  const splitSet = useMemo(() => toSet(p.citySplitProvinces || []), [p.citySplitProvinces]);
  const selectedSet = useMemo(() => toSet(p.selectedProvinces || []), [p.selectedProvinces]);

  const [draft, setDraft] = useState("");
  const [draftErr, setDraftErr] = useState<string | null>(null);

  async function handleAdd() {
    const raw = draft.trim();
    setDraftErr(null);

    if (!raw) return setDraftErr("请输入省份名称");
    if (!CN_PROVINCES.includes(raw)) return setDraftErr("省份不在可选列表中（请从下拉提示选择）");
    if (splitSet.has(raw)) return setDraftErr("该省已是按城市配置");
    if (!selectedSet.has(raw)) return setDraftErr("该省不在本仓当前选择中，请先在下方勾选该省");

    await p.onAdd([raw]);
    setDraft("");
  }

  async function handleRemove(prov: string) {
    const ok = window.confirm(
      `确认取消“按城市配置”：${prov}？\n取消后，该省将允许按省级规则重新配置（你可能需要重新勾选省份归属）。`,
    );
    if (!ok) return;
    await p.onRemove(prov);
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3">
      <div>
        <div className="text-lg font-semibold text-slate-900">需要按城市配置的省</div>
        <div className="mt-1 text-sm text-slate-500">
          这些省将从省级规则中移除，订单必须按城市命中；未配置城市将明确阻断（NO_SERVICE_WAREHOUSE）。
        </div>
      </div>

      {p.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {p.error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-600">省份（从可选列表选择）</label>
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            list="wh-city-split-province-list"
            placeholder="例如：河北省"
            disabled={p.saving || !p.canWrite}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
          <datalist id="wh-city-split-province-list">
            {CN_PROVINCES.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 disabled:opacity-60"
          disabled={p.saving || !p.canWrite}
          onClick={() => void handleAdd()}
          title="将该省升级为按城市配置（省级冻结）"
        >
          {p.saving ? "处理中…" : "升级为按城市配置"}
        </button>

        {draftErr && <div className="text-sm text-red-700">{draftErr}</div>}
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4">
        {p.citySplitProvinces.length === 0 ? (
          <div className="text-sm text-slate-500">当前没有省被升级为按城市配置。</div>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {p.citySplitProvinces.map((prov) => (
              <li key={prov} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="mr-2 font-medium">{prov}</span>
                <button
                  type="button"
                  className="text-slate-700 underline disabled:opacity-60"
                  disabled={p.saving || !p.canWrite}
                  onClick={() => void handleRemove(prov)}
                >
                  取消
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
