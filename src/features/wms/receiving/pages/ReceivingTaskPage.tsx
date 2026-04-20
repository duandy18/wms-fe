import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import ReceivingEditableBatchLines from "../components/ReceivingEditableBatchLines";
import ReceivingScanFeedback from "../components/ReceivingScanFeedback";
import ReceivingSubmitActions from "../components/ReceivingSubmitActions";
import ReceivingSubmitFeedback from "../components/ReceivingSubmitFeedback";
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
        description="基于已发布收货单执行实际收货；页面固定展开计划行对应的实际包装行，并按基础数量校验。"
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

          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">本次收货录入</div>

            <label className="block space-y-1 text-xs text-slate-600">
              <span>整单备注</span>
              <textarea
                className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                value={m.remark}
                onChange={(e) => m.setRemark(e.target.value)}
                placeholder="本次收货整单备注（可选）"
              />
            </label>

            <ReceivingScanFeedback
              scanError={m.scanError}
              scanSuccess={m.scanSuccess}
            />

            <ReceivingEditableBatchLines
              lines={m.task.lines}
              entriesByLineNo={m.entriesByLineNo}
              uomOptionsByLineNo={m.uomOptionsByLineNo}
              resolvingEntryKey={m.resolvingEntryKey}
              onResolveBarcode={m.resolveBarcodeAtEntry}
              showRemarkField={false}
              showLineHint={false}
              fixedRowsByUom={true}
              onChangeEntry={m.updateEntry}
            />

            <ReceivingSubmitFeedback
              submitError={m.submitError}
              submitSuccess={m.submitSuccess}
              lastSubmit={m.lastSubmit}
            />

            <ReceivingSubmitActions
              refreshLabel="刷新任务"
              submitLabel="提交收货作业"
              submitting={m.submitting}
              refreshDisabled={m.loading || m.submitting}
              submitDisabled={m.submitting || !m.canSubmit}
              onRefresh={m.reload}
              onSubmit={() => {
                if (!window.confirm(`确认提交收货作业：${m.task?.receipt_no}？`)) return;
                void m.submit();
              }}
            />
          </section>
        </>
      ) : null}
    </div>
  );
};

export default ReceivingTaskPage;
