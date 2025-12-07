// src/features/dev/pick-tasks/DevPickTasksHeader.tsx

import React from "react";

interface Props {
  platform: string;
  shopId: string;
  onChangePlatform: (v: string) => void;
  onChangeShopId: (v: string) => void;
  creating: boolean;
  onCreateDemo: () => void;
}

export const DevPickTasksHeader: React.FC<Props> = ({
  platform,
  shopId,
  onChangePlatform,
  onChangeShopId,
  creating,
  onCreateDemo,
}) => {
  return (
    <div className="grid gap-3 md:grid-cols-[1.1fr,1.1fr,auto]">
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">
          平台（platform）
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          value={platform}
          onChange={(e) => onChangePlatform(e.target.value)}
          placeholder="例如 PDD / TB"
        />
        <p className="text-[11px] text-slate-500">
          建议与 demo 订单平台一致，默认 PDD。
        </p>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">
          店铺（shop_id）
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          value={shopId}
          onChange={(e) => onChangeShopId(e.target.value)}
          placeholder="例如 1"
        />
        <p className="text-[11px] text-slate-500">
          必须是已经在「店铺管理」中建立并绑定仓库的店铺。
        </p>
      </div>
      <div className="flex items-end justify-end">
        <button
          type="button"
          onClick={onCreateDemo}
          disabled={creating}
          className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {creating
            ? "生成 demo 订单 & 拣货任务中…"
            : "一键 demo 订单 + 拣货任务"}
        </button>
      </div>
    </div>
  );
};
