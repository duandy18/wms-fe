import React from "react";
import InboundReceiptsPageShell from "../components/InboundReceiptsPageShell";

const InboundReceiptsSummaryPage: React.FC = () => {
  return (
    <InboundReceiptsPageShell
      title="入库单汇总"
      description="查看全部入库单任务，先接列表、详情、进度与发布。"
    />
  );
};

export default InboundReceiptsSummaryPage;
