// src/components/ui/PageTitle.tsx

import React from "react";
import clsx from "clsx";

export interface PageTitleProps {
  title: string;
  description?: string;
  className?: string;

  /**
   * 可选：标题右侧的操作区，例如按钮
   * <PageTitle
   *    title="Inventory"
   *    actions={<Button>Add</Button>}
   * />
   */
  actions?: React.ReactNode;

  /**
   * 可选：允许 children 插入额外内容（一般不会用，但保留扩展性）
   */
  children?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  description,
  className,
  actions,
  children,
}) => {
  return (
    <div className={clsx("mb-6 flex flex-col gap-2", className)}>
      {/* 标题 + 右侧操作按钮 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* 副标题/描述 */}
      {description && (
        <p className="text-sm text-slate-500">
          {description}
        </p>
      )}

      {/* 可选插槽 */}
      {children}
    </div>
  );
};

export default PageTitle;
