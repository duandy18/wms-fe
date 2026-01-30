// src/features/ops/pricing-ops/components/OpsSectionCard.tsx
import type { ReactNode } from "react";

export function OpsSectionCard(props: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{props.title}</div>
          {props.subtitle ? (
            <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>{props.subtitle}</div>
          ) : null}
        </div>
        {props.right ? <div>{props.right}</div> : null}
      </div>

      <div style={{ marginTop: 12 }}>{props.children}</div>
    </div>
  );
}
