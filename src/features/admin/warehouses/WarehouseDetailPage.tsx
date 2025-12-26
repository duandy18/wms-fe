// src/features/admin/warehouses/WarehouseDetailPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import { fetchWarehouseDetail, updateWarehouse } from "./api";
import type { WarehouseListItem } from "./types";
import { UI } from "./ui";

const WarehouseDetailPage: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const id = Number(warehouseId);
  const navigate = useNavigate();

  // 前端不再做 can("admin.stores") 校验
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
        setAreaSqm(typeof data.area_sqm === "number" && !Number.isNaN(data.area_sqm) ? String(data.area_sqm) : "");
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e?.message ?? "加载仓库详情失败");
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;
    if (!canWrite) return;

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
      const parsedArea = areaSqm.trim() === "" ? null : Number(areaSqm.trim()) || 0;

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
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!id) {
    return <div className={UI.invalidParam}>缺少 warehouseId 参数</div>;
  }

  return (
    <div className={UI.page}>
      <PageTitle title="仓库详情" description="仓库主数据维护" />

      <button type="button" className={UI.backLink} onClick={() => navigate(-1)}>
        ← 返回仓库管理
      </button>

      {error ? <div className={UI.errBanner}>{error}</div> : null}

      {loading && !detail ? (
        <div className={UI.infoText}>加载中…</div>
      ) : !detail ? (
        <div className={UI.infoText}>未找到仓库。</div>
      ) : (
        <section className={UI.detailCard}>
          <div className={UI.detailIdLine}>
            <span className={UI.detailIdLabel}>ID:</span>
            <span className={UI.detailIdValue}>{detail.id}</span>
          </div>

          {canWrite ? (
            <form className={UI.formGrid} onSubmit={handleSave}>
              <div className={UI.field}>
                <label className={UI.label}>仓库名称</label>
                <input className={UI.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="主仓 / 备仓 …" />
              </div>

              <div className={UI.field}>
                <label className={UI.label}>仓库编码（可选）</label>
                <input className={UI.input} value={code} onChange={(e) => setCode(e.target.value)} placeholder="例如 WH1 / SH-MAIN / CODE-A" />
              </div>

              <div className={UI.field}>
                <label className={UI.label}>状态</label>
                <select value={active ? "1" : "0"} onChange={(e) => setActive(e.target.value === "1")} className={UI.select}>
                  <option value="1">启用</option>
                  <option value="0">停用</option>
                </select>
              </div>

              <div className={`${UI.field} md:col-span-2`}>
                <label className={UI.label}>地址（可选）</label>
                <input
                  className={UI.input}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例如 上海市 · 某某路 · 某某仓库园区 ..."
                />
              </div>

              <div className={UI.field}>
                <label className={UI.label}>联系人（可选）</label>
                <input className={UI.input} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="例如 张三" />
              </div>

              <div className={UI.field}>
                <label className={UI.label}>联系电话（可选）</label>
                <input className={UI.input} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="手机 / 座机 / 分机号" />
              </div>

              <div className={UI.field}>
                <label className={UI.label}>仓库面积（m²，可选）</label>
                <input
                  type="number"
                  className={UI.input}
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  placeholder="例如 800"
                  min={0}
                />
              </div>

              <div className="flex items-center">
                <button type="submit" disabled={saving} className={UI.btnSave}>
                  {saving ? "保存中…" : "保存修改"}
                </button>
              </div>
            </form>
          ) : (
            <div className={UI.noPerm}>无编辑权限（admin.stores）</div>
          )}
        </section>
      )}
    </div>
  );
};

export default WarehouseDetailPage;
