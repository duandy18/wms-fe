import React from "react";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getComboComponents(payload: unknown): unknown[] {
  const record = asRecord(payload);
  if (!record) return [];

  const rawComponents = record.combo_components;
  if (!Array.isArray(rawComponents)) return [];

  return rawComponents;
}

function componentLabel(component: unknown, index: number): string {
  const record = asRecord(component);
  if (!record) return `组合成分 ${index + 1}`;

  const candidate =
    record.sku_name ??
    record.goods_name ??
    record.outer_id ??
    record.platform_sku_id ??
    record.sku_id;

  return typeof candidate === "string" && candidate.trim()
    ? candidate
    : `组合成分 ${index + 1}`;
}

export const ComboComponentsView: React.FC<{ payload: unknown }> = ({ payload }) => {
  const components = getComboComponents(payload);

  if (!components.length) {
    return <span className="text-xs text-slate-400">无组合成分</span>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-amber-700">
        平台原生组合信息，尚未映射到内部 SKU
      </div>
      <div className="space-y-1">
        {components.map((component, index) => (
          <details
            key={`${componentLabel(component, index)}-${index}`}
            className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"
          >
            <summary className="cursor-pointer text-xs font-medium text-amber-800">
              {componentLabel(component, index)}
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto text-xs leading-5 text-amber-950">
{JSON.stringify(component, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </div>
  );
};
