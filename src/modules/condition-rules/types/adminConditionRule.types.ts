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

export type CanonicalNutrientDef = {
  key: string;
  label: string;
  units: string[];
};

export const CANONICAL_NUTRIENT_DEFS: CanonicalNutrientDef[] = [
  { key: "calories", label: "Calories", units: ["kcal"] },
  { key: "carbs", label: "Carbohydrates", units: ["g"] },
  { key: "protein", label: "Protein", units: ["g"] },
  { key: "fat", label: "Fat", units: ["g"] },
  { key: "saturatedFat", label: "Saturated Fat", units: ["g", "%kcal"] },
  { key: "fiber", label: "Fiber", units: ["g"] },
  { key: "sugars", label: "Sugars", units: ["g"] },
  { key: "sodium", label: "Sodium", units: ["mg"] },
  { key: "potassium", label: "Potassium", units: ["mg"] },
  { key: "cholesterol", label: "Cholesterol", units: ["mg"] },
  { key: "calcium", label: "Calcium", units: ["mg"] },
  { key: "iron", label: "Iron", units: ["mg"] },
  { key: "magnesium", label: "Magnesium", units: ["mg"] },
  { key: "phosphorus", label: "Phosphorus", units: ["mg"] },
  { key: "zinc", label: "Zinc", units: ["mg"] },
  { key: "vitaminA", label: "Vitamin A", units: ["ug"] },
  { key: "vitaminD", label: "Vitamin D", units: ["ug"] },
  { key: "vitaminK", label: "Vitamin K", units: ["ug"] },
  { key: "vitaminB12", label: "Vitamin B12", units: ["ug"] },
  { key: "folateDFE", label: "Folate DFE", units: ["ug"] },
];

export function allowedUnitsForNutrient(nutrientKey: string): string[] {
  return CANONICAL_NUTRIENT_DEFS.find((d) => d.key === nutrientKey)?.units ?? ["g"];
}

export function nutrientLabelFor(nutrientKey: string): string {
  return CANONICAL_NUTRIENT_DEFS.find((d) => d.key === nutrientKey)?.label ?? nutrientKey;
}

export type ConditionDef = {
  key: string;
  label: string;
  description: string;
};

export const CONDITION_DEFS: ConditionDef[] = [
  { key: "diabetes", label: "Diabetes", description: "Carb and sugar limits for glycemic control." },
  { key: "hypertension", label: "Hypertension", description: "Sodium caps to support blood pressure management." },
  { key: "heart_disease", label: "Heart Disease", description: "Sodium, saturated fat, and cholesterol constraints." },
  { key: "high_cholesterol", label: "High Cholesterol", description: "Limits on saturated fat and dietary cholesterol." },
  { key: "kidney_disease", label: "Kidney Disease", description: "Protein, sodium, and phosphorus restrictions." },
];

export function conditionLabelFor(conditionKey: string): string {
  return CONDITION_DEFS.find((d) => d.key === conditionKey)?.label ?? conditionKey;
}

export function conditionDescriptionFor(conditionKey: string): string {
  return CONDITION_DEFS.find((d) => d.key === conditionKey)?.description ?? "";
}

export const PREVIEW_WARNING_LABELS: Record<string, string> = {
  USER_CUSTOM_THRESHOLD_WILL_BE_OVERRIDDEN: "Some users have customized thresholds that will be overridden.",
};
