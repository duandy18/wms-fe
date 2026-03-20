// src/features/tms/pricingTemplates/workbench/cards/GroupsCard.tsx
//
// 分拆说明：
// - 从 PricingWorkbenchPanel.tsx 中拆出。
// - 当前只负责“区域范围”卡片 UI。
// - 当前采用“单一省份面板 + 当前编辑行”模式：
//   1) 上方只渲染一套四列省份勾选网格
//   2) 下方区域行只展示已选摘要与行操作
// - 当前不负责：
//   1) groups 状态持久化
//   2) groups payload 构造
//   3) 顶层 province 拉取
//   4) matrix 清空与保存联动
// - 协作关系：
//   - 父层由 ../PricingWorkbenchPanel 传入省份选项、占用映射、当前编辑行与动作回调
//   - 真实状态更新与保存逻辑位于 ../usePricingWorkbench
// - 维护约束：
//   - 后续若调整省份选择交互，应继续在本文件内收口；不要再把区域范围 JSX 塞回页面壳。
//   - 已被其他组占用的省份禁用逻辑，保持在展示层消费父层传入的 provinceOwnerMap。
//   - 第四刀后：区域范围改为“整体保存”，不再逐行提交。

import React from "react";
import type { GeoItem } from "../../../providers/api/geo";
import { UI } from "../ui";
import SuccessBar from "../SuccessBar";
import { summarizeProvinceNames } from "../domain/derived";
import type { GroupProvinceRow, GroupRow, ModuleEditorState } from "../domain/types";

type Props = {
  disabled: boolean;
  moduleState: ModuleEditorState;
  errorMessage: string | null;
  successMessage: string | null;
  activeGroupClientId: string | null;
  provinceOptions: GeoItem[];
  provinceLoading: boolean;
  provinceNameByCode: Map<string, string>;
  provinceOrder: Map<string, number>;
  provinceOwnerMap: Map<string, string>;
  onSetActiveGroup: (clientId: string | null) => void;
  onAddGroup: () => void;
  onSaveGroups: () => Promise<boolean>;
  onRemoveGroup: (clientId: string) => void;
  onSetGroupProvinces: (clientId: string, provinces: GroupProvinceRow[]) => void;
};

function normalizeProvinceName(code: string, provinceNameByCode: Map<string, string>): string {
  return provinceNameByCode.get(code) ?? "";
}

function sortSelectedProvinces(
  provinces: GroupProvinceRow[],
  provinceOrder: Map<string, number>,
): GroupProvinceRow[] {
  return provinces
    .slice()
    .sort((a, b) => {
      const ap = provinceOrder.get(a.provinceCode) ?? Number.MAX_SAFE_INTEGER;
      const bp = provinceOrder.get(b.provinceCode) ?? Number.MAX_SAFE_INTEGER;
      if (ap !== bp) return ap - bp;
      return a.provinceCode.localeCompare(b.provinceCode, "zh-CN");
    });
}

function buildSelectedSummary(
  group: GroupRow,
  provinceOrder: Map<string, number>,
  provinceNameByCode: Map<string, string>,
): string {
  return summarizeProvinceNames(
    sortSelectedProvinces(group.provinces, provinceOrder)
      .map((p) => normalizeProvinceName(p.provinceCode, provinceNameByCode) || p.provinceCode)
      .filter((x) => x.trim().length > 0),
  );
}

