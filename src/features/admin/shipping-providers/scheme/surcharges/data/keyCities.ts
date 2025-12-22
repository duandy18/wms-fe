// src/features/admin/shipping-providers/scheme/surcharges/data/keyCities.ts
//
// 重点城市（Key Cities）白名单：各省首府 + 深圳（特区）
//
// 裁决：
// - 重点城市不能让用户自由手填，必须来自系统内置列表
// - 本期先用“省会/首府 + 深圳”作为最小可用集合
// - 后续扩展（例如：苏州/宁波/东莞/佛山等）只改本文件

export type ProvinceToCapitalMap = Record<string, string>;

// 省/自治区/直辖市 → 首府/首府城市
export const PROVINCE_CAPITAL_CITY: ProvinceToCapitalMap = {
  // 直辖市
  "北京市": "北京市",
  "天津市": "天津市",
  "上海市": "上海市",
  "重庆市": "重庆市",

  // 省
  "河北省": "石家庄市",
  "山西省": "太原市",
  "辽宁省": "沈阳市",
  "吉林省": "长春市",
  "黑龙江省": "哈尔滨市",
  "江苏省": "南京市",
  "浙江省": "杭州市",
  "安徽省": "合肥市",
  "福建省": "福州市",
  "江西省": "南昌市",
  "山东省": "济南市",
  "河南省": "郑州市",
  "湖北省": "武汉市",
  "湖南省": "长沙市",
  "广东省": "广州市",
  "海南省": "海口市",
  "四川省": "成都市",
  "贵州省": "贵阳市",
  "云南省": "昆明市",
  "陕西省": "西安市",
  "甘肃省": "兰州市",
  "青海省": "西宁市",

  // 自治区
  "内蒙古自治区": "呼和浩特市",
  "广西壮族自治区": "南宁市",
  "西藏自治区": "拉萨市",
  "宁夏回族自治区": "银川市",
  "新疆维吾尔自治区": "乌鲁木齐市",
};

// 特区/重点城市额外补充（本期仅加入深圳）
export const EXTRA_KEY_CITIES: string[] = ["深圳市"];

// 重点城市最终白名单（去重 + 稳定顺序）
export const KEY_CITIES: string[] = (() => {
  const set = new Set<string>();

  // 先按 map 插入顺序加入，保证排序稳定
  Object.values(PROVINCE_CAPITAL_CITY).forEach((c) => set.add(c));

  // 再加入额外城市
  EXTRA_KEY_CITIES.forEach((c) => set.add(c));

  return Array.from(set);
})();

// 便捷：生成“逗号分隔”的默认文本（用于输入框默认值/导入导出）
export function keyCitiesCsv(): string {
  return KEY_CITIES.join(", ");
}
