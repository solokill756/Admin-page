type OverviewStatCardProps = {
  label: string;
  value: number;
  description: string;
};

export function OverviewStatCard({ label, value, description }: OverviewStatCardProps) {
  return (
    <article className="overview-card">
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
      <p>{description}</p>
    </article>
  );
}
