// src/features/admin/suppliers/suppliersHelpers.tsx

import React from "react";
import type { SupplierContact, SupplierContactRole } from "./api";

export type ApiErrorShape = { message?: string };
export const errMsg = (e: unknown, fallback: string) => (e as ApiErrorShape | undefined)?.message ?? fallback;

export function renderText(v: string | null | undefined) {
  return v && v.trim() ? v : "—";
}

export function renderLink(url: string | null | undefined) {
  const u = (url ?? "").trim();
  if (!u) return "—";
  const href = u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-sky-700 underline break-all">
      {u}
    </a>
  );
}

export function roleLabel(role: SupplierContactRole) {
  const r = (role || "other").toString();
  if (r === "purchase") return "采购";
  if (r === "billing") return "对账";
  if (r === "shipping") return "发货";
  if (r === "after_sales") return "售后";
  return "其他";
}

export function getPrimary(contacts: SupplierContact[]): SupplierContact | null {
  const primary = contacts.find((c) => c.is_primary);
  return primary ?? contacts[0] ?? null;
}

// ===== Draft helpers =====
export type ContactDraft = {
  id?: number;
  name: string;
  phone: string;
  email: string;
  wechat: string;
  role: SupplierContactRole;
  is_primary: boolean;
  active: boolean;
};

export const DEFAULT_CONTACT: ContactDraft = {
  name: "",
  phone: "",
  email: "",
  wechat: "",
  role: "purchase",
  is_primary: true,
  active: true,
};

export function setPrimaryInDraft(list: ContactDraft[], idx: number) {
  return list.map((c, i) => ({ ...c, is_primary: i === idx }));
}

export function validateContacts(list: ContactDraft[]): string | null {
  const cleaned = list.filter((c) => c.name.trim());
  if (cleaned.length === 0) return "至少填写一个联系人（可设为主联系人）";
  const primaryCount = cleaned.filter((c) => c.is_primary).length;
  if (primaryCount !== 1) return "必须且只能有一个主联系人";
  return null;
}

export function normalizeContacts(raw: unknown): SupplierContact[] {
  return Array.isArray(raw) ? (raw.filter(Boolean) as SupplierContact[]) : [];
}
