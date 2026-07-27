import { STATUS_LABELS } from '../../services/orderService';
import { ClipboardPenLine, CheckCircle, ChefHat, Package, Bike, PartyPopper, XCircle } from 'lucide-react';

const ADMIN_STATUS_ICONS = {
  placed: <ClipboardPenLine size={14} />,
  confirmed: <CheckCircle size={14} />,
  preparing: <ChefHat size={14} />,
  ready: <Package size={14} />,
  out_for_delivery: <Bike size={14} />,
  delivered: <PartyPopper size={14} />,
  cancelled: <XCircle size={14} />
};

export default function StatusBadge({ status, cancelledBy = null, customerName = '' }) {
  let label = STATUS_LABELS[status] || status;
  if (status === 'cancelled') {
    label = cancelledBy === 'customer'
      ? `Cancelled by Customer ${customerName ? `(${customerName})` : ''}`
      : 'Cancelled by You (Admin)';
  }

  return (
    <span className={`admin-status-badge admin-status-badge--${status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {ADMIN_STATUS_ICONS[status]} {label}
    </span>
  );
}
