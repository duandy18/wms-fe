// src/features/admin/suppliers/components/SuppliersTable.tsx

import React from "react";
import type { Supplier } from "../api";
import { getPrimary, renderLink, renderText, roleLabel } from "../suppliersHelpers";

export const SuppliersTable: React.FC<{
  suppliers: Supplier[];
  loading: boolean;

  TABLE: string;
  THEAD_ROW: string;
  TBODY_ROW: string;
  PAD_CELL: string;
  EMPTY_CELL: string;
  BODY: string;

  BTN: string;
  BADGE_OK: string;
  BADGE_BAD: string;

  onOpenEdit: (s: Supplier) => void;
}> = ({ suppliers, TABLE, THEAD_ROW, TBODY_ROW, PAD_CELL, EMPTY_CELL, BODY, BTN, BADGE_OK, BADGE_BAD, onOpenEdit }) => {
  function StatusBadge({ active }: { active: boolean }) {
    return <span className={active ? BADGE_OK : BADGE_BAD}>{active ? "合作中" : "已停用"}</span>;
  }

  return (
    <div className="overflow-x-auto">
      <table className={TABLE}>
        <thead className="bg-slate-50 border-b border-slate-300">
          <tr className={THEAD_ROW}>
            <th className={`${PAD_CELL} text-left w-20`}>ID</th>
            <th className={`${PAD_CELL} text-left w-[360px]`}>名称</th>
            <th className={`${PAD_CELL} text-left w-52`}>编码</th>
            <th className={`${PAD_CELL} text-left w-[360px]`}>公司网址</th>
            <th className={`${PAD_CELL} text-left w-52`}>联系人</th>
            <th className={`${PAD_CELL} text-left w-60`}>联系电话</th>
            <th className={`${PAD_CELL} text-left w-[360px]`}>邮箱</th>
            <th className={`${PAD_CELL} text-left w-52`}>微信</th>
            <th className={`${PAD_CELL} text-left w-32`}>联系人数</th>
            <th className={`${PAD_CELL} text-left w-36`}>状态</th>
            <th className={`${PAD_CELL} text-left w-32`}>操作</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.length === 0 && (
            <tr>
              <td colSpan={11} className={`${EMPTY_CELL} text-center text-slate-400 ${BODY}`}>
                暂无供应商记录
              </td>
            </tr>
          )}

          {suppliers.map((s) => {
            const primary = getPrimary(s.contacts ?? []);
            return (
              <tr key={s.id} className={`border-b border-slate-200 hover:bg-slate-50 ${TBODY_ROW}`}>
                <td className={`${PAD_CELL} font-mono`}>{s.id}</td>
                <td className={PAD_CELL}>{renderText(s.name)}</td>
                <td className={`${PAD_CELL} font-mono`}>{renderText(s.code)}</td>
                <td className={PAD_CELL}>{renderLink(s.website)}</td>

                <td className={PAD_CELL}>
                  {primary ? (
                    <div>
                      <div className="font-semibold">{renderText(primary.name)}</div>
                      <div className="text-slate-600 text-sm">
                        {roleLabel(primary.role)}
                        {primary.is_primary ? " · 主" : ""}
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

                <td className={`${PAD_CELL} font-mono`}>{primary ? renderText(primary.phone ?? null) : "—"}</td>
                <td className={PAD_CELL}>{primary ? renderText(primary.email ?? null) : "—"}</td>
                <td className={PAD_CELL}>{primary ? renderText(primary.wechat ?? null) : "—"}</td>
                <td className={`${PAD_CELL} font-mono`}>{(s.contacts ?? []).length}</td>
                <td className={PAD_CELL}>
                  <StatusBadge active={s.active} />
                </td>
                <td className={PAD_CELL}>
                  <button type="button" onClick={() => onOpenEdit(s)} className={BTN}>
                    编辑
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SuppliersTable;
