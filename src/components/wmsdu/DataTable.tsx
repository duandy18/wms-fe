// src/components/wmsdu/DataTable.tsx
import React from "react";
import { cn } from "../../lib/utils";

export type ColumnDef<T> = {
  key: string;
  header: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  getRowKey?: (row: T, index: number) => React.Key;
  emptyText?: string;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyText = "暂无数据。",
  className,
}: DataTableProps<T>) {
  if (!rows || rows.length === 0) {
    return (
      <div className={cn("text-sm text-slate-400", className)}>
        {emptyText}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto border border-slate-200 bg-white",
        className,
      )}
    >
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-2 text-xs font-semibold text-slate-600",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={getRowKey ? getRowKey(row, idx) : idx}
              className={cn(
                "border-b border-slate-100",
                idx % 2 === 1 && "bg-slate-50/40",
              )}
            >
              {columns.map((col) => {
                const value = (row as Record<string, unknown>)[col.key];
                return (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-2 text-sm text-slate-700",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                    )}
                  >
                    {col.render ? col.render(row) : (value as React.ReactNode)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
