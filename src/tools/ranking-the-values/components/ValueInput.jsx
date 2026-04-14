import { useState } from 'react'
import ValueDetailModal from './ValueDetailModal'

export default function ValueInput({ value, onChange, onRemove, disabled }) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="flex items-center gap-2.5 px-3 py-2.5 border border-neutral-200 rounded-lg cursor-pointer hover:border-brand/40 hover:bg-brand-lightest/30 transition-colors group"
      >
        {/* Color dot */}
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0"
          style={{ backgroundColor: value.color }}
        />

        {/* Title */}
        <span
          className={`flex-1 text-sm truncate ${value.title ? 'text-neutral-800' : 'text-neutral-400 italic'}`}
        >
          {value.title || 'Nog geen naam...'}
        </span>

        {/* Edit hint */}
        <span className="inline-flex items-center gap-1 text-xs text-brand opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          Bewerken
        </span>

        {/* Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            disabled={disabled}
            className="p-1 text-neutral-300 hover:text-error rounded hover:bg-error/5 transition-colors disabled:opacity-30 disabled:pointer-events-none opacity-0 group-hover:opacity-100"
            title="Waarde verwijderen"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <ValueDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        value={value}
        onChange={disabled ? undefined : onChange}
        readOnly={disabled}
      />
    </>
  )
}
