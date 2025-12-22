// src/features/admin/suppliers/SuppliersListPage.tsx

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";
import { useSuppliersController } from "./hooks/useSuppliersController";

import SuppliersToolbar from "./components/SuppliersToolbar";
import SupplierCreateSection from "./components/SupplierCreateSection";
import SuppliersTable from "./components/SuppliersTable";
import SupplierEditModal from "./components/SupplierEditModal";

const TITLE: string = UI.title;
const H2: string = UI.h2;
const BODY: string = UI.body;
const CARD: string = UI.card;
const SUBCARD: string = UI.subcard;

const INPUT: string = UI.input;
const SELECT: string = UI.select;

const BTN: string = UI.btn;
const BTN_PRIMARY: string = UI.btnPrimary;
const BTN_DANGER: string = UI.btnDanger;

const ERROR_BOX: string = UI.errorBox;

const TABLE: string = UI.table;
const THEAD_ROW: string = UI.theadRow;
const TBODY_ROW: string = UI.tbodyRow;

const PAD_CELL: string = "px-4 py-3";
const EMPTY_CELL: string = "px-4 py-10";

const BADGE_OK: string = UI.badgeOk;
const BADGE_BAD: string = UI.badgeBad;

const SuppliersListPage: React.FC = () => {
  const c = useSuppliersController();

  return (
    <div className="space-y-10 p-10">
      <PageTitle title="供应商主数据" description="字段与列表对齐：名称/编码/官网/联系人信息/状态。状态只能在编辑中修改。" />

      <SupplierCreateSection
        H2={H2}
        BODY={BODY}
        CARD={CARD}
        SUBCARD={SUBCARD}
        INPUT={INPUT}
        SELECT={SELECT}
        BTN={BTN}
        BTN_PRIMARY={BTN_PRIMARY}
        BTN_DANGER={BTN_DANGER}
        ERROR_BOX={ERROR_BOX}
        newName={c.newName}
        setNewName={c.setNewName}
        newCode={c.newCode}
        setNewCode={c.setNewCode}
        newWebsite={c.newWebsite}
        setNewWebsite={c.setNewWebsite}
        newActive={c.newActive}
        setNewActive={c.setNewActive}
        newContacts={c.newContacts}
        setNewContacts={(fn) => c.setNewContacts(fn)}
        creating={c.creating}
        createError={c.createError}
        onSubmit={c.handleCreate}
      />

      <section className={`${CARD} space-y-8`}>
        <div className="flex items-center justify-between gap-6">
          <div className={`${H2} font-semibold text-slate-900`}>供应商列表</div>

          <SuppliersToolbar
            onlyActive={c.onlyActive}
            onChangeOnlyActive={c.setOnlyActive}
            search={c.search}
            onChangeSearch={c.setSearch}
            loading={c.loading}
            onRefresh={() => void c.load()}
            inputClassName={INPUT}
            btnClassName={BTN}
            bodyClassName={BODY}
          />
        </div>

        {c.pageError && <div className={ERROR_BOX}>{c.pageError}</div>}

        <SuppliersTable
          suppliers={c.suppliers}
          loading={c.loading}
          TABLE={TABLE}
          THEAD_ROW={THEAD_ROW}
          TBODY_ROW={TBODY_ROW}
          PAD_CELL={PAD_CELL}
          EMPTY_CELL={EMPTY_CELL}
          BODY={BODY}
          BTN={BTN}
          BADGE_OK={BADGE_OK}
          BADGE_BAD={BADGE_BAD}
          onOpenEdit={c.openEdit}
        />
      </section>

      {c.editing && (
        <SupplierEditModal
          TITLE={TITLE}
          H2={H2}
          BODY={BODY}
          CARD={CARD}
          SUBCARD={SUBCARD}
          INPUT={INPUT}
          SELECT={SELECT}
          BTN={BTN}
          BTN_PRIMARY={BTN_PRIMARY}
          BTN_DANGER={BTN_DANGER}
          ERROR_BOX={ERROR_BOX}
          editing={c.editing}
          setEditing={c.setEditing}
          editSaving={c.editSaving}
          editError={c.editError}
          onClose={c.closeEdit}
          onAddContact={c.editAddContact}
          onRemoveContact={c.editRemoveContact}
          onSetPrimary={c.editSetPrimary}
          onSetContact={c.editSetContact}
          onSubmit={c.saveEdit}
          setEditError={() => {
            // editError 在 controller 内部维护；这里不重复写入
          }}
        />
      )}
    </div>
  );
};

export default SuppliersListPage;
