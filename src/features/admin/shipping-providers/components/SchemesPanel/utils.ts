// src/features/admin/shipping-providers/components/SchemesPanel/utils.ts

export function formatDt(v?: string | null) {
  if (!v) return "—";
  return v.replace("T", " ").replace("Z", "");
}

export function modeLabel(m: string | null | undefined): string {
  const v = (m ?? "").trim().toLowerCase();
  if (v === "flat") return "固定价";
  if (v === "step_over") return "首重+续重";
  return "票费+元/kg";
}

export function isTestSchemeName(name: string | null | undefined): boolean {
  const n = (name ?? "").trim();
  if (!n) return false;
  const u = n.toUpperCase();
  if (u.startsWith("DEV-") || u.startsWith("TEST-")) return true;
  if (u.includes("COPY") || u.includes("TEMPLATE") || u.includes("DEMO")) return true;
  return false;
}
