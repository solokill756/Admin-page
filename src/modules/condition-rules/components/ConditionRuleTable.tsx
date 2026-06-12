import { AdminConditionRule, RebalanceMode } from "../types/adminConditionRule.types";

type Props = {
  rules: AdminConditionRule[];
  isMutating: boolean;
  onChange: (index: number, patch: Partial<AdminConditionRule>) => void;
};

export function ConditionRuleTable({ rules, isMutating, onChange }: Props) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nutrient</th>
            <th>Min</th>
            <th>Max</th>
            <th>Unit</th>
            <th>Mode</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, index) => (
            <tr key={`${rule.id ?? "new"}-${index}`}>
              <td><input value={rule.nutrient} onChange={(event) => onChange(index, { nutrient: event.target.value })} disabled={isMutating} /></td>
              <td><input type="number" value={rule.minAmount ?? ""} onChange={(event) => onChange(index, { minAmount: event.target.value === "" ? null : Number(event.target.value) })} disabled={isMutating} /></td>
              <td><input type="number" value={rule.maxAmount ?? ""} onChange={(event) => onChange(index, { maxAmount: event.target.value === "" ? null : Number(event.target.value) })} disabled={isMutating} /></td>
              <td><input value={rule.unit} onChange={(event) => onChange(index, { unit: event.target.value })} disabled={isMutating} /></td>
              <td>
                <select value={rule.rebalanceMode} onChange={(event) => onChange(index, { rebalanceMode: event.target.value as RebalanceMode })} disabled={isMutating}>
                  <option value="strict">Strict</option>
                  <option value="auto_rebalance">Auto rebalance</option>
                </select>
              </td>
              <td><input type="checkbox" checked={rule.isActive} onChange={(event) => onChange(index, { isActive: event.target.checked })} disabled={isMutating} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
