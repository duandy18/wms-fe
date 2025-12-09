// src/components/wmsdu/StandardTable.tsx
import React from "react";

type Align = "left" | "right" | "center";

export type ColumnDef<T> = {
  key: string;
  header: React.ReactNode;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  align?: Align;
  className?: string;
};

export type StandardTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => React.Key;
  emptyText?: React.ReactNode;
  dense?: boolean;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
  selectedKey?: React.Key | null;
  rowClassName?: (row: T, index: number) => string;
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
  rowClassName,
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
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

                const extraRowClass =
                  rowClassName?.(row, rowIndex) ?? "";

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
                      isSelected ? "bg-sky-50/70" : "",
                      extraRowClass,
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
                        col.render?.(row, rowIndex) ??
                        (row as Record<string, unknown>)[col.key];

                      const isNumeric =
                        col.align === "right" || typeof raw === "number";

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
                  className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
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
