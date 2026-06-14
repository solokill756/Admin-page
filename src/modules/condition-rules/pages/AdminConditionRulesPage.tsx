import { useToast } from "../../../shared/components/ToastProvider";
import { ConditionRuleFilterBar } from "../components/ConditionRuleFilterBar";
import { ConditionRulePreviewPanel } from "../components/ConditionRulePreviewPanel";
import { ConditionRuleTable } from "../components/ConditionRuleTable";
import { useAdminConditionRules } from "../hooks/useAdminConditionRules";
import { conditionLabelFor } from "../types/adminConditionRule.types";

const ERROR_MESSAGES: Record<string, string> = {
  CONDITION_RULE_INVALID: "One or more rules have invalid values.",
  CONDITION_RULE_RISK_CONFIRMATION_REQUIRED: "Preview warnings require confirmation before apply.",
  CONDITION_RULE_NOT_FOUND: "Rule not found for this condition.",
  UNAUTHORIZED: "Session expired",
  ADMIN_ONLY: "You do not have admin privileges",
  NETWORK_ERROR: "Unable to connect to server",
  UNKNOWN_ERROR: "An error occurred, please try again",
};

export function AdminConditionRulesPage() {
  const { showToast } = useToast();
  const state = useAdminConditionRules();

  async function run(action: () => Promise<string>, fallback: string) {
    try {
      showToast(await action(), "success");
    } catch {
      showToast(fallback, "error");
    }
  }

  return (
    <section className="condition-rules-page">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Medical rules</p>
          <h2>Condition Nutrient Rules</h2>
          <span>Manage disease-based nutrient constraints and preview user impact before applying.</span>
        </div>
        <div className="header-actions condition-header-actions">
          <button
            className="secondary-button page-action"
            type="button"
            disabled={state.isMutating || state.isLoading}
            onClick={() => void run(state.previewChanges, "Unable to preview changes")}
          >
            {state.isMutating ? "Working..." : "Preview"}
          </button>
          <button
            className="primary-button page-action"
            type="button"
            disabled={state.isMutating || state.isLoading || state.rules.length === 0}
            onClick={() => void run(state.applyChanges, "Unable to apply changes")}
          >
            Apply Changes
          </button>
        </div>
      </div>

      <div className="condition-info-banner">
        <strong>Workflow</strong>
        <p>
          Configure rules for <em>{conditionLabelFor(state.conditionKey)}</em>, run Preview to check impact,
          then Apply to update user thresholds.
        </p>
      </div>

      <ConditionRuleFilterBar
        conditionKey={state.conditionKey}
        ruleCount={state.rules.length}
        activeRuleCount={state.activeRuleCount}
        isMutating={state.isMutating}
        onConditionChange={state.setConditionKey}
        onAddRule={state.addRule}
      />

      {state.isLoading ? (
        <p className="state-copy">Loading rules for {conditionLabelFor(state.conditionKey)}...</p>
      ) : null}

      {state.errorCode ? (
        <div className="dashboard-error" role="alert">
          <strong>Unable to load condition rules</strong>
          <p>{ERROR_MESSAGES[state.errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR}</p>
          <button className="secondary-button" type="button" onClick={() => void state.retry()}>
            Retry
          </button>
        </div>
      ) : null}

      {!state.isLoading && !state.errorCode ? (
        <div className="condition-rules-layout">
          <section className="condition-rules-panel">
            <div className="condition-panel-heading">
              <div>
                <h3>Rule Configuration</h3>
                <p>Set min/max nutrient limits per condition. At least one bound is required per active rule.</p>
              </div>
            </div>
            <ConditionRuleTable
              rules={state.rules}
              isMutating={state.isMutating}
              onChange={state.updateRule}
              onRemove={state.removeRule}
            />
          </section>

          <ConditionRulePreviewPanel preview={state.preview} isMutating={state.isMutating} />
        </div>
      ) : null}
    </section>
  );
}
