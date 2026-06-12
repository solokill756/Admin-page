export type RebalanceMode = "strict" | "auto_rebalance";

export type AdminConditionRule = {
  id: number | null;
  conditionKey: string;
  nutrient: string;
  minAmount: number | null;
  maxAmount: number | null;
  unit: string;
  rebalanceMode: RebalanceMode;
  isActive: boolean;
};

export type AdminConditionRuleWriteRequest = {
  conditionKey: string;
  rules: Omit<AdminConditionRule, "id" | "conditionKey">[];
  confirmRiskyChanges?: boolean;
};

export type AdminConditionRulePreview = {
  affectedUsers: number;
  updatedUsers: number;
  updatedThresholds: number;
  warnings: string[];
  rebalance: {
    applied: number;
    fallbackStrict: number;
    adjustedNutrients: Record<string, number>;
  };
  samples: Array<{
    userId: number;
    before: AdminConditionRule[];
    after: AdminConditionRule[];
  }>;
};

export type AdminConditionRuleListResponse = {
  success: true;
  data: AdminConditionRule[];
};

export type AdminConditionRulePreviewResponse = {
  success: true;
  data: AdminConditionRulePreview;
};
