import React, { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";

export interface ReceiveTaskOption {
  id: number;
  po_id: number | null;
  supplier_name: string | null;
  warehouse_id: number;
  status: string;
  total_expected: number;
  total_scanned: number;
  created_at: string;
}

interface Props {
  value?: number | null;
  onChange: (taskId: number | null) => void;
}

export const ReceiveTaskSelect: React.FC<Props> = ({
  value,
  onChange,
}) => {
  const [options, setOptions] = useState<ReceiveTaskOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      // 后端需要加：GET /receive-tasks?status=DRAFT
      const data = await apiGet<ReceiveTaskOption[]>(
        "/receive-tasks?status=DRAFT",
      );
      setOptions(data);
    } catch (err: any) {
      console.error("loadTasks failed:", err);
      setError(err?.message ?? "加载收货任务失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="text-xs text-slate-500">选择收货任务</label>
      <select
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v ? Number(v) : null);
        }}
        disabled={loading}
      >
        <option value="">
          {loading ? "加载中…" : "请选择收货任务"}
        </option>
        {options.map((t) => {
          const remain = t.total_expected - t.total_scanned;
          const label = `#${t.id} ${
            t.po_id ? `(PO-${t.po_id})` : "(手工任务)"
          } - ${t.supplier_name ?? "-"} | 未收: ${remain}`;
          return (
            <option key={t.id} value={t.id}>
              {label}
            </option>
          );
        })}
      </select>

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};
