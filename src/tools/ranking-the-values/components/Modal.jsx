import { useEffect } from 'react'

export default function Modal({ open, onClose, title, maxWidth = 'sm', children }) {
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full mx-4 overflow-hidden ${maxWidth === 'md' ? 'max-w-md' : 'max-w-sm'}`}>
        {title !== false && (
          <div className="flex items-start justify-between p-6 pb-0 mb-4">
            {title && <h3 className="text-lg font-bold text-neutral-900">{title}</h3>}
            <button
              onClick={onClose}
              className="p-1 -mr-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Sluiten"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {title !== false ? <div className="px-6 pb-6">{children}</div> : children}
      </div>
    </div>
  )
}
