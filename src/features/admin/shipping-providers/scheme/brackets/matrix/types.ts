// src/features/admin/shipping-providers/scheme/brackets/matrix/types.ts

export type ZoneBracketsMatrixSegment = {
  // 后端段结构字段名可能是 min/max 或 min_kg/max_kg；这里两套都兼容
  min?: number | string;
  max?: number | string | null;

  min_kg?: number | string;
  max_kg?: number | string | null;
};

export type ZoneBracketsMatrixBracket = Record<string, unknown> & {
  // 这里不强绑字段，QuoteMatrixCard 内部会用 keyFromBracket/ displayTextFromBackend
};

export type ZoneBracketsMatrixZone = Record<string, unknown> & {
  id: number;
  name: string;
  brackets?: ZoneBracketsMatrixBracket[];
};

export type ZoneBracketsMatrixGroup = {
  segment_template_id: number;
  template_name: string;
  template_status?: string | null;
  template_is_active?: boolean;

  segments: ZoneBracketsMatrixSegment[];
  zones: ZoneBracketsMatrixZone[];
};

export type ZoneBracketsMatrixOut = {
  ok: boolean;
  scheme_id: number;
  groups: ZoneBracketsMatrixGroup[];
  unbound_zones: ZoneBracketsMatrixZone[];
};
