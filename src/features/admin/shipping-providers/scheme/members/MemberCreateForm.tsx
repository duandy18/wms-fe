// src/features/admin/shipping-providers/scheme/members/MemberCreateForm.tsx

import React, { useState } from "react";
import { UI } from "../../ui";
import { explainStrictMatch } from "./memberActions";

export type CreateMemberPayload = {
  level: "province" | "city" | "district" | "text";
  value: string;
};

export const MemberCreateForm: React.FC<{
  disabled?: boolean;
  onCreate: (payload: CreateMemberPayload) => Promise<void>;
  onError: (msg: string) => void;
}> = ({ disabled, onCreate, onError }) => {
  const [level, setLevel] = useState<CreateMemberPayload["level"]>("city");
  const [value, setValue] = useState("");

  const handleCreate = async () => {
    const v = value.trim();
    if (!v) return onError("value 必填（如：广东省 / 深圳市 / 南山区）");
    await onCreate({ level, value: v });
    setValue("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-800">新增命中条件（Member）</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">level（字段）</label>
          <select
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={level}
            disabled={disabled}
            onChange={(e) => setLevel(e.target.value as CreateMemberPayload["level"])}
          >
            <option value="province">省（province）</option>
            <option value="city">市（city）</option>
            <option value="district">区/县（district）</option>
            <option value="text">文本（text）</option>
          </select>
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-slate-600">value（匹配值）*</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例如：广东省 / 深圳市 / 南山区"
          />
        </div>

        <div className="flex items-end">
          <button className={UI.btnPrimaryGreen} type="button" disabled={disabled} onClick={() => void handleCreate()}>
            新增 Member
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm text-slate-600">{explainStrictMatch()}</div>
    </div>
  );
};
