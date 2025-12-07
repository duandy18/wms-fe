// src/components/wmsdu/SectionCard.tsx
import React from "react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  className?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
};

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  className,
  headerRight,
  children,
}) => {
  return (
    <Card
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {description && (
            <p className="text-xs text-slate-500 max-w-2xl">{description}</p>
          )}
        </div>
        {headerRight && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {headerRight}
          </div>
        )}
      </div>

      <div>{children}</div>
    </Card>
  );
};
