// src/features/admin/warehouses/WarehouseDetailPage.tsx

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import { WarehouseBasicInfoCard } from "./detail/WarehouseBasicInfoCard";
import { WarehouseServiceProvincesCard } from "./detail/WarehouseServiceProvincesCard";
import { WarehouseServiceCitiesCard } from "./detail/WarehouseServiceCitiesCard";
import { WarehouseShippingProvidersCard } from "./detail/WarehouseShippingProvidersCard";
import { UI } from "./detail/ui";
import { useWarehouseDetailModel } from "./detail/useWarehouseDetailModel";
import { useWarehouseServiceProvincesModel } from "./detail/useWarehouseServiceProvincesModel";
import { useWarehouseServiceCitiesModel } from "./detail/useWarehouseServiceCitiesModel";
import { useWarehouseServiceCitySplitProvincesModel } from "./detail/useWarehouseServiceCitySplitProvincesModel";
import { useWarehouseShippingProvidersModel } from "./detail/useWarehouseShippingProvidersModel";

const WarehouseDetailPage: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const id = Number(warehouseId);
  const navigate = useNavigate();

  const canWrite = true;

  const m = useWarehouseDetailModel({ warehouseId: id, canWrite });

  const sp = useWarehouseServiceProvincesModel({ warehouseId: id, canWrite });
  const sc = useWarehouseServiceCitiesModel({ warehouseId: id, canWrite });

  const split = useWarehouseServiceCitySplitProvincesModel({ canWrite });

  const carriers = useWarehouseShippingProvidersModel({ warehouseId: id, canWrite });

  function jumpToCities() {
    const el = document.getElementById("service-cities-card");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!id) {
    return <div className="p-8 text-2xl text-red-600">缺少 warehouseId 参数</div>;
  }

  return (
    <div className={UI.pageWrap}>
      <div className="flex items-center justify-between gap-4">
        <PageTitle title={`仓库详情 · #${id}`} />
        <button
          type="button"
          onClick={() => navigate("/warehouses")}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          返回仓库列表
        </button>
      </div>

      {m.saveOk && (
        <div className={UI.okBanner}>
          <div className="font-semibold">✅ 仓库信息已保存</div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={UI.btnLink} onClick={() => navigate("/warehouses")}>
              返回仓库列表
            </button>
            <button type="button" className={UI.btnLinkMuted} onClick={() => m.setSaveOk(false)}>
              继续编辑
            </button>
          </div>
        </div>
      )}

      {m.error && <div className={UI.errBanner}>{m.error}</div>}

      {m.loading && !m.detail ? (
        <div className="text-xl text-slate-500">加载中…</div>
      ) : !m.detail ? (
        <div className="text-xl text-slate-500">未找到仓库。</div>
      ) : (
        <>
          <WarehouseBasicInfoCard
            detail={m.detail}
            canWrite={canWrite}
            saving={m.saving}
            name={m.name}
            setName={m.setName}
            code={m.code}
            setCode={m.setCode}
            active={m.active}
            setActive={m.setActive}
            address={m.address}
            setAddress={m.setAddress}
            contactName={m.contactName}
            setContactName={m.setContactName}
            contactPhone={m.contactPhone}
            setContactPhone={m.setContactPhone}
            areaSqm={m.areaSqm}
            setAreaSqm={m.setAreaSqm}
            onSubmit={m.save}
          />

          <WarehouseShippingProvidersCard
            canWrite={canWrite}
            warehouseId={id}
            loading={carriers.loading}
            busy={carriers.busy}
            togglingProviderId={carriers.togglingProviderId}
            error={carriers.error}
            saveOk={carriers.saveOk}
            items={carriers.items}
            providerOptions={carriers.providerOptions}
            selectedProviderId={carriers.selectedProviderId}
            setSelectedProviderId={carriers.setSelectedProviderId}
            onBindSelected={carriers.bindSelected}
            onToggleActive={carriers.toggleActive}
            onRemove={carriers.remove}
          />

          <WarehouseServiceProvincesCard
            canWrite={canWrite}
            warehouseId={id}
            loading={sp.loading}
            saving={sp.saving}
            error={sp.error}
            saveOk={sp.saveOk}
            text={sp.text}
            setText={sp.setText}
            conflicts={sp.conflicts}
            preview={sp.normalizedPreview}
            ownerByProvince={sp.ownerByProvince}
            citySplitProvinces={split.provinces}
            onUpgradeProvinceToCitySplit={async (prov) => {
              await split.add([prov]);
              await sp.reload();
              jumpToCities();
            }}
            onDowngradeProvinceFromCitySplit={async (prov) => {
              await split.removeOne(prov);
              await sp.reload();
              // 不自动勾选省：由用户显式勾选并保存，避免隐式策略
            }}
            onJumpToCities={jumpToCities}
            onSave={sp.save}
          />

          <div id="service-cities-card">
            <WarehouseServiceCitiesCard
              canWrite={canWrite}
              warehouseId={id}
              loading={sc.loading}
              saving={sc.saving}
              error={sc.error}
              saveOk={sc.saveOk}
              text={sc.text}
              setText={sc.setText}
              conflicts={sc.conflicts}
              preview={sc.normalizedPreview}
              ownerByCity={sc.ownerByCity}
              enabledProvinces={split.provinces}
              onSave={sc.save}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default WarehouseDetailPage;
