// src/features/admin/warehouses/WarehouseCreatePage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import { useAuth } from "../../../shared/useAuth";
import { createWarehouse } from "./api";

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return fallback;
}

export default function WarehouseCreatePage() {
  const navigate = useNavigate();

  // ✅ 合同：仓库管理属于配置域，写权限必须来自 /users/me permissions[]
  // 与 menuConfig.tsx 保持一致：仓库管理 requiredPermissions = ["config.store.write"]
  const { can } = useAuth();
  const canWrite = can("config.store.write");

  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);

  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [areaSqm, setAreaSqm] = useState<string>("");

  const dirtyKey = useMemo(
    () => [name, code, active, address, contactName, contactPhone, areaSqm].join("|"),
    [name, code, active, address, contactName, contactPhone, areaSqm],
  );

  // 用户继续编辑后自动隐藏“已创建”提示
  React.useEffect(() => {
    if (!ok) return;
    setOk(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirtyKey]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) {
      setErr("当前账号无写权限（config.store.write），不能创建仓库");
      return;
    }

    const n = name.trim();
    const c = code.trim();

    if (!n) return setErr("仓库名称不能为空");
    if (!c) return setErr("仓库编码不能为空（必填）");

    const parsedArea = areaSqm.trim() === "" ? null : Number(areaSqm.trim());
    if (parsedArea !== null && (!Number.isFinite(parsedArea) || parsedArea < 0)) {
      return setErr("仓库面积必须是 >= 0 的数字");
    }

    setSaving(true);
    setErr(null);
    setOk(false);

    try {
      await createWarehouse({
        name: n,
        code: c,
        active,
        address: address.trim() ? address.trim() : null,
        contact_name: contactName.trim() ? contactName.trim() : null,
        contact_phone: contactPhone.trim() ? contactPhone.trim() : null,
        area_sqm: parsedArea,
      });
      setOk(true);
      // 创建成功后回列表（专业后台习惯）
      navigate("/warehouses");
    } catch (e2: unknown) {
      setErr(toHumanError(e2, "创建仓库失败"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 p-10">
      <PageTitle title="创建仓库" />

      {!canWrite && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <div className="font-semibold">当前为只读模式</div>
          <div className="text-sm opacity-80">
            你没有该页面的写权限（config.store.write）。如需创建仓库，请联系管理员授权。
          </div>
        </div>
      )}

      {err && (
        <div className="rounded-xl px-5 py-4 text-xl text-red-700 bg-red-50 border border-red-100">{err}</div>
      )}

      <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-10">
        <form className="grid grid-cols-1 gap-6 text-lg md:grid-cols-2 lg:grid-cols-3" onSubmit={handleCreate}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-500">仓库名称 *</label>
            <input
              className="rounded-2xl border px-4 py-3 text-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving || !canWrite}
              placeholder="例如：上海主仓 / 北京冷链仓"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-500">仓库编码（手动填写）*</label>
            <input
              className="rounded-2xl border px-4 py-3 text-lg font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={saving || !canWrite}
              placeholder="例如：SH-MAIN / BJ-COLD / EAST-3PL"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-500">状态</label>
            <select
              value={active ? "1" : "0"}
              onChange={(e) => setActive(e.target.value === "1")}
              className="rounded-2xl border px-4 py-3 text-lg"
              disabled={saving || !canWrite}
            >
              <option value="1">启用</option>
              <option value="0">停用</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
            <label className="text-sm text-slate-500">地址</label>
            <input
              className="rounded-2xl border px-4 py-3 text-lg"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={saving || !canWrite}
              placeholder="例如：上海市 · 某某区 · 某某路"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-500">联系人</label>
            <input
              className="rounded-2xl border px-4 py-3 text-lg"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              disabled={saving || !canWrite}
              placeholder="例如：张三"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-500">联系电话</label>
            <input
              className="rounded-2xl border px-4 py-3 text-lg font-mono"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              disabled={saving || !canWrite}
              placeholder="手机/座机/分机"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-500">仓库面积（㎡）</label>
            <input
              type="number"
              min={0}
              className="rounded-2xl border px-4 py-3 text-lg font-mono"
              value={areaSqm}
              onChange={(e) => setAreaSqm(e.target.value)}
              disabled={saving || !canWrite}
              placeholder="例如：800"
            />
          </div>

          <div className="flex items-center lg:col-span-3 gap-4">
            <button
              type="submit"
              disabled={saving || !canWrite}
              className="rounded-2xl bg-slate-900 px-8 py-4 text-lg text-white disabled:opacity-60"
            >
              {saving ? "创建中…" : "创建仓库"}
            </button>

            <button
              type="button"
              disabled={saving}
              className="text-lg text-slate-700 underline disabled:opacity-60"
              onClick={() => navigate("/warehouses")}
            >
              返回列表
            </button>

            {ok && <span className="text-emerald-700 text-lg">✅ 已创建</span>}
          </div>
        </form>
      </section>
    </div>
  );
}
