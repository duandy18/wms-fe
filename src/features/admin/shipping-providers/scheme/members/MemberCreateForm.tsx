// src/features/admin/shipping-providers/scheme/members/MemberCreateForm.tsx

import React, { useMemo, useState } from "react";
import { UI } from "../ui";
import { explainStrictMatch, levelLabel, normalizeMemberValue } from "./memberActions";
import { RegionSelector } from "../components/RegionSelector";

export type CreateMemberPayload = {
  level: "province" | "city" | "district" | "text";
  value: string;
};

export const MemberCreateForm: React.FC<{
  disabled?: boolean;
  onCreate: (payload: CreateMemberPayload) => Promise<void>;
  onError: (msg: string) => void;

  // ✅ 仅用于展示“你正在维护谁”，以及省份禁选提示（人话）
  selectedZoneName?: string;

  // ✅ 占用原因：省份 -> “已在：XX 区域”
  blockedReasonByProvince?: Record<string, string>;
}> = ({ disabled, onCreate, onError, selectedZoneName, blockedReasonByProvince }) => {
  const [level, setLevel] = useState<CreateMemberPayload["level"]>("city");

  // province 走 RegionSelector（多选，一次新增多条）
  const [provinceList, setProvinceList] = useState<string[]>([]);

  // 其他 level 走输入框
  const [value, setValue] = useState("");

  const helperText = useMemo(() => explainStrictMatch(), []);

  const handleCreate = async () => {
    if (level === "province") {
      const list = (provinceList ?? [])
        .map((x) => normalizeMemberValue("province", x))
        .filter(Boolean);

      if (list.length === 0) return onError("必须选择至少一个省份");

      // ✅ 逐条创建（不引入新接口，不扩散）
      for (const p of list) {
        await onCreate({ level: "province", value: p });
      }
      setProvinceList([]);
      return;
    }

    const v = normalizeMemberValue(level, value);
    if (!v) return onError("匹配值必填（如：广东省 / 深圳市 / 南山区）");

    await onCreate({ level, value: v });
    setValue("");
  };

  return (
    <div className={UI.cardSoft}>
      <div className={UI.sectionTitle}>
        新增命中条件
        {selectedZoneName ? <span className={`ml-2 ${UI.tinyHelpText}`}>（当前：{selectedZoneName}）</span> : null}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex flex-col">
          <label className={UI.helpText}>类型</label>
          <select
            className={UI.inputBase}
            value={level}
            disabled={disabled}
            onChange={(e) => {
              const next = e.target.value as CreateMemberPayload["level"];
              setLevel(next);
              // 切换类型时清理草稿
              setValue("");
              setProvinceList([]);
            }}
          >
            <option value="province">{levelLabel("province")}</option>
            <option value="city">{levelLabel("city")}</option>
            <option value="district">{levelLabel("district")}</option>
            <option value="text">{levelLabel("text")}</option>
          </select>
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className={UI.helpText}>匹配值 *</label>

          {level === "province" ? (
            <div className="mt-1">
              <RegionSelector
                value={provinceList}
                onChange={setProvinceList}
                disabled={disabled}
                title="选择省份（已被其它区域使用的会自动禁选）"
                hint=""
                blockedReasonByProvince={blockedReasonByProvince}
              />
              <div className={`mt-2 ${UI.tinyHelpText}`}>
                已选 {provinceList.length} 个省份（点“新增”后会逐条写入）
              </div>
            </div>
          ) : (
            <input
              className={UI.inputMono}
              value={value}
              disabled={disabled}
              onChange={(e) => setValue(e.target.value)}
              placeholder="例如：广东省 / 深圳市 / 南山区"
            />
          )}
        </div>

        <div className="flex items-end">
          <button className={UI.btnPrimaryGreen} type="button" disabled={disabled} onClick={() => void handleCreate()}>
            新增
          </button>
        </div>
      </div>

      <div className={`mt-2 ${UI.helpText}`}>{helperText}</div>
    </div>
  );
};
