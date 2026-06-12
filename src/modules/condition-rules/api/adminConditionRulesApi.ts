import { adminRequest } from "../../../shared/api/httpClient";
import {
  AdminConditionRuleListResponse,
  AdminConditionRulePreviewResponse,
  AdminConditionRuleWriteRequest,
} from "../types/adminConditionRule.types";

export const adminConditionRulesApi = {
  list(conditionKey?: string) {
    const suffix = conditionKey ? `?conditionKey=${encodeURIComponent(conditionKey)}` : "";
    return adminRequest<AdminConditionRuleListResponse>(`/admin/condition-nutrient-rules${suffix}`);
  },

  preview(payload: AdminConditionRuleWriteRequest) {
    return adminRequest<AdminConditionRulePreviewResponse>("/admin/condition-nutrient-rules/preview", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  apply(payload: AdminConditionRuleWriteRequest) {
    return adminRequest<AdminConditionRulePreviewResponse>(`/admin/condition-nutrient-rules/${payload.conditionKey}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  updateStatus(conditionKey: string, ruleId: number, isActive: boolean) {
    return adminRequest<AdminConditionRulePreviewResponse>(`/admin/condition-nutrient-rules/${conditionKey}/${ruleId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },
};
