// src/features/admin/warehouses/WarehouseDetailPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import { fetchWarehouseDetail, updateWarehouse } from "./api";
import type { WarehouseListItem } from "./types";

const WarehouseDetailPage: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const id = Number(warehouseId);
  const navigate = useNavigate();

  const canWrite = true;

  const [detail, setDetail] = useState<WarehouseListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);

  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [areaSqm, setAreaSqm] = useState<string>("");

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
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e?.message ?? "加载仓库失败");
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;
    if (!canWrite) return;

    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName) {
      setError("仓库名称不能为空");
      return;
    }
    if (!trimmedCode) {
      setError("仓库编码不能为空（必填）");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const parsedArea =
        areaSqm.trim() === "" ? null : Number(areaSqm.trim());
      if (parsedArea !== null && (!Number.isFinite(parsedArea) || parsedArea < 0)) {
        setError("仓库面积必须是 >= 0 的数字");
        setSaving(false);
        return;
      }

      const updated = await updateWarehouse(detail.id, {
        name: trimmedName,
        code: trimmedCode,
        active,
        address: address.trim() ? address.trim() : null,
        contact_name: contactName.trim() ? contactName.trim() : null,
        contact_phone: contactPhone.trim() ? contactPhone.trim() : null,
        area_sqm: parsedArea,
      });

      setDetail(updated);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!id) {
    return <div className="p-8 text-2xl text-red-600">缺少 warehouseId 参数</div>;
  }

  return (
    <div className="space-y-8 p-10">
      <PageTitle title="仓库编辑" description="仓库主数据维护（字体放大版）" />

      <button
        type="button"
        className="text-xl text-sky-700 underline"
        onClick={() => navigate(-1)}
      >
        ← 返回仓库管理
      </button>

      {error && (
        <div className="rounded-xl px-5 py-4 text-xl text-red-700 bg-red-50 border border-red-100">
          {error}
        </div>
      )}

      {loading && !detail ? (
        <div className="text-xl text-slate-500">加载中…</div>
      ) : !detail ? (
        <div className="text-xl text-slate-500">未找到仓库。</div>
      ) : (
        <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-10">
          <div className="text-2xl">
            <span className="mr-3 text-slate-500">ID:</span>
            <span className="font-semibold">{detail.id}</span>
          </div>

          <form
            className="grid grid-cols-1 gap-8 text-2xl md:grid-cols-2 lg:grid-cols-3"
            onSubmit={handleSave}
          >
            <div className="flex flex-col gap-3">
              <label className="text-xl text-slate-500">仓库名称 *</label>
              <input
                className="rounded-2xl border px-5 py-4 text-2xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xl text-slate-500">
                仓库编码（手动填写）*
              </label>
              <input
                className="rounded-2xl border px-5 py-4 text-2xl font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xl text-slate-500">状态</label>
              <select
                value={active ? "1" : "0"}
                onChange={(e) => setActive(e.target.value === "1")}
                className="rounded-2xl border px-5 py-4 text-2xl"
              >
                <option value="1">启用</option>
                <option value="0">停用</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-3">
              <label className="text-xl text-slate-500">地址</label>
              <input
                className="rounded-2xl border px-5 py-4 text-2xl"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xl text-slate-500">联系人</label>
              <input
                className="rounded-2xl border px-5 py-4 text-2xl"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xl text-slate-500">联系电话</label>
              <input
                className="rounded-2xl border px-5 py-4 text-2xl font-mono"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xl text-slate-500">仓库面积（㎡）</label>
              <input
                type="number"
                min={0}
                className="rounded-2xl border px-5 py-4 text-2xl font-mono"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
              />
            </div>

            <div className="flex items-center lg:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-slate-900 px-10 py-5 text-2xl text-white disabled:opacity-60"
              >
                {saving ? "保存中…" : "保存修改"}
              </button>
            </div>
          </form>

          <div className="text-base text-slate-500">
            说明：仓库不可删除（数据库已 RESTRICT），需要停用请改状态为“停用”。
          </div>
        </section>
      )}
    </div>
  );
};

export default WarehouseDetailPage;
