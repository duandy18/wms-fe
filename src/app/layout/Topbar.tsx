// src/app/layout/Topbar.tsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../shared/useAuth";
import { apiPost } from "../../lib/api";

type ChangePasswordErrorShape = {
  body?: { detail?: string };
  message?: string;
};

type Breadcrumb = { section: string; page: string };

export function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  async function submitPasswordChange() {
    setPwdError(null);
    if (!oldPwd.trim() || !newPwd.trim()) {
      setPwdError("旧密码和新密码不能为空");
      return;
    }

    setSaving(true);
    try {
      await apiPost("/users/change-password", {
        old_password: oldPwd,
        new_password: newPwd,
      });
      alert("密码修改成功");
      setShowPwdModal(false);
      setOldPwd("");
      setNewPwd("");
    } catch (err: unknown) {
      const e = err as ChangePasswordErrorShape;
      const detail =
        e?.body?.detail ?? e?.message ?? "修改失败，请检查旧密码是否正确";
      setPwdError(detail);
    } finally {
      setSaving(false);
    }
  }

  // ===== 面包屑（分区 / 页面）=====
  const breadcrumb = useMemo<Breadcrumb>(() => {
    const p = location.pathname;

    const rules: Array<{ prefix: string; value: Breadcrumb }> = [
      // 入库
      {
        prefix: "/purchase-orders/new-v2",
        value: { section: "入库", page: "采购单生成" },
      },
      {
        prefix: "/purchase-orders/overview",
        value: { section: "入库", page: "采购概览" },
      },
      {
        prefix: "/purchase-orders",
        value: { section: "入库", page: "采购概览" },
      },
      { prefix: "/inbound", value: { section: "入库", page: "收货入库" } },
      {
        prefix: "/purchase-orders/reports",
        value: { section: "入库", page: "采购统计" },
      },

      // 订单出库
      {
        prefix: "/outbound/pick-tasks",
        value: { section: "订单出库", page: "拣货" },
      },
      {
        prefix: "/outbound/dashboard",
        value: { section: "订单出库", page: "出库看板" },
      },

      // 物流
      {
        prefix: "/tms/pricing-templates/",
        value: { section: "物流", page: "运价工作台" },
      },
      {
        prefix: "/tms/providers/new",
        value: { section: "物流", page: "新建快递网点" },
      },
      {
        prefix: "/tms/providers",
        value: { section: "物流", page: "快递网点" },
      },
      {
        prefix: "/tms/pricing",
        value: { section: "物流", page: "服务关系管理" },
      },
      {
        prefix: "/tms/dispatch",
        value: { section: "物流", page: "发货作业" },
      },
      {
        prefix: "/tms/reports",
        value: { section: "物流", page: "运输报表" },
      },
      {
        prefix: "/tms/records",
        value: { section: "物流", page: "运输台帐" },
      },

      // 仓内作业
      { prefix: "/count", value: { section: "仓内作业", page: "盘点" } },
      {
        prefix: "/outbound/internal-outbound",
        value: { section: "仓内作业", page: "内部出库" },
      },

      // 库存
      { prefix: "/snapshot", value: { section: "库存", page: "库存现状" } },
      {
        prefix: "/inventory/ledger",
        value: { section: "库存", page: "库存台账" },
      },

      // 财务分析
      { prefix: "/finance", value: { section: "财务分析", page: "财务分析" } },

      // 主数据
      {
        prefix: "/admin/items",
        value: { section: "主数据", page: "商品主数据" },
      },
      {
        prefix: "/admin/suppliers",
        value: { section: "主数据", page: "供应商主数据" },
      },
      {
        prefix: "/warehouses",
        value: { section: "主数据", page: "仓库管理" },
      },
      { prefix: "/stores", value: { section: "主数据", page: "店铺管理" } },

      // 权限与账号
      {
        prefix: "/iam/users",
        value: { section: "权限与账号", page: "用户管理" },
      },
      {
        prefix: "/iam/roles",
        value: { section: "权限与账号", page: "角色管理" },
      },
      {
        prefix: "/iam/perms",
        value: { section: "权限与账号", page: "权限字典" },
      },
      {
        prefix: "/admin/users-admin",
        value: { section: "权限与账号", page: "用户管理" },
      },
    ];

    const hit = rules
      .filter((r) => p === r.prefix || p.startsWith(r.prefix + "/"))
      .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.value;

    return hit ?? { section: "首页", page: "概览" };
  }, [location.pathname]);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-900">
            {breadcrumb.section}
          </span>
          <span className="text-lg text-slate-400">/</span>
          <span className="text-lg text-slate-700">{breadcrumb.page}</span>
        </div>

        <div className="flex items-center gap-6 text-slate-800">
          <button title="通知">🔔</button>
          <button title="帮助">❔</button>

          <div className="group relative">
            <button className="flex items-center gap-1 font-semibold text-slate-900">
              <span>{user?.username ?? "未登录"}</span>
              <span className="text-sm">▼</span>
            </button>

            <div className="absolute right-0 z-20 mt-1 hidden rounded border bg-white shadow group-hover:block">
              <button
                className="block w-full px-4 py-2 hover:bg-slate-100"
                onClick={() => setShowPwdModal(true)}
              >
                修改密码
              </button>
              <button
                className="block w-full px-4 py-2 hover:bg-slate-100"
                onClick={logout}
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[420px] space-y-4 rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold">修改密码</h3>
            {pwdError && <div className="text-xs text-red-600">{pwdError}</div>}
            <input
              className="w-full border px-3 py-2"
              type="password"
              placeholder="旧密码"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
            />
            <input
              className="w-full border px-3 py-2"
              type="password"
              placeholder="新密码"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPwdModal(false)}>取消</button>
              <button onClick={submitPasswordChange}>
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
