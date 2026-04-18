import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import ReceivingEditableBatchLines from "../components/ReceivingEditableBatchLines";
import ReceivingReadonlyLinesTable from "../components/ReceivingReadonlyLinesTable";
import ReceivingTaskInfoCard from "../components/ReceivingTaskInfoCard";
import { useReceivingTaskPage } from "../model/useReceivingTaskPage";

const ReceivingTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const m = useReceivingTaskPage();

  if (!m.isValid) {
    return (
      <div className="space-y-4 p-6">
        <PageTitle title="收货作业任务" description="无效的收货单号。" />
        <button
          type="button"
          className="text-xs text-slate-600 hover:text-slate-900"
          onClick={() => navigate("/receiving")}
        >
          ← 返回收货作业入口
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title={`收货作业 / ${m.receiptNo}`}
        description="基于已发布收货单执行实际收货；只读展示收货单信息与当前收货情况，并在下方录入本次收货批次子行。"
      />

      <button
        type="button"
        className="text-xs text-slate-600 hover:text-slate-900"
        onClick={() => navigate("/receiving")}
      >
        ← 返回收货作业入口
      </button>

      {m.loading ? <div className="text-sm text-slate-500">加载中…</div> : null}
      {m.error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {m.error}
        </div>
      ) : null}

      {m.task ? (
        <>
          <ReceivingTaskInfoCard task={m.task} remainingTotal={m.remainingTotal} />

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">整单备注</div>
            <textarea
              className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={m.remark}
              onChange={(e) => m.setRemark(e.target.value)}
              placeholder="本次整单备注（可选）"
            />
          </section>

          <ReceivingReadonlyLinesTable lines={m.task.lines} />

          <ReceivingEditableBatchLines
            lines={m.task.lines}
            entriesByLineNo={m.entriesByLineNo}
            onAddEntry={m.addEntry}
            onRemoveEntry={m.removeEntry}
            onChangeEntry={m.updateEntry}
          />

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            {m.submitError ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {m.submitError}
              </div>
            ) : null}

            {m.submitSuccess ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {m.submitSuccess}
              </div>
            ) : null}

            {m.lastSubmit ? (
              <div className="text-xs text-slate-500">
                最近提交：操作单 #{m.lastSubmit.id} / 操作时间 {m.lastSubmit.operated_at}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
                onClick={m.reload}
                disabled={m.loading || m.submitting}
              >
                刷新任务
              </button>
              <button
                type="button"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                disabled={m.submitting}
                onClick={() => {
                  if (!window.confirm(`确认提交收货作业：${m.task?.receipt_no}？`)) return;
                  void m.submit();
                }}
              >
                {m.submitting ? "提交中…" : "提交收货作业"}
              </button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default ReceivingTaskPage;
