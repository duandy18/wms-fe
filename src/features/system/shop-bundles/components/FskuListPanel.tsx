// src/features/system/shop-bundles/components/FskuListPanel.tsx
import React, { useMemo, useState } from "react";
import type { Fsku } from "../types";
import { cls, fmtIso, shapeLabel } from "../ui";
import { apiPatchFskuName } from "../api";

function splitSummary(summary: string): string[] {
  const s = (summary ?? "").trim();
  if (!s) return [];

  const bySemicolonOrNl = s
    .replace(/\r\n/g, "\n")
    .split(/\n|;+/g)
    .map((x) => x.trim())
    .filter(Boolean);
  if (bySemicolonOrNl.length >= 2) return bySemicolonOrNl;

  const byPlus = s
    .split(/\s*\+\s*/g)
    .map((x) => x.trim())
    .filter(Boolean);
  if (byPlus.length >= 2) return byPlus;

  return [s];
}

function statusPill(status: Fsku["status"]): { label: string; clsName: string; code: string } {
  if (status === "draft") return { label: "草稿", clsName: "border-slate-200 bg-slate-50 text-slate-700", code: "draft" };
  if (status === "published") return { label: "可用", clsName: "border-emerald-200 bg-emerald-50 text-emerald-700", code: "published" };
  return { label: "退休", clsName: "border-rose-200 bg-rose-50 text-rose-700", code: "retired" };
}

type Banner = { kind: "success" | "error"; text: string } | null;

