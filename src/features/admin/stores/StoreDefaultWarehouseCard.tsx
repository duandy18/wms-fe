// src/features/admin/stores/StoreDefaultWarehouseCard.tsx

import React from "react";
import type { StoreBinding } from "./types";
import { UI } from "./ui";

type Props = {
  defaultWarehouseId: number | null;
  bindings: StoreBinding[];
};

export const StoreDefaultWarehouseCard: React.FC<Props> = ({ defaultWarehouseId, bindings }) => {
  const binding = defaultWarehouseId ? bindings.find((b) => b.warehouse_id === defaultWarehouseId) : undefined;

  const warehouseLabel =
    binding &&
    [`WH-${binding.warehouse_id}`, binding.warehouse_name ? `· ${binding.warehouse_name}` : "", binding.warehouse_code ? `（${binding.warehouse_code}）` : ""]
      .filter(Boolean)
      .join(" ");

  const active = binding?.warehouse_active;
  const isActive = active === undefined || active === null ? true : Boolean(active);

  return (
    <section className={UI.defaultCard}>
      <div className={UI.titleBase}>默认仓信息</div>

      {defaultWarehouseId == null ? (
        <div className={UI.hint}>尚未设置默认仓。</div>
      ) : binding ? (
        <div className={UI.defaultLine}>
          <div>
            默认仓：<span className={UI.defaultNameStrong}>{warehouseLabel}</span>
          </div>

          <div className={UI.defaultRow}>
            <span className={UI.defaultIdHint}>仓库 ID: {binding.warehouse_id}</span>
            <span className={isActive ? UI.pillOk : UI.pillInactive}>{isActive ? "仓库已启用" : "仓库已停用"}</span>
          </div>
        </div>
      ) : (
        <div className={UI.defaultMissing}>
          默认仓 ID：<span className={UI.defaultNameStrong}>{defaultWarehouseId}</span>
          <span className={`ml-2 ${UI.hintXs}`}>（当前绑定列表中未找到该仓库）</span>
        </div>
      )}
    </section>
  );
};

export default StoreDefaultWarehouseCard;
