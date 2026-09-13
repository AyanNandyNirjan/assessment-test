import { HugeiconsIcon } from '@hugeicons/react';
import { CrownIcon } from '@hugeicons/core-free-icons';

export default function StatusBadge({ status }) {
  const isVip = status === 'VIP';

  return (
    <span className={`status-badge ${isVip ? 'status-badge--vip' : 'status-badge--standard'}`}>
      {isVip ? <HugeiconsIcon icon={CrownIcon} size={14} strokeWidth={1.8} aria-hidden="true" /> : null}
      {status}
    </span>
  );
}
