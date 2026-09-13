import { HugeiconsIcon } from '@hugeicons/react';
import { CrownIcon } from '@hugeicons/core-free-icons';

export default function StatusBadge({ status }) {
  const isVip = status === 'VIP';
  const isInactive = status === 'Inactive';

  let badgeVariant = 'status-badge--standard';
  if (isVip) badgeVariant = 'status-badge--vip';
  else if (isInactive) badgeVariant = 'status-badge--inactive';

  return (
    <span className={`status-badge ${badgeVariant}`}>
      {isVip ? <HugeiconsIcon icon={CrownIcon} size={14} strokeWidth={1.8} aria-hidden="true" /> : null}
      {status}
    </span>
  );
}