export const FskuListPanel: React.FC<{
  fskus: Fsku[];
  loading: boolean;
  onRefresh: () => void;

  selectedFskuId: number | null;
  setSelectedFskuId: (v: number | null) => void;

  onRetireSelected: (id: number) => void;
  onUnretireSelected: (id: number) => void;

  onlyUsable: boolean;
  setOnlyUsable: (v: boolean) => void;

  showRetired: boolean;
  setShowRetired: (v: boolean) => void;
}> = ({
  fskus,
  loading,
  onRefresh,
  selectedFskuId,
  setSelectedFskuId,
  onRetireSelected,
  onUnretireSelected,
  onlyUsable,
  setOnlyUsable,
  showRetired,
  setShowRetired,
}) => {
  const [banner, setBanner] = useState<Banner>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const fskuById = useMemo(() => {
    const m = new Map<number, Fsku>();
    for (const f of fskus) m.set(f.id, f);
    return m;
  }, [fskus]);

  function startEdit(id: number) {
    const f = fskuById.get(id);
    if (!f) return;
    if (f.status === "retired") {
      setBanner({ kind: "error", text: "该 FSKU 已退休，名称不可修改。" });
      return;
    }
    setBanner(null);
    setEditingId(id);
    setEditingName(f.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setSavingId(null);
  }

  async function saveEdit(id: number) {
    const f = fskuById.get(id);
    if (!f) return;

    if (f.status === "retired") {
      setBanner({ kind: "error", text: "该 FSKU 已退休，名称不可修改。" });
      return;
    }

    const nm = editingName.trim();
    if (!nm) {
      setBanner({ kind: "error", text: "名称不能为空。" });
      return;
    }

    if (nm === f.name.trim()) {
      setBanner({ kind: "success", text: "名称未变化，无需保存。" });
      cancelEdit();
      return;
    }

    setSavingId(id);
    setBanner(null);
    try {
      await apiPatchFskuName(id, nm);
      setBanner({ kind: "success", text: "名称已更新（列表将刷新并以 updated_at 为准）。" });
      cancelEdit();
      onRefresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存失败";
      setBanner({ kind: "error", text: msg });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">① 履约组合库（FSKU）</div>
          <div className="text-[11px] text-slate-500">默认只显示“可用”。关闭后可查看草稿；如需回看历史可打开“显示退休”。名称支持在列表行内编辑（退休态只读）。</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cls(
              "rounded-md border px-2 py-1 text-[11px] font-medium",
              onlyUsable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700",
            )}
            onClick={() => {
              const next = !onlyUsable;
              setOnlyUsable(next);
              if (next) setShowRetired(false);
            }}
            title="默认开启：只显示可用（published）"
          >
            只看可用 {onlyUsable ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            className={cls(
              "rounded-md border px-2 py-1 text-[11px] font-medium",
              showRetired ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700",
              onlyUsable && "opacity-50 cursor-not-allowed",
            )}
            disabled={onlyUsable}
            onClick={() => setShowRetired(!showRetired)}
            title={onlyUsable ? "只看可用开启时不展示退休；请先关闭“只看可用”" : "开启后显示退休（retired）"}
          >
            显示退休 {showRetired ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? "刷新中…" : "刷新列表"}
          </button>
        </div>
      </div>

      {banner ? (
        <div
          className={cls(
            "rounded-lg border px-3 py-2 text-[12px]",
            banner.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800",
          )}
        >
          {banner.text}
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[360px]" />
            <col className="w-[96px]" />
            <col className="w-auto" />
            <col className="w-[140px]" />
            <col className="w-[160px]" />
            <col className="w-[160px]" />
            <col className="w-[160px]" />
          </colgroup>

          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-slate-200 text-[11px] text-slate-600">
              <th className="px-3 py-2 text-left">编码</th>
              <th className="px-3 py-2 text-left">名称</th>
              <th className="px-3 py-2 text-left">形态</th>
              <th className="px-3 py-2 text-left">组合内容摘要</th>
              <th className="px-3 py-2 text-left">状态</th>
              <th className="px-3 py-2 text-left">发布于</th>
              <th className="px-3 py-2 text-left">更新时间</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {fskus.map((f) => {
              const active = selectedFskuId === f.id;
              const isRetired = f.status === "retired";
              const lines = splitSummary(f.components_summary);
              const pill = statusPill(f.status);
              const isEditing = editingId === f.id;
              const isSaving = savingId === f.id;

              return (
                <tr
                  key={f.id}
                  className={cls(
                    "border-b border-slate-100 cursor-pointer hover:bg-slate-50",
                    active && "bg-slate-50",
                    isRetired && "opacity-60",
                  )}
                  onClick={() => setSelectedFskuId(f.id)}
                >
                  <td className="px-3 py-2 font-mono text-[11px] truncate" title={f.code}>
                    {f.code}
                  </td>

                  <td className="px-3 py-2" onClick={(e) => isEditing && e.stopPropagation()}>
                    {isEditing ? (
                      <input
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void saveEdit(f.id);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <div className="truncate" title={f.name}>
                        {f.name}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-2">{shapeLabel(f.shape)}</td>

                  <td className="px-3 py-2">
                    {lines.length ? (
                      <div className="space-y-0.5">
                        {lines.map((ln, i) => (
                          <div key={i} className="leading-5 break-words">
                            {ln}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-400">—</div>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <span className={cls("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", pill.clsName)}>
                      {pill.label}
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-slate-400">{pill.code}</span>
                  </td>

                  <td className="px-3 py-2 font-mono text-[11px] truncate" title={f.published_at ? fmtIso(f.published_at) : "—"}>
                    {f.published_at ? fmtIso(f.published_at) : "—"}
                  </td>

                  <td className="px-3 py-2 font-mono text-[11px] truncate" title={fmtIso(f.updated_at)}>
                    {fmtIso(f.updated_at)}
                  </td>

                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            className={cls(
                              "rounded-md border px-2 py-1 text-[11px]",
                              "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                              isSaving && "opacity-60 cursor-not-allowed",
                            )}
                            disabled={isSaving}
                            onClick={() => void saveEdit(f.id)}
                          >
                            {isSaving ? "保存中…" : "保存"}
                          </button>
                          <button
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                            disabled={isSaving}
                            onClick={() => cancelEdit()}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <button
                          className={cls(
                            "rounded-md border px-2 py-1 text-[11px]",
                            f.status === "retired"
                              ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                          )}
                          disabled={f.status === "retired"}
                          onClick={() => startEdit(f.id)}
                          title={f.status === "retired" ? "退休态只读" : "行内编辑名称"}
                        >
                          修改名称
                        </button>
                      )}

                      {f.status === "published" ? (
                        <button
                          className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-100"
                          onClick={() => onRetireSelected(f.id)}
                        >
                          退休
                        </button>
                      ) : f.status === "retired" ? (
                        <button
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700 hover:bg-emerald-100"
                          onClick={() => onUnretireSelected(f.id)}
                        >
                          可用
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!fskus.length ? <div className="px-3 py-3 text-[12px] text-slate-500">当前筛选下暂无数据。</div> : null}
      </div>
    </section>
  );
};
