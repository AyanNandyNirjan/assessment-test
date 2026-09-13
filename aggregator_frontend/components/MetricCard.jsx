import { HugeiconsIcon } from '@hugeicons/react';

export default function MetricCard({ label, value, detail, icon, emphasis = false }) {
  return (
    <article className={`metric-card${emphasis ? ' metric-card--emphasis' : ''}`}>
      <div className="metric-card__topline">
        <span className="metric-card__icon" aria-hidden="true">
          <HugeiconsIcon icon={icon} size={20} strokeWidth={1.7} />
        </span>
        <span className="metric-card__detail">{detail}</span>
      </div>
      <div className="metric-card__body">
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
