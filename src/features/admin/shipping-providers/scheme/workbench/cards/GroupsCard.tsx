// src/features/admin/shipping-providers/scheme/workbench/cards/GroupsCard.tsx
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
//   - 行级主动作优先使用“保存本行并继续下一行”，减少用户每完成一行后手动切换的摩擦。

import React from "react";
import type { GeoItem } from "../../../api/geo";
import { UI } from "../../ui";
import { summarizeProvinceNames } from "../domain/derived";
import type { GroupProvinceRow, GroupRow, ModuleEditorState } from "../domain/types";

type Props = {
  disabled: boolean;
  moduleState: ModuleEditorState;
  activeGroupClientId: string | null;
  provinceOptions: GeoItem[];
  provinceLoading: boolean;
  provinceNameByCode: Map<string, string>;
  provinceOrder: Map<string, number>;
  provinceOwnerMap: Map<string, string>;
  onSetActiveGroup: (clientId: string | null) => void;
  onAddGroup: () => void;
  onSaveGroups: () => void;
  onSaveActiveGroupAndNext: () => void;
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
  activeGroupClientId,
  provinceOptions,
  provinceLoading,
  provinceNameByCode,
  provinceOrder,
  provinceOwnerMap,
  onSetActiveGroup,
  onAddGroup,
  onSaveGroups,
  onSaveActiveGroupAndNext,
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
            使用单一省份面板编辑当前区域行；下方每一行只展示已选结果，不再重复整套省份网格。
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
            onClick={onSaveGroups}
            disabled={disabled || moduleState.savingGroups}
          >
            {moduleState.savingGroups ? "保存中…" : "保存区域范围"}
          </button>
        </div>
      </div>

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
                  : "请先在下方选择一个区域行，再勾选省份。"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={UI.btnPrimaryGreen}
                onClick={onSaveActiveGroupAndNext}
                disabled={disabled || moduleState.savingGroups || !activeGroup}
              >
                {moduleState.savingGroups ? "保存中…" : "保存本行并继续下一行"}
              </button>
            </div>
          </div>

          {provinceLoading ? (
            <div className="text-sm text-slate-600">正在加载省份列表…</div>
          ) : provinceOptions.length === 0 ? (
            <div className="text-sm text-slate-600">暂无省份数据</div>
          ) : !activeGroup ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              请先选择一个区域行作为当前编辑对象。
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

          {aliveGroups.length === 0 ? <div className={UI.emptyText}>当前模块尚未配置区域范围。</div> : null}
        </div>
      </div>
    </div>
  );
};

export default GroupsCard;
