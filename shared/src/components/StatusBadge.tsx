const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada',
  RECHAZADA: 'Rechazada',
  FIRMADO: 'Firmado',
  RECHAZADO: 'Rechazado',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span data-status={status}>{STATUS_LABELS[status] ?? status}</span>;
}
