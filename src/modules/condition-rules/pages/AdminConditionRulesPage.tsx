import { useToast } from "../../../shared/components/ToastProvider";
import { ConditionRulePreviewPanel } from "../components/ConditionRulePreviewPanel";
import { ConditionRuleTable } from "../components/ConditionRuleTable";
import { CONDITION_OPTIONS, useAdminConditionRules } from "../hooks/useAdminConditionRules";

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
          <span>Manage disease-based nutrient constraints and preview user impact.</span>
        </div>
        <div className="header-actions">
          <button className="secondary-button page-action" type="button" disabled={state.isMutating} onClick={() => void run(state.previewChanges, "Unable to preview changes")}>Preview</button>
          <button className="primary-button page-action" type="button" disabled={state.isMutating} onClick={() => void run(state.applyChanges, "Unable to apply changes")}>Apply</button>
        </div>
      </div>

      <div className="filter-bar">
        <label>
          Condition
          <select value={state.conditionKey} onChange={(event) => state.setConditionKey(event.target.value)}>
            {CONDITION_OPTIONS.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
          </select>
        </label>
        <button className="secondary-button" type="button" onClick={state.addRule}>Add Rule</button>
      </div>

      {state.isLoading ? <p className="state-copy">Loading rules...</p> : null}
      {state.errorCode ? <p className="state-copy">Unable to load rules: {state.errorCode}</p> : null}

      <ConditionRuleTable rules={state.rules} isMutating={state.isMutating} onChange={state.updateRule} />
      <ConditionRulePreviewPanel preview={state.preview} />
    </section>
  );
}
