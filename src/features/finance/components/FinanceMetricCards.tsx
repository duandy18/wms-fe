import type { ReactNode } from "react";

export type FinanceMetricCard = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
};

type FinanceMetricCardsProps = {
  cards: FinanceMetricCard[];
};

export function FinanceMetricCards({ cards }: FinanceMetricCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="text-xs text-slate-500">{card.label}</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900">
            {card.value}
          </div>
          {card.hint && <div className="mt-1 text-[11px] text-slate-500">{card.hint}</div>}
        </div>
      ))}
    </section>
  );
}
