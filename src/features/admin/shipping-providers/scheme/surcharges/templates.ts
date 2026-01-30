// src/features/admin/shipping-providers/scheme/surcharges/templates.ts

/**
 * Surcharge（附加费）模板库
 *
 * 设计目标：
 * 1. 每个模板都对应真实物流合同中的“一句人话”
 * 2. 模板只表达【条件结构 + 计费方式】，不掺杂复杂计算逻辑
 * 3. 与后端 _cond_match / _calc_surcharge_amount 对齐
 *
 * 重要裁决：
 * - “重点城市”属于系统白名单（UI 提供默认），模板本身不内置长列表
 * - 避免模板变更导致历史数据对比混乱
 */

export type SurchargeTemplateKey =
  | "dest_city_flat" // ✅ 目的城市单票加价（最常用）
  | "dest_province_flat" // 目的省份单票加价
  | "remote_flat" // 偏远地区（省级）
  | "bulky_flat" // 大件附加费（flag）
  | "fuel_perkg" // 燃油附加费（按公斤）
  | "weight_table"; // 重量阶梯附加费

export const SURCHARGE_TEMPLATES: Record<
  SurchargeTemplateKey,
  {
    label: string;
    condition_json: string;
    amount_json: string;
    tip: string;
  }
> = {
  // =========================================================
  // ✅ 目的地类（单票加价，最符合当前“勾选区域→分组→填价”裁决）
  // =========================================================

  dest_city_flat: {
    label: "目的城市单票加价（dest.city + 固定价）",
    condition_json: `{"dest":{"city":[]}}`,
    amount_json: `{"kind":"flat","amount":1.5}`,
    tip: "适用于：指定城市单票附加费。重点城市列表由系统白名单提供默认值。",
  },

  dest_province_flat: {
    label: "目的省份单票加价（dest.province + 固定价）",
    condition_json: `{"dest":{"province":["海南省","青海省"]}}`,
    amount_json: `{"kind":"flat","amount":8.0}`,
    tip: "适用于：指定省份的单票附加费。",
  },

  remote_flat: {
    label: "偏远地区附加费（dest.province + 固定价）",
    condition_json: `{"dest":{"province":["新疆维吾尔自治区","西藏自治区"]}}`,
    amount_json: `{"kind":"flat","amount":20.0}`,
    tip: "适用于：偏远地区的高额单票附加费。",
  },

  // =========================================================
  // 业务属性类（由作业台 flags 触发）
  // =========================================================

  bulky_flat: {
    label: "大件附加费（flag_any + 固定价）",
    condition_json: `{"flag_any":["bulky"]}`,
    amount_json: `{"kind":"flat","amount":2.0}`,
    tip: "适用于：大件、不规则件。由作业台 flags 触发。",
  },

  // =========================================================
  // 重量相关（附加，不是主运价）
  // =========================================================

  fuel_perkg: {
    label: "燃油附加费（按公斤叠加）",
    condition_json: `{}`,
    amount_json: `{"kind":"per_kg","rate_per_kg":0.5}`,
    tip: "适用于：按计费重叠加的燃油费。计费重取整规则由方案 billable_weight_rule.rounding 决定（附加费不再单独配置 rounding）。",
  },

  weight_table: {
    label: "重量阶梯附加费（table）",
    condition_json: `{}`,
    amount_json: `{"kind":"table","rules":[{"max_kg":1,"amount":1.0},{"max_kg":3,"amount":2.0},{"max_kg":10,"amount":5.0}],"default_amount":8.0}`,
    tip: "适用于：按重量段给附加费（不连续时）。",
  },
};
