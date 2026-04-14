import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ValueDetailModal from './ValueDetailModal'

export default function SortableValueItem({ id, value, position }) {
  const [showDetail, setShowDetail] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hasDetails = !!(value.mantra || value.description)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white border rounded-xl select-none transition-shadow ${
        isDragging
          ? 'shadow-lg border-brand/40 z-10 opacity-90'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing touch-none"
        aria-label={`Sleep ${value.title} om de volgorde te wijzigen`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      </button>

      {/* Position number */}
      <span className="w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center text-xs font-semibold text-neutral-500">
        {position}
      </span>

      {/* Color dot */}
      <span
        className="w-4 h-4 rounded-full shrink-0"
        style={{ backgroundColor: value.color }}
      />

      {/* Title */}
      <span className="flex-1 text-sm font-medium text-neutral-800">{value.title}</span>

      {/* Info button */}
      {hasDetails && (
        <button
          type="button"
          onClick={() => setShowDetail(true)}
          className="p-1 text-neutral-300 hover:text-brand transition-colors"
          aria-label={`Meer informatie over ${value.title}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </button>
      )}

      <ValueDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        value={value}
        readOnly
      />
    </div>
  )
}
