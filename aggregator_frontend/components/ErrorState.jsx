import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, RefreshIcon } from '@hugeicons/core-free-icons';

export default function ErrorState({ message, onRetry }) {
  return (
    <section className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">
        <HugeiconsIcon icon={Alert02Icon} size={24} strokeWidth={1.7} />
      </div>
      <div>
        <p className="eyebrow">Connection issue</p>
        <h2>We couldn&apos;t load the report.</h2>
        <p>{message}</p>
      </div>
      <button className="button button--dark" type="button" onClick={onRetry}>
        <HugeiconsIcon icon={RefreshIcon} size={17} strokeWidth={1.8} />
        Try again
      </button>
    </section>
  );
}
