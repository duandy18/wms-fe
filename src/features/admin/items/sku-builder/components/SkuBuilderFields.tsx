// src/features/admin/items/sku-builder/components/SkuBuilderFields.tsx

import React from "react";
import { UI } from "../ui";
import type { LastState } from "../types";

export const SkuBuilderFields: React.FC<{
  state: LastState;
  onChange: (patch: Partial<LastState>) => void;
}> = ({ state, onChange }) => {
  return (
    <div className={UI.fieldsGrid}>
      <div className={UI.fieldWrap}>
        <label className={UI.label}>品牌（Brand）</label>
        <input
          className={UI.input}
          placeholder="例如 NP、BR01"
          value={state.brand}
          onChange={(e) => onChange({ brand: e.target.value.trim().toUpperCase() })}
        />
        <p className={UI.miniHelp}>建议用简写编码，例如 NP（某品牌）或 BR01。</p>
      </div>

      <div className={UI.fieldWrap}>
        <label className={UI.label}>物种（Species）</label>
        <select className={UI.select} value={state.species} onChange={(e) => onChange({ species: e.target.value })}>
          <option value="">未指定</option>
          <option value="C">C（猫）</option>
          <option value="D">D（狗）</option>
          <option value="O">O（其他）</option>
        </select>
        <p className={UI.miniHelp}>C=猫，D=狗；也可以自定义其他缩写。</p>
      </div>

      <div className={UI.fieldWrap}>
        <label className={UI.label}>口味 / 系列（Flavor）</label>
        <input
          className={UI.input}
          placeholder="例如 CH（鸡肉）、SA（鲑鱼）"
          value={state.flavor}
          onChange={(e) => onChange({ flavor: e.target.value.trim().toUpperCase() })}
        />
        <p className={UI.miniHelp}>建议用 2~4 位缩写，例如 CH、SA、TU。</p>
      </div>

      <div className={UI.fieldWrap}>
        <label className={UI.label}>重量 + 单位</label>
        <div className={UI.weightRow}>
          <input
            className={UI.weightInput}
            placeholder="重量"
            value={state.weight}
            onChange={(e) => onChange({ weight: e.target.value.trim().toUpperCase() })}
          />
          <select className={UI.unitSelect} value={state.unit} onChange={(e) => onChange({ unit: e.target.value })}>
            <option value="G">G</option>
            <option value="KG">KG</option>
            <option value="ML">ML</option>
            <option value="L">L</option>
          </select>
        </div>
        <p className={UI.miniHelp}>例如 500+G → 500G，2+KG → 2KG。</p>
      </div>

      <div className={UI.fieldWrap}>
        <label className={UI.label}>序号（Seq）</label>
        <input
          className={UI.input}
          placeholder="例如 B01、B02"
          value={state.seq}
          onChange={(e) => onChange({ seq: e.target.value.trim().toUpperCase() })}
        />
        <p className={UI.miniHelp}>支持前缀+数字，递增会保持前缀与位数。</p>
      </div>
    </div>
  );
};

export default SkuBuilderFields;
