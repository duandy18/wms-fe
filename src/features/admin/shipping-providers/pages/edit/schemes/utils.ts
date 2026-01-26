// src/features/admin/shipping-providers/pages/edit/schemes/utils.ts
export function badge(active: boolean) {
  return active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700";
}

export function isTestLikeName(name: string): boolean {
  const s = name.trim().toLowerCase();
  if (!s) return false;
  return (
    s.includes("test") ||
    s.includes("dev") ||
    s.includes("copy") ||
    s.includes("临时") ||
    s.includes("测试") ||
    s.includes("demo")
  );
}
