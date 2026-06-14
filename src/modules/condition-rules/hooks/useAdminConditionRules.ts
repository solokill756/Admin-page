import { useCallback, useEffect, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminConditionRulesApi } from "../api/adminConditionRulesApi";
import { AdminConditionRule, AdminConditionRulePreview, CONDITION_DEFS } from "../types/adminConditionRule.types";

export const CONDITION_OPTIONS = CONDITION_DEFS.map((item) => item.key);

export function useAdminConditionRules() {
  const [conditionKey, setConditionKey] = useState(CONDITION_OPTIONS[0]);
  const [rules, setRules] = useState<AdminConditionRule[]>([]);
  const [preview, setPreview] = useState<AdminConditionRulePreview | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);
    try {
      const response = await adminConditionRulesApi.list(conditionKey);
      setRules(response.data);
    } catch (error) {
      setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [conditionKey]);

  useEffect(() => {
    void load();
    setPreview(null);
  }, [load]);

  const updateRule = useCallback((index: number, patch: Partial<AdminConditionRule>) => {
    setRules((current) => current.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  }, []);

  const addRule = useCallback(() => {
    setRules((current) => [
      ...current,
      { id: null, conditionKey, nutrient: "sodium", minAmount: null, maxAmount: 1500, unit: "mg", rebalanceMode: "strict", isActive: true },
    ]);
    setPreview(null);
  }, [conditionKey]);

  const removeRule = useCallback((index: number) => {
    setRules((current) => current.filter((_, i) => i !== index));
    setPreview(null);
  }, []);

  const buildPayload = useCallback((confirmRiskyChanges = false) => ({
    conditionKey,
    confirmRiskyChanges,
    rules: rules.map(({ nutrient, minAmount, maxAmount, unit, rebalanceMode, isActive }) => ({
      nutrient,
      minAmount,
      maxAmount,
      unit,
      rebalanceMode,
      isActive,
    })),
  }), [conditionKey, rules]);

  const previewChanges = useCallback(async () => {
    setIsMutating(true);
    try {
      const response = await adminConditionRulesApi.preview(buildPayload(false));
      setPreview(response.data);
      return "Preview generated";
    } finally {
      setIsMutating(false);
    }
  }, [buildPayload]);

  const applyChanges = useCallback(async () => {
    setIsMutating(true);
    try {
      const response = await adminConditionRulesApi.apply(buildPayload(true));
      setPreview(response.data);
      await load();
      return `Updated ${response.data.updatedUsers} users`;
    } finally {
      setIsMutating(false);
    }
  }, [buildPayload, load]);

  const activeRuleCount = rules.filter((rule) => rule.isActive).length;

  return {
    conditionKey,
    setConditionKey,
    rules,
    preview,
    errorCode,
    isLoading,
    isMutating,
    activeRuleCount,
    updateRule,
    addRule,
    removeRule,
    previewChanges,
    applyChanges,
    retry: load,
  };
}
