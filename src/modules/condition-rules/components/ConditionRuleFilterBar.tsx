import { CONDITION_DEFS } from "../types/adminConditionRule.types";

type Props = {
  conditionKey: string;
  ruleCount: number;
  activeRuleCount: number;
  isMutating: boolean;
  onConditionChange: (value: string) => void;
  onAddRule: () => void;
};

export function ConditionRuleFilterBar({
  conditionKey,
  ruleCount,
  activeRuleCount,
  isMutating,
  onConditionChange,
  onAddRule,
}: Props) {
  const selected = CONDITION_DEFS.find((item) => item.key === conditionKey);

  return (
    <section className="condition-filter-bar">
      <label>
        Condition
        <select value={conditionKey} onChange={(event) => onConditionChange(event.target.value)} disabled={isMutating}>
          {CONDITION_DEFS.map((condition) => (
            <option key={condition.key} value={condition.key}>{condition.label}</option>
          ))}
        </select>
      </label>

      <div className="condition-filter-meta">
        <p className="condition-filter-description">
          {selected?.description ?? "Select a condition to manage nutrient rules."}
        </p>
        <div className="condition-filter-stats">
          <span className="condition-stat-pill">{ruleCount} rule{ruleCount === 1 ? "" : "s"}</span>
          <span className="condition-stat-pill condition-stat-pill-active">{activeRuleCount} active</span>
        </div>
      </div>

      <button className="secondary-button condition-add-rule" type="button" onClick={onAddRule} disabled={isMutating}>
        Add Rule
      </button>
    </section>
  );
}
