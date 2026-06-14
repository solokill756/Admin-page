import {
  AdminConditionRule,
  CANONICAL_NUTRIENT_DEFS,
  RebalanceMode,
  allowedUnitsForNutrient,
} from "../types/adminConditionRule.types";

type Props = {
  rules: AdminConditionRule[];
  isMutating: boolean;
  onChange: (index: number, patch: Partial<AdminConditionRule>) => void;
  onRemove: (index: number) => void;
};

export function ConditionRuleTable({ rules, isMutating, onChange, onRemove }: Props) {
  function handleNutrientChange(index: number, nutrientKey: string) {
    const units = allowedUnitsForNutrient(nutrientKey);
    onChange(index, { nutrient: nutrientKey, unit: units[0] });
  }

  if (rules.length === 0) {
    return (
      <div className="condition-empty-state">
        <strong>No rules configured yet</strong>
        <p>Add a nutrient rule for this condition, then preview impact before applying.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="condition-rule-table">
        <thead>
          <tr>
            <th>Nutrient</th>
            <th>Min</th>
            <th>Max</th>
            <th>Unit</th>
            <th>Mode</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, index) => {
            const allowedUnits = allowedUnitsForNutrient(rule.nutrient);
            return (
              <tr key={`${rule.id ?? "new"}-${index}`} className={rule.isActive ? "" : "condition-rule-row-inactive"}>
                <td>
                  <select
                    className="rule-field"
                    value={rule.nutrient}
                    onChange={(e) => handleNutrientChange(index, e.target.value)}
                    disabled={isMutating}
                  >
                    {CANONICAL_NUTRIENT_DEFS.map((d) => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="rule-field rule-field-number"
                    type="number"
                    min={0}
                    placeholder="—"
                    value={rule.minAmount ?? ""}
                    onChange={(e) => onChange(index, { minAmount: e.target.value === "" ? null : Number(e.target.value) })}
                    disabled={isMutating}
                  />
                </td>
                <td>
                  <input
                    className="rule-field rule-field-number"
                    type="number"
                    min={0}
                    placeholder="—"
                    value={rule.maxAmount ?? ""}
                    onChange={(e) => onChange(index, { maxAmount: e.target.value === "" ? null : Number(e.target.value) })}
                    disabled={isMutating}
                  />
                </td>
                <td>
                  <select
                    className="rule-field rule-field-unit"
                    value={rule.unit}
                    onChange={(e) => onChange(index, { unit: e.target.value })}
                    disabled={isMutating || allowedUnits.length === 1}
                  >
                    {allowedUnits.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="rule-field"
                    value={rule.rebalanceMode}
                    onChange={(e) => onChange(index, { rebalanceMode: e.target.value as RebalanceMode })}
                    disabled={isMutating}
                  >
                    <option value="strict">Strict</option>
                    <option value="auto_rebalance">Auto rebalance</option>
                  </select>
                </td>
                <td>
                  <label className="rule-toggle">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={(e) => onChange(index, { isActive: e.target.checked })}
                      disabled={isMutating}
                    />
                    <span className="rule-toggle-track" aria-hidden="true" />
                    <span className="rule-toggle-label">{rule.isActive ? "Active" : "Inactive"}</span>
                  </label>
                </td>
                <td>
                  <button
                    className="rule-remove-button"
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={isMutating}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