export const GroupsCard: React.FC<Props> = ({
  disabled,
  moduleState,
  errorMessage,
  successMessage,
  activeGroupClientId,
  provinceOptions,
  provinceLoading,
  provinceNameByCode,
  provinceOrder,
  provinceOwnerMap,
  onSetActiveGroup,
  onAddGroup,
  onSaveGroups,
  onRemoveGroup,
  onSetGroupProvinces,
}) => {
  const aliveGroups = moduleState.groups.filter((g) => !g.isDeleted);
  const activeGroup = aliveGroups.find((g) => g.clientId === activeGroupClientId) ?? null;
  const activeSelectedCodes = new Set(
    (activeGroup?.provinces ?? []).map((p) => p.provinceCode.trim()).filter((x) => x.length > 0),
  );

  return (
    <div className={UI.cardTight}>
      <div className={UI.headerRow}>
        <div>
          <div className={UI.panelTitle}>2）区域范围</div>
          <div className={UI.panelHint}>
            当前编辑仍按单行切换，但提交改为整卡统一保存。先在下方逐行调整，再统一保存区域范围。
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={UI.btnNeutralSm}
            onClick={onAddGroup}
            disabled={disabled || moduleState.savingGroups}
          >
            新增区域行
          </button>
          <button
            type="button"
            className={UI.btnPrimaryGreen}
            onClick={() => void onSaveGroups()}
            disabled={disabled || moduleState.savingGroups}
          >
            {moduleState.savingGroups ? "保存中…" : "保存区域范围"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <SuccessBar msg={successMessage} onClose={() => undefined} />
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                当前编辑：
                {activeGroup
                  ? `第 ${aliveGroups.findIndex((g) => g.clientId === activeGroup.clientId) + 1} 行地区范围`
                  : "未选择区域行"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {activeGroup
                  ? `已选：${buildSelectedSummary(activeGroup, provinceOrder, provinceNameByCode) || "未选择省份"}`
                  : "请选择下方某一行进入编辑。所有改动先留在本地，点击右上角统一保存。"}
              </div>
            </div>
          </div>

          {provinceLoading ? (
            <div className="text-sm text-slate-600">正在加载省份列表…</div>
          ) : provinceOptions.length === 0 ? (
            <div className="text-sm text-slate-600">暂无省份数据</div>
          ) : !activeGroup ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              当前没有正在编辑的区域行。请在下方点击“编辑该行”，或新增区域行后开始选择省份。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 xl:grid-cols-4">
              {provinceOptions.map((opt) => {
                const code = String(opt.code ?? "");
                const name = String(opt.name ?? "");
                const checked = activeSelectedCodes.has(code);
                const ownerClientId = provinceOwnerMap.get(code) ?? null;
                const occupiedByOther = !!ownerClientId && ownerClientId !== activeGroup.clientId;

                return (
                  <label
                    key={code}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      checked
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : occupiedByOther
                          ? "border-slate-200 bg-slate-50 text-slate-400"
                          : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled || moduleState.savingGroups || occupiedByOther}
                      onChange={(e) => {
                        const nextChecked = e.target.checked;

                        let nextProvinces: GroupProvinceRow[];
                        if (nextChecked) {
                          nextProvinces = sortSelectedProvinces(
                            [
                              ...(activeGroup.provinces ?? []).filter((p) => p.provinceCode.trim()),
                              { provinceCode: code, provinceName: name },
                            ].filter(
                              (p, index, arr) =>
                                arr.findIndex((x) => x.provinceCode === p.provinceCode) === index,
                            ),
                            provinceOrder,
                          );
                        } else {
                          nextProvinces = sortSelectedProvinces(
                            (activeGroup.provinces ?? []).filter((p) => p.provinceCode !== code),
                            provinceOrder,
                          );
                        }

                        onSetGroupProvinces(activeGroup.clientId, nextProvinces);
                      }}
                    />
                    <span className="truncate">{name}</span>
                    {occupiedByOther ? (
                      <span className="ml-auto shrink-0 text-[11px] text-slate-400">已占用</span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {aliveGroups.map((g, idx) => {
            const isActive = g.clientId === activeGroupClientId;
            const selectedSummary = buildSelectedSummary(g, provinceOrder, provinceNameByCode);

            return (
              <div
                key={g.clientId}
                className={`rounded-xl border p-4 ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">第 {idx + 1} 行地区范围</div>
                    <div className="mt-1 text-xs text-slate-500">已选：{selectedSummary || "未选择省份"}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={isActive ? UI.btnPrimaryGreen : UI.btnNeutralSm}
                      onClick={() => onSetActiveGroup(g.clientId)}
                      disabled={disabled || moduleState.savingGroups}
                    >
                      {isActive ? "当前编辑中" : "编辑该行"}
                    </button>

                    <button
                      type="button"
                      className={UI.btnDangerSm}
                      onClick={() => onRemoveGroup(g.clientId)}
                      disabled={disabled || moduleState.savingGroups}
                    >
                      删除该行
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {aliveGroups.length === 0 ? <div className={UI.emptyText}>当前尚未配置区域范围。</div> : null}
        </div>
      </div>
    </div>
  );
};

export default GroupsCard;
