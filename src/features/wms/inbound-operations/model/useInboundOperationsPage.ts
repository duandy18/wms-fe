import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useInboundOperationsPage() {
  const navigate = useNavigate();
  const [receiptNoInput, setReceiptNoInput] = useState("");
  const [error, setError] = useState("");

  const goToTask = useCallback(() => {
    const receiptNo = receiptNoInput.trim();
    if (!receiptNo) {
      setError("请输入入库任务号");
      return;
    }
    setError("");
    navigate(`/inbound-operations/${encodeURIComponent(receiptNo)}`);
  }, [navigate, receiptNoInput]);

  return {
    receiptNoInput,
    setReceiptNoInput,
    error,
    goToTask,
  };
}
