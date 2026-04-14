import { useState } from 'react'
import ValueInput from './ValueInput'
import ValueDetailModal from './ValueDetailModal'

const DEFAULT_COLORS = ['#6B46C1', '#2b9348', '#e8890c', '#1976d2', '#d32f2f', '#0891b2', '#c026d3', '#ea580c']

function newValue(index) {
  return {
    id: crypto.randomUUID(),
    title: '',
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    mantra: '',
    description: '',
  }
}

export default function SessionForm({ initialData, isEditing, hasSubmissions, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [values, setValues] = useState(
    initialData?.values || [newValue(0), newValue(1), newValue(2)]
  )
  const [errors, setErrors] = useState({})
  const [newValueDraft, setNewValueDraft] = useState(null)

  function validate() {
    const errs = {}
    if (!title.trim()) errs.title = 'Bedrijfsnaam is verplicht.'
    if (values.length < 3) errs.values = 'Voeg minimaal 3 waarden toe.'
    const emptyValues = values.some((v) => !v.title.trim())
    if (emptyValues) errs.values = 'Alle waarden moeten een naam hebben.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleAddValue() {
    setNewValueDraft(newValue(values.length))
  }

  function handleNewValueSave(saved) {
    setValues([...values, saved])
    setNewValueDraft(null)
  }

  function handleRemoveValue(index) {
    if (values.length <= 3) return
    setValues(values.filter((_, i) => i !== index))
  }

  function handleValueChange(index, updated) {
    setValues(values.map((v, i) => (i === index ? updated : v)))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      values,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Company name */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Bedrijfsnaam <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="bijv. Summ Studio"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-2 focus:outline-brand"
        />
        {errors.title && <p className="mt-1 text-sm text-error">{errors.title}</p>}
      </div>

      {/* Event */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Event <span className="text-neutral-400">(optioneel)</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="bijv. Team Workshop Voorjaar 2026"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-2 focus:outline-brand"
        />
      </div>

      {/* Values */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Waarden <span className="text-error">*</span>
          <span className="text-neutral-400 font-normal ml-1">(minimaal 3)</span>
        </label>
        <div className="space-y-2">
          {values.map((value, index) => (
            <ValueInput
              key={value.id}
              value={value}
              onChange={(updated) => handleValueChange(index, updated)}
              onRemove={values.length > 3 ? () => handleRemoveValue(index) : null}
              disabled={hasSubmissions}
            />
          ))}
        </div>
        {errors.values && <p className="mt-1 text-sm text-error">{errors.values}</p>}
        {!hasSubmissions && (
          <button
            type="button"
            onClick={handleAddValue}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand font-medium hover:text-brand-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Waarde toevoegen
          </button>
        )}
        <ValueDetailModal
          open={!!newValueDraft}
          onClose={() => setNewValueDraft(null)}
          value={newValueDraft}
          onChange={handleNewValueSave}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-5 py-2.5 bg-brand text-white rounded-lg font-medium text-sm hover:bg-brand-dark transition-colors"
        >
          {isEditing ? 'Opslaan' : 'Sessie aanmaken'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-neutral-500 rounded-lg font-medium text-sm hover:bg-neutral-100 transition-colors"
        >
          Annuleren
        </button>
      </div>
    </form>
  )
}
