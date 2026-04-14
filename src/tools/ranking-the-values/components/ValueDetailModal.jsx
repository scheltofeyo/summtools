import { useState, useEffect } from 'react'
import Modal from './Modal'

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/

export default function ValueDetailModal({ open, onClose, value, onChange, readOnly = false }) {
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('#000000')
  const [hexInput, setHexInput] = useState('#000000')
  const [hexError, setHexError] = useState(false)
  const [mantra, setMantra] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open && value) {
      setTitle(value.title || '')
      setColor(value.color || '#000000')
      setHexInput(value.color || '#000000')
      setHexError(false)
      setMantra(value.mantra || '')
      setDescription(value.description || '')
    }
  }, [open, value])

  function handleHexChange(e) {
    let raw = e.target.value
    if (raw && !raw.startsWith('#')) raw = '#' + raw
    setHexInput(raw)
    if (HEX_REGEX.test(raw)) {
      setHexError(false)
      setColor(raw.toLowerCase())
    } else {
      setHexError(true)
    }
  }

  function handleHexBlur() {
    if (!HEX_REGEX.test(hexInput)) {
      setHexInput(color)
      setHexError(false)
    }
  }

  function handlePickerChange(e) {
    const c = e.target.value
    setColor(c)
    setHexInput(c)
    setHexError(false)
  }

  function handleSave() {
    onChange({
      ...value,
      title: title.trim(),
      color,
      mantra: mantra.trim(),
      description: description.trim(),
    })
    onClose()
  }

  if (!value) return null

  if (readOnly) {
    return (
      <Modal open={open} onClose={onClose} maxWidth="md" title={false}>
        {/* Colored hero */}
        <div className="px-6 pt-8 pb-6 text-white" style={{ backgroundColor: color }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Sluiten"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-xs font-bold tracking-widest uppercase text-white/70">{title}</p>
          {mantra && (
            <p className="text-xl font-bold mt-1 leading-snug">{mantra}</p>
          )}
        </div>
        {/* Description */}
        {description && (
          <div className="px-6 py-5">
            <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
          </div>
        )}
        {/* Close */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Sluiten
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="md" title="Waarde bewerken">
      <div className="space-y-4">
        {/* Color + Title row */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Waarde <span className="text-error">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={handlePickerChange}
              className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
              title="Kies een kleur"
            />
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              onBlur={handleHexBlur}
              placeholder="#000000"
              maxLength={7}
              className={`w-20 px-2 py-2.5 border rounded-lg text-sm font-mono text-center focus:outline-2 focus:outline-brand ${hexError ? 'border-error' : 'border-neutral-200'}`}
              title="Hex-kleurcode"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kernwoord, bijv. Vrijheid"
              className="flex-1 px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-2 focus:outline-brand"
            />
          </div>
        </div>

        {/* Mantra */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Mantra <span className="text-neutral-400 font-normal">(optioneel)</span>
          </label>
          <input
            type="text"
            value={mantra}
            onChange={(e) => setMantra(e.target.value)}
            placeholder="Bijv. Durf anders te denken"
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-2 focus:outline-brand"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Omschrijving <span className="text-neutral-400 font-normal">(optioneel)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschrijf deze waarde in een paar zinnen..."
            rows={4}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-2 focus:outline-brand resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Annuleren
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
        >
          Opslaan
        </button>
      </div>
    </Modal>
  )
}
