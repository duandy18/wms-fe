// src/features/admin/suppliers/SuppliersListPage.tsx

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";

import { UI } from "./ui";
import { useSuppliersPage } from "./hooks/useSuppliersPage";

import SupplierCreateCard from "./components/SupplierCreateCard";
import SuppliersFiltersBar from "./components/SuppliersFiltersBar";
import SuppliersTable from "./components/SuppliersTable";

const SuppliersListPage: React.FC = () => {
  const vm = useSuppliersPage();

  // ✅ 运行时兜底：避免在 Table 内部访问 .length 时炸
  const safeSuppliers = vm.suppliers ?? [];

  return (
    <div className={UI.page}>
      <PageTitle
        title="供应商主数据"
        description="维护供应商档案（公司名称、联系人、电话、邮箱、微信、启用状态），供采购单等业务引用。"
      />

      <SupplierCreateCard
        createError={vm.createError}
        creating={vm.creating}
        name={vm.name}
        code={vm.code}
        contactName={vm.contactName}
        phone={vm.phone}
        email={vm.email}
        wechat={vm.wechat}
        onChangeName={vm.setName}
        onChangeCode={vm.setCode}
        onChangeContactName={vm.setContactName}
        onChangePhone={vm.setPhone}
        onChangeEmail={vm.setEmail}
        onChangeWechat={vm.setWechat}
        onSubmit={vm.handleCreate}
      />

      <section className={UI.card}>
        <SuppliersFiltersBar
          onlyActive={vm.onlyActive}
          onChangeOnlyActive={vm.setOnlyActive}
          search={vm.search}
          onChangeSearch={vm.setSearch}
          loading={vm.loading}
          onRefresh={vm.loadSuppliers}
        />

        {vm.error ? <div className={UI.errorText}>{vm.error}</div> : null}

        <SuppliersTable suppliers={safeSuppliers} onToggleActive={vm.toggleActive} />
      </section>
    </div>
  );
};

export default SuppliersListPage;
