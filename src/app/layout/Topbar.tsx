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
      const detail = e?.body?.detail ?? e?.message ?? "修改失败，请检查旧密码是否正确";
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
      { prefix: "/purchase-orders/new-v2", value: { section: "入库", page: "采购单生成" } },
      { prefix: "/purchase-orders/overview", value: { section: "入库", page: "采购概览" } },
      { prefix: "/purchase-orders", value: { section: "入库", page: "采购概览" } },
      { prefix: "/inbound", value: { section: "入库", page: "收货入库" } },
      { prefix: "/purchase-orders/reports", value: { section: "入库", page: "采购统计" } },

      // 订单出库
      { prefix: "/orders", value: { section: "订单出库", page: "订单选仓" } },
      { prefix: "/outbound/pick-tasks", value: { section: "订单出库", page: "拣货" } },
      { prefix: "/outbound/ship", value: { section: "订单出库", page: "发货" } },
      { prefix: "/orders/stats", value: { section: "订单出库", page: "订单统计" } },
      { prefix: "/outbound/dashboard", value: { section: "订单出库", page: "出库看板" } },
      { prefix: "/shipping/reports", value: { section: "订单出库", page: "发货成本报表" } },
      { prefix: "/shipping/record", value: { section: "订单出库", page: "发货账本详情" } },

      // 仓内作业
      { prefix: "/count", value: { section: "仓内作业", page: "盘点" } },
      { prefix: "/outbound/internal-outbound", value: { section: "仓内作业", page: "内部出库" } },

      // 库存
      { prefix: "/snapshot", value: { section: "库存", page: "库存现状" } },
      { prefix: "/inventory/ledger", value: { section: "库存", page: "库存台账" } },

      // 财务分析
      { prefix: "/finance", value: { section: "财务分析", page: "财务分析" } },

      // 主数据
      { prefix: "/admin/items", value: { section: "主数据", page: "商品主数据" } },
      { prefix: "/admin/suppliers", value: { section: "主数据", page: "供应商主数据" } },

      // ✅ 快递网点（主数据归位）
      { prefix: "/admin/shipping-providers", value: { section: "主数据", page: "快递网点" } },
      // ✅ 别名入口（兼容）：保持同一面包屑语义
      { prefix: "/logistics/providers", value: { section: "主数据", page: "快递网点" } },

      { prefix: "/warehouses", value: { section: "主数据", page: "仓库管理" } },
      { prefix: "/stores", value: { section: "主数据", page: "店铺管理" } },

      // 权限与账号
      { prefix: "/iam/users", value: { section: "权限与账号", page: "用户管理" } },
      { prefix: "/iam/roles", value: { section: "权限与账号", page: "角色管理" } },
      { prefix: "/iam/perms", value: { section: "权限与账号", page: "权限字典" } },
      { prefix: "/admin/users-admin", value: { section: "权限与账号", page: "用户管理" } },

      // 运维中心 · 链路调试（去掉“后端调试”前缀）
      { prefix: "/ops/dev/orders", value: { section: "运维中心", page: "订单链路" } },
      { prefix: "/ops/dev/pick", value: { section: "运维中心", page: "拣货链路" } },
      { prefix: "/ops/dev/inbound", value: { section: "运维中心", page: "入库链路" } },
      { prefix: "/ops/dev/count", value: { section: "运维中心", page: "盘点链路" } },
      { prefix: "/ops/dev/platform", value: { section: "运维中心", page: "平台 / 店铺工具" } },

      // 运维中心
      { prefix: "/ops/health", value: { section: "运维中心", page: "系统状态" } },
      { prefix: "/ops/tasks", value: { section: "运维中心", page: "后台任务" } },
      { prefix: "/ops", value: { section: "运维中心", page: "运维概览" } },

      { prefix: "/trace", value: { section: "运维中心", page: "Trace Studio" } },
      { prefix: "/tools/ledger", value: { section: "运维中心", page: "Ledger Studio" } },
      { prefix: "/tools/stocks", value: { section: "运维中心", page: "Inventory Studio" } },

      // /dev 兼容入口 → 默认订单链路
      { prefix: "/dev", value: { section: "运维中心", page: "订单链路" } },
    ];

    const hit = rules
      .filter((r) => p === r.prefix || p.startsWith(r.prefix + "/"))
      .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.value;

    return hit ?? { section: "首页", page: "概览" };
  }, [location.pathname]);

  return (
    <>
      <header className="h-16 border-b bg-white flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-900">{breadcrumb.section}</span>
          <span className="text-slate-400 text-lg">/</span>
          <span className="text-lg text-slate-700">{breadcrumb.page}</span>
        </div>

        <div className="flex items-center gap-6 text-slate-800">
          <button title="通知">🔔</button>
          <button title="帮助">❔</button>

          <div className="relative group">
            <button className="flex items-center gap-1 font-semibold text-slate-900">
              <span>{user?.username ?? "未登录"}</span>
              <span className="text-sm">▼</span>
            </button>

            <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border rounded shadow z-20">
              <button className="block w-full px-4 py-2 hover:bg-slate-100" onClick={() => setShowPwdModal(true)}>
                修改密码
              </button>
              <button className="block w-full px-4 py-2 hover:bg-slate-100" onClick={logout}>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 修改密码弹窗（原样保留） */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[420px] space-y-4">
            <h3 className="text-lg font-semibold">修改密码</h3>
            {pwdError && <div className="text-xs text-red-600">{pwdError}</div>}
            <input
              className="border px-3 py-2 w-full"
              type="password"
              placeholder="旧密码"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
            />
            <input
              className="border px-3 py-2 w-full"
              type="password"
              placeholder="新密码"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPwdModal(false)}>取消</button>
              <button onClick={submitPasswordChange}>{saving ? "保存中…" : "保存"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
