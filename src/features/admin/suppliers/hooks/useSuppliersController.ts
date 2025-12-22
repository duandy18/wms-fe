// src/features/admin/suppliers/hooks/useSuppliersController.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSupplier,
  createSupplierContact,
  deleteSupplierContact,
  fetchSuppliers,
  updateSupplier,
  updateSupplierContact,
  type Supplier,
  type SupplierContactRole,
} from "../api";
import {
  DEFAULT_CONTACT,
  errMsg,
  normalizeContacts,
  setPrimaryInDraft,
  validateContacts,
  type ContactDraft,
} from "../suppliersHelpers";

export type SupplierEditDraft = {
  id: number;
  name: string;
  code: string;
  website: string;
  active: boolean;
  contacts: ContactDraft[];
  deletedContactIds: number[];
};

export function useSuppliersController() {
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
  const [newContacts, setNewContacts] = useState<ContactDraft[]>([{ ...DEFAULT_CONTACT }]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // edit
  const [editing, setEditing] = useState<SupplierEditDraft | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await fetchSuppliers({
        active: onlyActive ? true : undefined,
        q: search.trim() || undefined,
      });

      const normalized = data.map((s) => ({
        ...s,
        contacts: normalizeContacts((s as unknown as { contacts?: unknown }).contacts),
      }));

      setSuppliers(normalized);
    } catch (e: unknown) {
      setSuppliers([]);
      setPageError(errMsg(e, "加载供应商失败"));
    } finally {
      setLoading(false);
    }
  }, [onlyActive, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const toolbarState = useMemo(() => ({ onlyActive, search, loading }), [onlyActive, search, loading]);

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
      const s = await createSupplier({ name, code, website, active: newActive });

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
      if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate") || msg.includes("重复")) {
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
            return primaryIdx >= 0 ? setPrimaryInDraft(contacts, primaryIdx) : setPrimaryInDraft(contacts, 0);
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
    const next = editing.contacts.map((c, i) => (i === idx ? { ...c, ...patch } : c));
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
    const fixed = next.length > 0 ? (hasPrimary ? next : setPrimaryInDraft(next, 0)) : [{ ...DEFAULT_CONTACT }];

    setEditing({ ...editing, contacts: fixed, deletedContactIds: deleted });
  }

  function editSetPrimary(idx: number) {
    if (!editing) return;
    setEditing({ ...editing, contacts: setPrimaryInDraft(editing.contacts, idx) });
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
      await updateSupplier(editing.id, { name, code, website, active: editing.active });

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
          await updateSupplierContact(c.id, { ...c, is_primary: false });
        } else {
          const { id, ...payload } = c;
          void id;
          await createSupplierContact(editing.id, { ...payload, is_primary: false });
        }
      }

      if (primary) {
        if (primary.id) {
          await updateSupplierContact(primary.id, { ...primary, is_primary: true });
        } else {
          const { id, ...payload } = primary;
          void id;
          await createSupplierContact(editing.id, { ...payload, is_primary: true });
        }
      }

      setEditing(null);
      await load();
    } catch (e2: unknown) {
      const msg = errMsg(e2, "保存失败");
      if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate") || msg.includes("重复")) {
        setEditError("供应商名称或编码已存在，请换一个再试。");
      } else {
        setEditError(msg);
      }
    } finally {
      setEditSaving(false);
    }
  }

  return {
    suppliers,
    loading,
    pageError,
    load,

    onlyActive,
    setOnlyActive,
    search,
    setSearch,
    toolbarState,

    newName,
    setNewName,
    newCode,
    setNewCode,
    newWebsite,
    setNewWebsite,
    newActive,
    setNewActive,
    newContacts,
    setNewContacts,
    creating,
    createError,
    handleCreate,

    editing,
    editSaving,
    editError,
    openEdit,
    closeEdit,
    setEditing,
    editSetContact,
    editAddContact,
    editRemoveContact,
    editSetPrimary,
    saveEdit,
  };
}
