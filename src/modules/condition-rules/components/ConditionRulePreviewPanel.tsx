import { OverviewStatCard } from "../../dashboard/components/OverviewStatCard";
import { AdminConditionRulePreview, PREVIEW_WARNING_LABELS } from "../types/adminConditionRule.types";

type Props = { preview: AdminConditionRulePreview | null; isMutating: boolean };

export function ConditionRulePreviewPanel({ preview, isMutating }: Props) {
  if (!preview) {
    return (
      <section className="condition-preview-card condition-preview-empty">
        <div>
          <strong>Preview impact before applying</strong>
          <p>Run Preview to see how many users and thresholds will be affected by your rule changes.</p>
        </div>
        <span className="condition-preview-hint">{isMutating ? "Generating preview..." : "No preview generated yet"}</span>
      </section>
    );
  }

  return (
    <section className="condition-preview-card">
      <div className="condition-panel-heading">
        <div>
          <h3>Impact Preview</h3>
          <p>Review affected users and warnings before saving medical rule changes.</p>
        </div>
      </div>

      <div className="metric-grid condition-preview-grid">
        <OverviewStatCard
          label="Affected users"
          value={preview.affectedUsers}
          description="Active users with this condition."
        />
        <OverviewStatCard
          label="Updated users"
          value={preview.updatedUsers}
          description="Users whose thresholds will change on apply."
        />
        <OverviewStatCard
          label="Updated thresholds"
          value={preview.updatedThresholds}
          description="Threshold rows recalculated from rules."
        />
        <OverviewStatCard
          label="Strict fallback"
          value={preview.rebalance.fallbackStrict}
          description="Users where auto-rebalance could not run safely."
        />
      </div>

      {preview.warnings.length > 0 ? (
        <div className="dashboard-error condition-preview-warnings" role="alert">
          <strong>Warnings ({preview.warnings.length})</strong>
          <ul>
            {preview.warnings.map((warning) => (
              <li key={warning}>{PREVIEW_WARNING_LABELS[warning] ?? warning}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="condition-preview-safe">No risky warnings detected for this preview.</p>
      )}
    </section>
  );
}
