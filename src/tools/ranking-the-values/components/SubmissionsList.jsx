import { useState } from 'react'

export default function SubmissionsList({ submissions, values }) {
  const [expandedId, setExpandedId] = useState(null)

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-neutral-400 py-4">Nog geen inzendingen ontvangen.</p>
    )
  }

  const valueMap = Object.fromEntries(values.map((v) => [v.id, v]))

  return (
    <div className="space-y-2">
      {submissions.map((sub) => (
        <div key={sub.id} className="border border-neutral-200 rounded-lg">
          <button
            onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-brand-lightest text-brand rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                {sub.participantName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{sub.participantName}</p>
                <p className="text-xs text-neutral-400 truncate">{sub.participantEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <span className="text-xs text-neutral-400">
                {new Date(sub.submittedAt).toLocaleString('nl-NL', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <svg
                className={`w-4 h-4 text-neutral-300 transition-transform ${expandedId === sub.id ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </button>
          {expandedId === sub.id && (
            <div className="px-4 pb-3 border-t border-neutral-100">
              <ol className="mt-2 space-y-1">
                {sub.rankings.map((valueId, i) => {
                  const v = valueMap[valueId]
                  if (!v) return null
                  return (
                    <li key={valueId} className="flex items-center gap-2 text-sm">
                      <span className="w-5 text-neutral-400 text-xs text-right">{i + 1}.</span>
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: v.color }}
                      />
                      <span className="text-neutral-700">{v.title}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
