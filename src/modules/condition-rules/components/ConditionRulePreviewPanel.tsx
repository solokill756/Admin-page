import { AdminConditionRulePreview } from "../types/adminConditionRule.types";

type Props = { preview: AdminConditionRulePreview | null };

export function ConditionRulePreviewPanel({ preview }: Props) {
  if (!preview) return <p className="state-copy">Generate a preview before applying rule changes.</p>;
  return (
    <section className="condition-preview">
      <div className="overview-grid">
        <div className="overview-card"><span>Affected users</span><strong>{preview.affectedUsers}</strong></div>
        <div className="overview-card"><span>Updated users</span><strong>{preview.updatedUsers}</strong></div>
        <div className="overview-card"><span>Fallback strict</span><strong>{preview.rebalance.fallbackStrict}</strong></div>
      </div>
      {preview.warnings.length > 0 ? (
        <div className="dashboard-error" role="alert">
          <strong>Warnings</strong>
          {preview.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </div>
      ) : null}
    </section>
  );
}
