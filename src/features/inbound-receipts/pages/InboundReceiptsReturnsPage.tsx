import React, { useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";

const InboundReceiptsReturnsPage: React.FC = () => {
  const [orderKey, setOrderKey] = useState("");
  const [remark, setRemark] = useState("");
  const [notice, setNotice] = useState("");

  function handlePreviewSource() {
    const key = orderKey.trim();
    if (!key) {
      setNotice("请先输入原订单号。");
      return;
    }

    setNotice(
      "当前先完成退货入库单前端结构设计。等 OMS 订单拉单、解析，以及 inbound 退货复合合同接通后，这里再按原订单号带出商品和数量，并生成退货入库单。",
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="退货入库单"
        description="退货入库单页面：上方输入原订单号并带出订单商品和数量；下方只展示当前这一张退货入库单。当前阶段先完成前端结构设计。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">退货来源生成区</div>
          <div className="text-xs text-slate-500">
            这里的终态是：输入原订单号，从 OMS 订单模块带出商品、数量、可退数量，再生成一张退货入库单。一张原订单只生成一张退货入库单，不与别的订单合单。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>原订单号</span>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={orderKey}
                onChange={(e) => setOrderKey(e.target.value)}
                placeholder="请输入原订单号"
              />
              <button
                type="button"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={handlePreviewSource}
              >
                查询原订单
              </button>
            </div>
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>平台</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value=""
              readOnly
              placeholder="后端接通后自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>店铺</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value=""
              readOnly
              placeholder="后端接通后自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>退货入库仓库</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value=""
              readOnly
              placeholder="后端接通后自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600">
            <span>订单状态</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value=""
              readOnly
              placeholder="后端接通后自动带出"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>来源说明</span>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value=""
              readOnly
              placeholder="后端接通后自动带出原订单基础信息"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">原订单商品与数量</div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">商品</th>
                  <th className="px-3 py-2 text-left">规格</th>
                  <th className="px-3 py-2 text-left">单位</th>
                  <th className="px-3 py-2 text-right">下单数量</th>
                  <th className="px-3 py-2 text-right">已发数量</th>
                  <th className="px-3 py-2 text-right">已退数量</th>
                  <th className="px-3 py-2 text-right">剩余可退数量</th>
                  <th className="px-3 py-2 text-right">本次生成数量</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-500">
                    当前为前端设计阶段。等 OMS 订单事实与 inbound 退货复合合同接通后，这里显示该原订单的商品与数量。
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-500">
            终态规则：商品、单位、数量都必须由原订单与可退数量带出，不允许手工补商品，不允许跨订单合单。
          </div>
        </div>

        <label className="block space-y-1 text-xs text-slate-600">
          <span>整单备注</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="整单备注（可选）"
          />
        </label>

        {notice ? (
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
            {notice}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            disabled
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            生成退货入库单
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">当前退货入库单</div>
          <div className="text-xs text-slate-500">
            这里的终态是：下方只展示当前这一张退货入库单，不展示列表，不展示汇总表。
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="text-xs text-slate-500">来源类型</div>
            <div className="text-sm text-slate-900">退货</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">原订单号</div>
            <div className="text-sm text-slate-900">{orderKey.trim() || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">状态</div>
            <div className="text-sm text-slate-900">待生成</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">备注</div>
            <div className="text-sm text-slate-900">{remark.trim() || "-"}</div>
          </div>
        </section>

        <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          当前为前端设计阶段。等 OMS 模块完成拉单与解析、并且 inbound 退货复合合同就绪后，下方改为展示当前这一张真实退货入库单，从单头到收货行。
        </section>
      </section>
    </div>
  );
};

export default InboundReceiptsReturnsPage;
