// src/features/admin/suppliers/SuppliersListPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import {
  createSupplier,
  createSupplierContact,
  deleteSupplierContact,
  fetchSuppliers,
  updateSupplier,
  updateSupplierContact,
  type Supplier,
  type SupplierContact,
  type SupplierContactRole,
} from "./api";
import { UI } from "./ui";

type ApiErrorShape = { message?: string };
const errMsg = (e: unknown, fallback: string) =>
  (e as ApiErrorShape | undefined)?.message ?? fallback;

// ===== UI tokens（只影响本页面）=====
const TITLE: string = UI.title;
const H2: string = UI.h2;
const BODY: string = UI.body;
const SM: string = UI.small;

const CARD: string = UI.card;
const SUBCARD: string = UI.subcard;

const INPUT: string = UI.input;
const SELECT: string = UI.select;

const BTN: string = UI.btn;
const BTN_PRIMARY: string = UI.btnPrimary;
const BTN_DANGER: string = UI.btnDanger;

const ERROR_BOX: string = UI.errorBox;

const TABLE: string = UI.table;
const THEAD_ROW: string = UI.theadRow;
const TBODY_ROW: string = UI.tbodyRow;

// ✅ 修复 build：UI 不再提供 padCell / emptyCell，这里改为页面内自持有 tokens
const PAD_CELL: string = "px-4 py-3";
const EMPTY_CELL: string = "px-4 py-10";

const BADGE_OK: string = UI.badgeOk;
const BADGE_BAD: string = UI.badgeBad;

/* =========================
 * JSX 安全 helpers
 * ========================= */
function renderText(v: string | null | undefined) {
  return v && v.trim() ? v : "—";
}
function renderLink(url: string | null | undefined) {
  const u = (url ?? "").trim();
  if (!u) return "—";
  const href =
    u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sky-700 underline break-all"
    >
      {u}
    </a>
  );
}
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={active ? BADGE_OK : BADGE_BAD}>
      {active ? "合作中" : "已停用"}
    </span>
  );
}
function roleLabel(role: SupplierContactRole) {
  const r = (role || "other").toString();
  if (r === "purchase") return "采购";
  if (r === "billing") return "对账";
  if (r === "shipping") return "发货";
  if (r === "after_sales") return "售后";
  return "其他";
}
function getPrimary(contacts: SupplierContact[]): SupplierContact | null {
  const primary = contacts.find((c) => c.is_primary);
  return primary ?? contacts[0] ?? null;
}

/* =========================
 * UI types
 * ========================= */
type ContactDraft = {
  id?: number;
  name: string;
  phone: string;
  email: string;
  wechat: string;
  role: SupplierContactRole;
  is_primary: boolean;
  active: boolean;
};

type SupplierEditDraft = {
  id: number;
  name: string;
  code: string;
  website: string;
  active: boolean;
  contacts: ContactDraft[];
  deletedContactIds: number[];
};

const DEFAULT_CONTACT: ContactDraft = {
  name: "",
  phone: "",
  email: "",
  wechat: "",
  role: "purchase",
  is_primary: true,
  active: true,
};

function setPrimaryInDraft(list: ContactDraft[], idx: number) {
  return list.map((c, i) => ({ ...c, is_primary: i === idx }));
}
function validateContacts(list: ContactDraft[]): string | null {
  const cleaned = list.filter((c) => c.name.trim());
  if (cleaned.length === 0) return "至少填写一个联系人（可设为主联系人）";
  const primaryCount = cleaned.filter((c) => c.is_primary).length;
  if (primaryCount !== 1) return "必须且只能有一个主联系人";
  return null;
}

const SuppliersListPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [onlyActive, setOnlyActive] = useState(true);
  const [search, setSearch] = useState("");

  // create
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [newContacts, setNewContacts] = useState<ContactDraft[]>([
    { ...DEFAULT_CONTACT },
  ]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // edit
  const [editing, setEditing] = useState<SupplierEditDraft | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setPageError(null);
    try {
      const data = await fetchSuppliers({
        active: onlyActive ? true : undefined,
        q: search.trim() || undefined,
      });

      const normalized = data.map((s) => ({
        ...s,
        contacts: Array.isArray((s as any).contacts) ? (s as any).contacts : [],
      }));

      setSuppliers(normalized);
    } catch (e: unknown) {
      setSuppliers([]);
      setPageError(errMsg(e, "加载供应商失败"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const name = newName.trim();
    const code = newCode.trim();
    const website = newWebsite.trim() || null;

    if (!name) return setCreateError("供应商名称不能为空");
    if (!code) return setCreateError("供应商编码不能为空（必填）");

    const contactErr = validateContacts(newContacts);
    if (contactErr) return setCreateError(contactErr);

    setCreating(true);
    try {
      const s = await createSupplier({
        name,
        code,
        website,
        active: newActive,
      });

      const cleaned = newContacts
        .map((c) => ({
          name: c.name.trim(),
          phone: c.phone.trim() || null,
          email: c.email.trim() || null,
          wechat: c.wechat.trim() || null,
          role: (c.role || "other") as SupplierContactRole,
          is_primary: c.is_primary,
          active: c.active,
        }))
        .filter((c) => c.name);

      for (const c of cleaned) {
        await createSupplierContact(s.id, c);
      }

      setNewName("");
      setNewCode("");
      setNewWebsite("");
      setNewActive(true);
      setNewContacts([{ ...DEFAULT_CONTACT }]);

      await load();
    } catch (e2: unknown) {
      const msg = errMsg(e2, "创建供应商失败");
      if (
        msg.toLowerCase().includes("unique") ||
        msg.toLowerCase().includes("duplicate") ||
        msg.includes("重复")
      ) {
        setCreateError("供应商名称或编码已存在，请换一个再试。");
      } else {
        setCreateError(msg);
      }
    } finally {
      setCreating(false);
    }
  }

  function openEdit(s: Supplier) {
    const contacts: ContactDraft[] = (s.contacts ?? []).map((c) => ({
      id: c.id,
      name: c.name ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      wechat: c.wechat ?? "",
      role: c.role ?? "other",
      is_primary: !!c.is_primary,
      active: !!c.active,
    }));

    const draftContacts =
      contacts.length > 0
        ? (() => {
            const primaryIdx = contacts.findIndex((x) => x.is_primary);
            return primaryIdx >= 0
              ? setPrimaryInDraft(contacts, primaryIdx)
              : setPrimaryInDraft(contacts, 0);
          })()
        : [{ ...DEFAULT_CONTACT }];

    setEditError(null);
    setEditing({
      id: s.id,
      name: s.name,
      code: s.code,
      website: (s.website ?? "").toString(),
      active: s.active,
      contacts: draftContacts,
      deletedContactIds: [],
    });
  }

  function closeEdit() {
    if (editSaving) return;
    setEditing(null);
    setEditError(null);
  }

  function editSetContact(idx: number, patch: Partial<ContactDraft>) {
    if (!editing) return;
    const next = editing.contacts.map((c, i) =>
      i === idx ? { ...c, ...patch } : c,
    );
    setEditing({ ...editing, contacts: next });
  }

  function editAddContact() {
    if (!editing) return;
    const next = [...editing.contacts, { ...DEFAULT_CONTACT, is_primary: false }];
    setEditing({ ...editing, contacts: next });
  }

  function editRemoveContact(idx: number) {
    if (!editing) return;
    const c = editing.contacts[idx];
    const next = editing.contacts.filter((_, i) => i !== idx);

    const deleted = [...editing.deletedContactIds];
    if (c.id) deleted.push(c.id);

    const hasPrimary = next.some((x) => x.is_primary);
    const fixed =
      next.length > 0
        ? hasPrimary
          ? next
          : setPrimaryInDraft(next, 0)
        : [{ ...DEFAULT_CONTACT }];

    setEditing({ ...editing, contacts: fixed, deletedContactIds: deleted });
  }

  function editSetPrimary(idx: number) {
    if (!editing) return;
    setEditing({
      ...editing,
      contacts: setPrimaryInDraft(editing.contacts, idx),
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    const name = editing.name.trim();
    const code = editing.code.trim();
    const website = editing.website.trim() || null;

    if (!name) return setEditError("供应商名称不能为空");
    if (!code) return setEditError("供应商编码不能为空（必填）");

    const contactErr = validateContacts(editing.contacts);
    if (contactErr) return setEditError(contactErr);

    setEditSaving(true);
    setEditError(null);

    try {
      await updateSupplier(editing.id, {
        name,
        code,
        website,
        active: editing.active,
      });

      for (const id of editing.deletedContactIds) {
        await deleteSupplierContact(id);
      }

      const cleaned = editing.contacts
        .map((c) => ({
          id: c.id,
          name: c.name.trim(),
          phone: c.phone.trim() || null,
          email: c.email.trim() || null,
          wechat: c.wechat.trim() || null,
          role: (c.role || "other") as SupplierContactRole,
          is_primary: c.is_primary,
          active: c.active,
        }))
        .filter((c) => c.name);

      const primary = cleaned.find((c) => c.is_primary) ?? null;
      const others = cleaned.filter((c) => !c.is_primary);

      for (const c of others) {
        if (c.id) {
          await updateSupplierContact(c.id, {
            name: c.name,
            phone: c.phone,
            email: c.email,
            wechat: c.wechat,
            role: c.role,
            is_primary: false,
            active: c.active,
          });
        } else {
          await createSupplierContact(editing.id, {
            name: c.name,
            phone: c.phone,
            email: c.email,
            wechat: c.wechat,
            role: c.role,
            is_primary: false,
            active: c.active,
          });
        }
      }

      if (primary) {
        if (primary.id) {
          await updateSupplierContact(primary.id, {
            name: primary.name,
            phone: primary.phone,
            email: primary.email,
            wechat: primary.wechat,
            role: primary.role,
            is_primary: true,
            active: primary.active,
          });
        } else {
          await createSupplierContact(editing.id, {
            name: primary.name,
            phone: primary.phone,
            email: primary.email,
            wechat: primary.wechat,
            role: primary.role,
            is_primary: true,
            active: primary.active,
          });
        }
      }

      setEditing(null);
      await load();
    } catch (e2: unknown) {
      const msg = errMsg(e2, "保存失败");
      if (
        msg.toLowerCase().includes("unique") ||
        msg.toLowerCase().includes("duplicate") ||
        msg.includes("重复")
      ) {
        setEditError("供应商名称或编码已存在，请换一个再试。");
      } else {
        setEditError(msg);
      }
    } finally {
      setEditSaving(false);
    }
  }

  const toolbar = useMemo(() => {
    return (
      <div className={`flex flex-wrap items-center gap-4 ${BODY}`}>
        <label className={`inline-flex items-center gap-3 ${BODY}`}>
          <input
            type="checkbox"
            className="scale-125"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          仅显示合作中
        </label>

        <input
          className={INPUT}
          style={{ maxWidth: 520 }}
          placeholder="名称 / 编码 / 联系人 / 电话 搜索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="button" onClick={() => void load()} disabled={loading} className={BTN}>
          {loading ? "查询中…" : "刷新"}
        </button>
      </div>
    );
  }, [loading, onlyActive, search]);

  return (
    <div className="space-y-10 p-10">
      <PageTitle
        title="供应商主数据"
        description="字段与列表对齐：名称/编码/官网/联系人信息/状态。状态只能在编辑中修改。"
      />

      {/* 创建 */}
      <section className={`${CARD} space-y-8`}>
        <div className={`${H2} font-semibold text-slate-900`}>创建供应商</div>

        {createError && <div className={ERROR_BOX}>{createError}</div>}

        <form onSubmit={handleCreate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className={`${BODY} text-slate-700`}>供应商名称 *</label>
              <input
                className={INPUT}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={creating}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className={`${BODY} text-slate-700`}>供应商编码（手动填写）*</label>
              <input
                className={`${INPUT} font-mono`}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                disabled={creating}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className={`${BODY} text-slate-700`}>状态 *</label>
              <select
                className={SELECT}
                value={newActive ? "1" : "0"}
                onChange={(e) => setNewActive(e.target.value === "1")}
                disabled={creating}
              >
                <option value="1">合作中</option>
                <option value="0">已停用</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 md:col-span-4">
              <label className={`${BODY} text-slate-700`}>公司网址</label>
              <input
                className={INPUT}
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="https://example.com"
                disabled={creating}
              />
            </div>
          </div>

          <div className={`${SUBCARD} space-y-6`}>
            <div className="flex items-center justify-between">
              <div className={`${H2} font-semibold text-slate-900`}>联系人</div>
              <button
                type="button"
                className={BTN}
                onClick={() =>
                  setNewContacts((prev) => [
                    ...prev,
                    { ...DEFAULT_CONTACT, is_primary: false },
                  ])
                }
                disabled={creating}
              >
                + 添加联系人
              </button>
            </div>

            <div className="space-y-6">
              {newContacts.map((c, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className={`${BODY} text-slate-900`}>
                      联系人 #{idx + 1} {c.is_primary ? "（主联系人）" : ""}
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className={BTN}
                        onClick={() =>
                          setNewContacts((prev) => setPrimaryInDraft(prev, idx))
                        }
                        disabled={creating}
                      >
                        设为主联系人
                      </button>
                      {newContacts.length > 1 && (
                        <button
                          type="button"
                          className={BTN_DANGER}
                          onClick={() =>
                            setNewContacts((prev) => {
                              const next = prev.filter((_, i) => i !== idx);
                              return next.some((x) => x.is_primary)
                                ? next
                                : setPrimaryInDraft(next, 0);
                            })
                          }
                          disabled={creating}
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-3 md:col-span-2">
                      <label className={`${BODY} text-slate-700`}>姓名 *</label>
                      <input
                        className={INPUT}
                        value={c.name}
                        onChange={(e) =>
                          setNewContacts((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, name: e.target.value } : x,
                            ),
                          )
                        }
                        disabled={creating}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`${BODY} text-slate-700`}>角色</label>
                      <select
                        className={SELECT}
                        value={c.role}
                        onChange={(e) =>
                          setNewContacts((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, role: e.target.value } : x,
                            ),
                          )
                        }
                        disabled={creating}
                      >
                        <option value="purchase">采购</option>
                        <option value="billing">对账</option>
                        <option value="shipping">发货</option>
                        <option value="after_sales">售后</option>
                        <option value="other">其他</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`${BODY} text-slate-700`}>在职</label>
                      <select
                        className={SELECT}
                        value={c.active ? "1" : "0"}
                        onChange={(e) =>
                          setNewContacts((prev) =>
                            prev.map((x, i) =>
                              i === idx
                                ? { ...x, active: e.target.value === "1" }
                                : x,
                            ),
                          )
                        }
                        disabled={creating}
                      >
                        <option value="1">是</option>
                        <option value="0">否</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`${BODY} text-slate-700`}>电话</label>
                      <input
                        className={`${INPUT} font-mono`}
                        value={c.phone}
                        onChange={(e) =>
                          setNewContacts((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, phone: e.target.value } : x,
                            ),
                          )
                        }
                        disabled={creating}
                      />
                    </div>

                    <div className="flex flex-col gap-3 md:col-span-2">
                      <label className={`${BODY} text-slate-700`}>邮箱</label>
                      <input
                        className={INPUT}
                        value={c.email}
                        onChange={(e) =>
                          setNewContacts((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, email: e.target.value } : x,
                            ),
                          )
                        }
                        disabled={creating}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`${BODY} text-slate-700`}>微信</label>
                      <input
                        className={INPUT}
                        value={c.wechat}
                        onChange={(e) =>
                          setNewContacts((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, wechat: e.target.value } : x,
                            ),
                          )
                        }
                        disabled={creating}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={creating} className={BTN_PRIMARY}>
              {creating ? "创建中…" : "创建供应商"}
            </button>
          </div>
        </form>
      </section>

      {/* 列表 */}
      <section className={`${CARD} space-y-8`}>
        <div className="flex items-center justify-between gap-6">
          <div className={`${H2} font-semibold text-slate-900`}>供应商列表</div>
          {toolbar}
        </div>

        {pageError && <div className={ERROR_BOX}>{pageError}</div>}

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
                  <td
                    colSpan={11}
                    className={`${EMPTY_CELL} text-center text-slate-400 ${BODY}`}
                  >
                    暂无供应商记录
                  </td>
                </tr>
              )}

              {suppliers.map((s) => {
                const primary = getPrimary(s.contacts ?? []);
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-200 hover:bg-slate-50 ${TBODY_ROW}`}
                  >
                    <td className={`${PAD_CELL} font-mono`}>{s.id}</td>
                    <td className={PAD_CELL}>{renderText(s.name)}</td>
                    <td className={`${PAD_CELL} font-mono`}>{renderText(s.code)}</td>
                    <td className={PAD_CELL}>{renderLink(s.website)}</td>

                    <td className={PAD_CELL}>
                      {primary ? (
                        <div>
                          <div className="font-semibold">
                            {renderText(primary.name)}
                          </div>
                          <div className={`text-slate-600 ${SM}`}>
                            {roleLabel(primary.role)}
                            {primary.is_primary ? " · 主" : ""}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className={`${PAD_CELL} font-mono`}>
                      {primary ? renderText(primary.phone ?? null) : "—"}
                    </td>
                    <td className={PAD_CELL}>
                      {primary ? renderText(primary.email ?? null) : "—"}
                    </td>
                    <td className={PAD_CELL}>
                      {primary ? renderText(primary.wechat ?? null) : "—"}
                    </td>
                    <td className={`${PAD_CELL} font-mono`}>
                      {(s.contacts ?? []).length}
                    </td>
                    <td className={PAD_CELL}>
                      <StatusBadge active={s.active} />
                    </td>
                    <td className={PAD_CELL}>
                      <button type="button" onClick={() => openEdit(s)} className={BTN}>
                        编辑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 编辑弹窗 */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8">
          <div className="w-full max-w-6xl rounded-2xl bg-white p-10 shadow-xl space-y-8">
            <div className="flex items-center justify-between gap-6">
              <div className={`${TITLE} font-semibold text-slate-900`}>
                编辑供应商（ID：<span className="font-mono">{editing.id}</span>）
              </div>
              <button type="button" onClick={closeEdit} className={BTN} disabled={editSaving}>
                关闭
              </button>
            </div>

            {editError && <div className={ERROR_BOX}>{editError}</div>}

            <form onSubmit={saveEdit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-3 md:col-span-2">
                  <label className={`${BODY} text-slate-700`}>供应商名称 *</label>
                  <input className={INPUT} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} disabled={editSaving} />
                </div>

                <div className="flex flex-col gap-3">
                  <label className={`${BODY} text-slate-700`}>供应商编码（手动填写）*</label>
                  <input className={`${INPUT} font-mono`} value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} disabled={editSaving} />
                </div>

                <div className="flex flex-col gap-3">
                  <label className={`${BODY} text-slate-700`}>状态 *</label>
                  <select className={SELECT} value={editing.active ? "1" : "0"} onChange={(e) => setEditing({ ...editing, active: e.target.value === "1" })} disabled={editSaving}>
                    <option value="1">合作中</option>
                    <option value="0">已停用</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 md:col-span-4">
                  <label className={`${BODY} text-slate-700`}>公司网址</label>
                  <input className={INPUT} value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} disabled={editSaving} />
                </div>
              </div>

              <div className={`${SUBCARD} space-y-6`}>
                <div className="flex items-center justify-between">
                  <div className={`${H2} font-semibold text-slate-900`}>联系人</div>
                  <button type="button" className={BTN} onClick={editAddContact} disabled={editSaving}>
                    + 添加联系人
                  </button>
                </div>

                <div className="space-y-6">
                  {editing.contacts.map((c, idx) => (
                    <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className={`${BODY} text-slate-900`}>
                          联系人 #{idx + 1} {c.is_primary ? "（主联系人）" : ""}
                        </div>
                        <div className="flex items-center gap-4">
                          <button type="button" className={BTN} onClick={() => editSetPrimary(idx)} disabled={editSaving}>
                            设为主联系人
                          </button>
                          {editing.contacts.length > 1 && (
                            <button type="button" className={BTN_DANGER} onClick={() => editRemoveContact(idx)} disabled={editSaving}>
                              删除
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-3 md:col-span-2">
                          <label className={`${BODY} text-slate-700`}>姓名 *</label>
                          <input className={INPUT} value={c.name} onChange={(e) => editSetContact(idx, { name: e.target.value })} disabled={editSaving} />
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className={`${BODY} text-slate-700`}>角色</label>
                          <select className={SELECT} value={c.role} onChange={(e) => editSetContact(idx, { role: e.target.value })} disabled={editSaving}>
                            <option value="purchase">采购</option>
                            <option value="billing">对账</option>
                            <option value="shipping">发货</option>
                            <option value="after_sales">售后</option>
                            <option value="other">其他</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className={`${BODY} text-slate-700`}>在职</label>
                          <select className={SELECT} value={c.active ? "1" : "0"} onChange={(e) => editSetContact(idx, { active: e.target.value === "1" })} disabled={editSaving}>
                            <option value="1">是</option>
                            <option value="0">否</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className={`${BODY} text-slate-700`}>电话</label>
                          <input className={`${INPUT} font-mono`} value={c.phone} onChange={(e) => editSetContact(idx, { phone: e.target.value })} disabled={editSaving} />
                        </div>

                        <div className="flex flex-col gap-3 md:col-span-2">
                          <label className={`${BODY} text-slate-700`}>邮箱</label>
                          <input className={INPUT} value={c.email} onChange={(e) => editSetContact(idx, { email: e.target.value })} disabled={editSaving} />
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className={`${BODY} text-slate-700`}>微信</label>
                          <input className={INPUT} value={c.wechat} onChange={(e) => editSetContact(idx, { wechat: e.target.value })} disabled={editSaving} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={editSaving} className={BTN_PRIMARY}>
                  {editSaving ? "保存中…" : "保存修改"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersListPage;
