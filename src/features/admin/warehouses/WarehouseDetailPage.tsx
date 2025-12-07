// src/features/admin/warehouses/WarehouseDetailPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import { fetchWarehouseDetail, updateWarehouse } from "./api";
import type { WarehouseListItem } from "./types";
import { useAuth } from "../../../app/auth/useAuth";

const WarehouseDetailPage: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const id = Number(warehouseId);
  const navigate = useNavigate();
  const { can } = useAuth();

  const canWrite = can("admin.stores");

  const [detail, setDetail] = useState<WarehouseListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 可编辑字段
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);

  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [areaSqm, setAreaSqm] = useState<string>(""); // 用字符串承载，方便空值处理

  // ---------------------------------------
  // 加载详情
  // ---------------------------------------
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetchWarehouseDetail(id)
      .then((data) => {
        setDetail(data);
        setName(data.name);
        setCode(data.code || "");
        setActive(data.active);

        setAddress(data.address || "");
        setContactName(data.contact_name || "");
        setContactPhone(data.contact_phone || "");
        setAreaSqm(
          typeof data.area_sqm === "number" && !Number.isNaN(data.area_sqm)
            ? String(data.area_sqm)
            : "",
        );
      })
      .catch((err: any) => {
        setError(err?.message ?? "加载仓库详情失败");
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;

    setSaving(true);
    setError(null);

    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError("仓库名称不能为空");
        setSaving(false);
        return;
      }

      const trimmedCode = code.trim() || null;
      const trimmedAddress = address.trim() || null;
      const trimmedContactName = contactName.trim() || null;
      const trimmedContactPhone = contactPhone.trim() || null;
      const parsedArea =
        areaSqm.trim() === "" ? null : Number(areaSqm.trim()) || 0;

      const updated = await updateWarehouse(detail.id, {
        name: trimmedName,
        code: trimmedCode,
        active,
        address: trimmedAddress,
        contact_name: trimmedContactName,
        contact_phone: trimmedContactPhone,
        area_sqm: parsedArea,
      });

      setDetail(updated);
    } catch (err: any) {
      setError(err?.message ?? "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!id) {
    return (
      <div className="p-4 text-sm text-red-600">缺少 warehouseId 参数</div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <PageTitle title="仓库详情" description="仓库主数据维护" />

      <button
        type="button"
        className="text-sm text-sky-700 underline"
        onClick={() => navigate(-1)}
      >
        ← 返回仓库管理
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}

      {loading && !detail ? (
        <div className="text-sm text-slate-500">加载中…</div>
      ) : !detail ? (
        <div className="text-sm text-slate-500">未找到仓库。</div>
      ) : (
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          {/* 查看部分 */}
          <div className="text-base">
            <span className="text-slate-500 mr-2">ID:</span>
            <span className="font-semibold">{detail.id}</span>
          </div>

          {/* 可编辑表单 */}
          {canWrite ? (
            <form
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-base"
              onSubmit={handleSave}
            >
              {/* 仓库名称 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-500">仓库名称</label>
                <input
                  className="border rounded-lg px-3 py-2 text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="主仓 / 备仓 …"
                />
              </div>

              {/* 仓库编码 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-500">
                  仓库编码（可选）
                </label>
                <input
                  className="border rounded-lg px-3 py-2 text-base"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="例如 WH1 / SH-MAIN / CODE-A"
                />
              </div>

              {/* 状态 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-500">状态</label>
                <select
                  value={active ? "1" : "0"}
                  onChange={(e) => setActive(e.target.value === "1")}
                  className="border rounded-lg px-3 py-2 text-base"
                >
                  <option value="1">启用</option>
                  <option value="0">停用</option>
                </select>
              </div>

              {/* 地址 */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm text-slate-500">地址（可选）</label>
                <input
                  className="border rounded-lg px-3 py-2 text-base"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例如 上海市 · 某某路 · 某某仓库园区 ..."
                />
              </div>

              {/* 联系人 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-500">
                  联系人（可选）
                </label>
                <input
                  className="border rounded-lg px-3 py-2 text-base"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="例如 张三"
                />
              </div>

              {/* 联系电话 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-500">
                  联系电话（可选）
                </label>
                <input
                  className="border rounded-lg px-3 py-2 text-base"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="手机 / 座机 / 分机号"
                />
              </div>

              {/* 仓库面积 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-500">
                  仓库面积（m²，可选）
                </label>
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 text-base"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  placeholder="例如 800"
                  min={0}
                />
              </div>

              <div className="flex items-center">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white text-base disabled:opacity-60"
                >
                  {saving ? "保存中…" : "保存修改"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-slate-500">
              无编辑权限（admin.stores）
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default WarehouseDetailPage;
