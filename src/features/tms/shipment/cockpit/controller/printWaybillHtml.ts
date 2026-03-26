// src/features/tms/shipment/cockpit/controller/printWaybillHtml.ts

export function buildPrintWaybillHtml(params: {
  packageNo: number;
  trackingNo: string;
  templateUrl: string;
  printData: Record<string, unknown>;
}): string {
  const { packageNo, trackingNo, templateUrl, printData } = params;

  const waybillCode =
    typeof printData["waybillCode"] === "string"
      ? printData["waybillCode"]
      : trackingNo;

  const recipient =
    printData["recipient"] &&
    typeof printData["recipient"] === "object" &&
    !Array.isArray(printData["recipient"])
      ? (printData["recipient"] as Record<string, unknown>)
      : null;

  const sender =
    printData["sender"] &&
    typeof printData["sender"] === "object" &&
    !Array.isArray(printData["sender"])
      ? (printData["sender"] as Record<string, unknown>)
      : null;

  const recipientAddress = recipient;

  const senderAddress =
    sender &&
    sender["address"] &&
    typeof sender["address"] === "object" &&
    !Array.isArray(sender["address"])
      ? (sender["address"] as Record<string, unknown>)
      : null;

  const recipientName =
    typeof recipient?.["name"] === "string" ? recipient["name"] : "-";
  const recipientPhone =
    typeof recipient?.["phone"] === "string" ? recipient["phone"] : "-";
  const senderName = typeof sender?.["name"] === "string" ? sender["name"] : "-";
  const senderPhone =
    typeof sender?.["phone"] === "string" ? sender["phone"] : "-";

  const recipientAddressText = [
    typeof recipientAddress?.["province"] === "string"
      ? recipientAddress["province"]
      : "",
    typeof recipientAddress?.["city"] === "string" ? recipientAddress["city"] : "",
    typeof recipientAddress?.["district"] === "string"
      ? recipientAddress["district"]
      : "",
    typeof recipientAddress?.["detail"] === "string"
      ? recipientAddress["detail"]
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const senderAddressText = [
    typeof senderAddress?.["province"] === "string"
      ? senderAddress["province"]
      : "",
    typeof senderAddress?.["city"] === "string" ? senderAddress["city"] : "",
    typeof senderAddress?.["district"] === "string"
      ? senderAddress["district"]
      : "",
    typeof senderAddress?.["detail"] === "string" ? senderAddress["detail"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const esc = (value: string): string =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>包裹${packageNo}面单</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #111827;
      }

      body {
        min-height: 100vh;
      }

      .page {
        width: 100%;
        min-height: 100vh;
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 8mm 0;
      }

      .sheet {
        width: 100%;
        max-width: 148mm;
        min-height: 100mm;
        border: 2px solid #111827;
        padding: 10mm 9mm;
        box-sizing: border-box;
        background: #fff;
      }

      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10mm;
        margin-bottom: 6mm;
      }

      .title {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: 1px;
        line-height: 1.2;
      }

      .meta {
        text-align: right;
        font-size: 12px;
        color: #475569;
        line-height: 1.4;
      }

      .waybill {
        margin-top: 2mm;
        padding: 4mm 4.5mm;
        border: 2px solid #111827;
        background: #f8fafc;
      }

      .waybill-label {
        font-size: 12px;
        color: #475569;
        margin-bottom: 1.5mm;
      }

      .waybill-code {
        font-size: 22px;
        font-weight: 700;
        line-height: 1.25;
        word-break: break-all;
      }

      .section {
        margin-top: 6mm;
      }

      .section-title {
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 3mm;
        letter-spacing: 0.5px;
      }

      .block {
        border: 1px solid #111827;
        padding: 4mm 4.5mm;
      }

      .line {
        margin: 2mm 0;
        font-size: 15px;
        line-height: 1.55;
        word-break: break-word;
      }

      .line strong {
        display: inline-block;
        min-width: 58px;
      }

      .address {
        font-size: 16px;
        font-weight: 600;
      }

      .route-box {
        margin-top: 6mm;
        border: 1px dashed #111827;
        padding: 5mm 4mm;
        text-align: center;
      }

      .route-code {
        font-family: "SFMono-Regular", Consolas, Monaco, monospace;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 2px;
        line-height: 1.35;
        word-break: break-all;
      }

      .footer {
        margin-top: 6mm;
        font-size: 11px;
        color: #64748b;
        word-break: break-all;
        line-height: 1.45;
      }

      @media print {
        html,
        body {
          background: #fff;
        }

        .page {
          padding: 0;
          min-height: auto;
        }

        .sheet {
          max-width: none;
          width: 148mm;
          margin: 0 auto;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="sheet">
        <div class="header">
          <div class="title">物流面单</div>
          <div class="meta">
            <div>包裹：${esc(String(packageNo))}</div>
            <div>模板打印预览</div>
          </div>
        </div>

        <div class="waybill">
          <div class="waybill-label">运单号</div>
          <div class="waybill-code">${esc(waybillCode)}</div>
        </div>

        <div class="section">
          <div class="section-title">收件信息</div>
          <div class="block">
            <div class="line"><strong>收件人</strong>${esc(recipientName)}</div>
            <div class="line"><strong>电话</strong>${esc(recipientPhone)}</div>
            <div class="line address"><strong>地址</strong>${esc(
              recipientAddressText || "-",
            )}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">发件信息</div>
          <div class="block">
            <div class="line"><strong>发件人</strong>${esc(senderName)}</div>
            <div class="line"><strong>电话</strong>${esc(senderPhone)}</div>
            <div class="line"><strong>地址</strong>${esc(senderAddressText || "-")}</div>
          </div>
        </div>

        <div class="route-box">
          <div class="route-code">${esc(waybillCode)}</div>
        </div>

        <div class="footer">
          模板地址：${esc(templateUrl)}
        </div>
      </div>
    </div>

    <script>
      window.focus();
      setTimeout(function () {
        window.print();
      }, 300);
    </script>
  </body>
</html>
  `;
}
