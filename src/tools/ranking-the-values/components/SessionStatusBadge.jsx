const STATUS_CONFIG = {
  draft: { label: 'Concept', bg: 'bg-info/10', text: 'text-info', dot: 'bg-info' },
  open: { label: 'Open', bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  closed: { label: 'Gesloten', bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
  archived: { label: 'Gearchiveerd', bg: 'bg-neutral-50', text: 'text-neutral-400', dot: 'bg-neutral-300' },
}

export default function SessionStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.closed

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
