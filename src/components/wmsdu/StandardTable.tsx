// src/components/wmsdu/StandardTable.tsx
import React from "react";

type Align = "left" | "right" | "center";

export type ColumnDef<T> = {
  /** 列唯一标识，用于 key / 自定义 class */
  key: keyof T & string;
  /** 表头显示文本 */
  header: React.ReactNode;
  /** 自定义单元格渲染，不传则默认渲染 row[key] */
  render?: (row: T, rowIndex: number) => React.ReactNode;
  /** 对齐方式：默认 left；数字列建议设置为 "right" */
  align?: Align;
  /** 附加 className（如隐藏列等） */
  className?: string;
};

export type StandardTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  /** 行 key，默认为 index */
  getRowKey?: (row: T, index: number) => React.Key;
  /** 空数据时的占位文案 */
  emptyText?: React.ReactNode;
  /** 是否紧凑模式（行高更小） */
  dense?: boolean;
  /** 可选的标题区域（卡片顶部） */
  title?: React.ReactNode;
  /** 右侧操作区域（标题行右侧） */
  actions?: React.ReactNode;
  /** 可选 footer（比如合计行），会自动用统一样式包裹 */
  footer?: React.ReactNode;
  /** 行点击（比如列表 → 详情） */
  onRowClick?: (row: T, index: number) => void;
  /** 当前选中行的 key，用于高亮 */
  selectedKey?: React.Key | null;
};

/**
 * StandardTable
 *
 * 统一表格视觉：
 * - 卡片容器：白底 + 圆角 + 阴影
 * - 表头：14px / 粗体 / 浅灰背景 / 下边线
 * - 行：奇偶行 zebra + hover 高亮
 * - 数字列：font-mono + text-right + tabular-nums
 */
export function StandardTable<T>({
  columns,
  data,
  getRowKey,
  emptyText = "暂无数据",
  dense = false,
  title,
  actions,
  footer,
  onRowClick,
  selectedKey = null,
}: StandardTableProps<T>) {
  const rowKey = getRowKey ?? ((_row, idx) => idx);

  const thBase =
    "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50";
  const tdBase =
    "px-4 border-b border-slate-100 text-sm text-slate-800 align-middle";

  const trBase = dense ? "h-8" : "h-10";

  const numericCell =
    "text-right font-mono tabular-nums text-slate-900";

  const alignClass = (align: Align | undefined) => {
    switch (align) {
      case "right":
        return "text-right";
      case "center":
        return "text-center";
      case "left":
      default:
        return "text-left";
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80">
          <div className="text-sm font-semibold text-slate-800">
            {title}
          </div>
          {actions && (
            <div className="flex items-center gap-2 text-xs">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    thBase,
                    alignClass(col.align),
                    col.className ?? "",
                  ]
                    .join(" ")
                    .trim()}
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const key = rowKey(row, rowIndex);
                const isSelected =
                  selectedKey != null && selectedKey === key;

                return (
                  <tr
                    key={key}
                    className={[
                      trBase,
                      rowIndex % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50/40",
                      "transition-colors",
                      onRowClick
                        ? "cursor-pointer hover:bg-sky-50"
                        : "hover:bg-slate-50",
                      isSelected
                        ? "bg-sky-50/70"
                        : "",
                    ]
                      .join(" ")
                      .trim()}
                    onClick={
                      onRowClick
                        ? () => onRowClick(row, rowIndex)
                        : undefined
                    }
                  >
                    {columns.map((col) => {
                      const raw =
                        col.render?.(row, rowIndex) ?? row[col.key];

                      const isNumeric =
                        col.align === "right" ||
                        typeof raw === "number";

                      const baseClass = [
                        tdBase,
                        alignClass(col.align),
                        col.className ?? "",
                      ]
                        .join(" ")
                        .trim();

                      return (
                        <td
                          key={col.key}
                          className={
                            isNumeric
                              ? `${baseClass} ${numericCell}`
                              : baseClass
                          }
                        >
                          {raw as React.ReactNode}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>

          {footer && (
            <tfoot>
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-sm font-semibold text-slate-800"
                >
                  {footer}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
