import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import { useInboundOperationsPage } from "../model/useInboundOperationsPage";

const InboundOperationsPage: React.FC = () => {
  const m = useInboundOperationsPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="收货操作"
        description="当前后端先按入库任务号读取 RELEASED 任务；输入任务号后进入收货操作页。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-600">
          请输入入库任务号（例如 IR-PO-11-20260417092510-657756）。
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            placeholder="请输入入库任务号"
            value={m.receiptNoInput}
            onChange={(e) => m.setReceiptNoInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                m.goToTask();
              }
            }}
          />
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
            onClick={m.goToTask}
          >
            进入任务
          </button>
        </div>

        {m.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.error}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default InboundOperationsPage;
