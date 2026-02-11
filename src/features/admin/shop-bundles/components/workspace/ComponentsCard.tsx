// admin/shop-bundles/components/build/ComponentsCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { FskuStatus, MasterItem } from "../../types";
import type { UseFskuComponentsState } from "../../useFskuComponents";
import { ComponentsTable } from "./ComponentsTable";

type DraftShape = "bundle" | "single";

export const ComponentsCard: React.FC<{
  fskuId: number | null;
  status: FskuStatus | null;

  C: UseFskuComponentsState;
  items: MasterItem[];

  // ✅ 返回 created，用于“铁证提示：你到底创建了什么”
  onCreateDraft: (args: { name: string; shape: DraftShape; codeText: string }) => Promise<{ id: number; name: string }>;
  onPublishSelected: (id: number) => Promise<void>;
}> = ({ fskuId, status, C, items, onCreateDraft, onPublishSelected }) => {
  const readOnly = status === "published" || status === "retired";

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [creating, setCreating] = useState(false);

  // 新建草稿输入（入库字段仅 name/shape；FSKU code 由后端生成）
  const [draftName, setDraftName] = useState("");
  const [draftShape, setDraftShape] = useState<DraftShape>("bundle");

  useEffect(() => {
    if (!successMsg) return;
    const t = window.setTimeout(() => setSuccessMsg(null), 3500);
    return () => window.clearTimeout(t);
  }, [successMsg]);

  const statusHint = useMemo(() => {
    if (fskuId == null) return "未选择 FSKU：先填写“新建草稿名称”，再点右上角“新建草稿”。";
    if (status === "published") return "已发布：组成已锁定（只读）";
    if (status === "retired") return "已停用（只读）";
    return "草稿：可编辑组成，保存后再发布锁定";
  }, [fskuId, status]);

  const canPublishBase = fskuId != null && status === "draft";
  const canPublish = canPublishBase && !C.dirty;

  const publishTitle = (() => {
    if (fskuId == null) return "请先选择一个 FSKU";
    if (status !== "draft") return "仅草稿（draft）允许发布";
    if (C.dirty) return "当前有未保存修改：请先点击“保存”写库，再发布并锁定";
    return "发布后，组成（components）将变为只读";
  })();

  const createTitle = fskuId == null ? "新建草稿并开始组装" : "新建草稿并切换到新草稿";

  async function handlePublish() {
    if (!canPublish || fskuId == null) return;
    setActionError(null);
    setSuccessMsg(null);
    try {
      setPublishing(true);
      await onPublishSelected(fskuId);
      setSuccessMsg("发布成功：已锁定组成");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "发布失败";
      setActionError(msg);
    } finally {
      setPublishing(false);
    }
  }

  async function handleCreateDraft() {
    setActionError(null);
    setSuccessMsg(null);

    const name = draftName.trim();
    if (!name) {
      setActionError("请先填写“新建草稿名称”（必填）。");
      return;
    }

    try {
      setCreating(true);
      const created = await onCreateDraft({
        name,
        shape: draftShape,
        // ✅ 已删除“代码输入框”：这里固定传空串，仅为兼容上层签名；不入库、不参与生成 code
        codeText: "",
      });
      setSuccessMsg(`创建草稿成功：#${created.id} · 名称=${created.name}`);

      setDraftName(created.name);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "创建草稿失败";
      setActionError(msg);
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">② 组装 components</div>
          <div className="text-[11px] text-slate-500">{statusHint}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => void C.reload()}
            disabled={C.loading || fskuId == null}
            title={fskuId == null ? "未选择 FSKU，无需刷新组成" : ""}
          >
            {C.loading ? "加载中…" : "刷新"}
          </button>

          {!readOnly && fskuId != null ? (
            <>
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                onClick={async () => {
                  setActionError(null);
                  setSuccessMsg(null);
                  const ok = await C.save();
                  if (ok) setSuccessMsg("保存成功：已写入 components");
                }}
                disabled={C.loading || publishing || creating}
              >
                {C.loading ? "保存中…" : "保存"}
              </button>

              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                onClick={() => void handlePublish()}
                disabled={!canPublish || C.loading || publishing || creating}
                title={publishTitle}
              >
                {publishing ? "发布中…" : "发布并锁定"}
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => void handleCreateDraft()}
            disabled={creating || publishing || C.loading}
            title={createTitle}
          >
            {creating ? "创建中…" : "新建草稿"}
          </button>
        </div>
      </div>

      {/* ✅ 新建草稿：只保留必要输入；FSKU code 由后端生成 */}
      <div className="rounded-lg border border-slate-200 p-3 space-y-3">
        <div className="text-[11px] font-semibold text-slate-700">新建草稿信息</div>

        <label className="block space-y-1">
          <div className="text-[11px] text-slate-500">新建草稿名称（必填）</div>
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="例：鸡肉2袋+鸭肉1袋"
          />
        </label>

        <label className="block space-y-1">
          <div className="text-[11px] text-slate-500">商品形态</div>
          <select
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={draftShape}
            onChange={(e) => setDraftShape(e.target.value as DraftShape)}
          >
            <option value="bundle">组合</option>
            <option value="single">单品</option>
          </select>
        </label>

        <div className="text-[11px] text-slate-500">提示：FSKU 编码由后端自动生成；发布并锁定后，组成（components）将只读。</div>
      </div>

      {successMsg ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">{successMsg}</div>
      ) : null}

      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{actionError}</div>
      ) : null}

      {C.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{C.error}</div>
      ) : null}

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700">
          Components（SKU / 商品 / 数量 / 类型）
        </div>

        <ComponentsTable fskuId={fskuId} readOnly={readOnly} C={C} items={items} />
      </div>
    </section>
  );
};
