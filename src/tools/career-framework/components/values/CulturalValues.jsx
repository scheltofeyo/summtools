import { useState, useEffect } from 'react'
import { useFramework } from '../../FrameworkEditor'
import {
  getCulturalPhases, updateCulturalPhase,
  getCulturalValues, createCulturalValue, updateCulturalValue, deleteCulturalValue,
  upsertCulturalValueLevel,
} from '../../store/culturalValueStore'

const VALUE_TYPES = ['Klant/missie', 'Individueel', 'Sociaal', 'Creativiteit', 'Proces', 'Optional']

export default function CulturalValues() {
  const { framework } = useFramework()
  const [phases, setPhases] = useState([])
  const [values, setValues] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadData()
  }, [framework.id])

  async function loadData() {
    try {
      const [p, v] = await Promise.all([
        getCulturalPhases(framework.id),
        getCulturalValues(framework.id),
      ])
      setPhases(p)
      setValues(v)
    } catch (err) {
      console.error('Failed to load cultural values:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddValue() {
    try {
      const val = await createCulturalValue({
        frameworkId: framework.id,
        name: 'Nieuwe waarde',
        sortOrder: values.length,
      })
      setValues((prev) => [...prev, val])
      setExpandedId(val.id)
    } catch (err) {
      console.error('Failed to add value:', err)
    }
  }

  async function handleUpdateValue(id, updates) {
    try {
      const updated = await updateCulturalValue(id, updates)
      setValues((prev) => prev.map((v) => (v.id === id ? updated : v)))
    } catch (err) {
      console.error('Failed to update value:', err)
    }
  }

  async function handleDeleteValue(id) {
    try {
      await deleteCulturalValue(id)
      setValues((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      console.error('Failed to delete value:', err)
    }
  }

  async function handleSaveLevel(culturalValueId, culturalPhaseId, description) {
    try {
      const level = await upsertCulturalValueLevel({ culturalValueId, culturalPhaseId, description })
      setValues((prev) =>
        prev.map((v) => {
          if (v.id !== culturalValueId) return v
          const existing = v.levels.find((l) => l.culturalPhaseId === culturalPhaseId)
          if (existing) {
            return { ...v, levels: v.levels.map((l) => (l.culturalPhaseId === culturalPhaseId ? level : l)) }
          }
          return { ...v, levels: [...v.levels, level] }
        })
      )
    } catch (err) {
      console.error('Failed to save level:', err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Cultural Values</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Definieer bedrijfswaarden met gedragsbeschrijvingen per fase.
          </p>
        </div>
        <button
          onClick={handleAddValue}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nieuwe waarde
        </button>
      </div>

      {/* Phases header */}
      {phases.length > 0 && (
        <div className="flex gap-2 mb-4">
          {phases.map((phase) => (
            <div key={phase.id} className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{phase.name}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">{phase.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Values */}
      {values.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl">
          <p className="text-sm text-neutral-400">Nog geen waarden gedefinieerd.</p>
          <button onClick={handleAddValue} className="mt-2 text-sm text-brand hover:underline">
            Voeg je eerste waarde toe
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {values.map((val, idx) => (
            <ValueCard
              key={val.id}
              value={val}
              index={idx}
              phases={phases}
              expanded={expandedId === val.id}
              onToggle={() => setExpandedId(expandedId === val.id ? null : val.id)}
              onUpdate={(updates) => handleUpdateValue(val.id, updates)}
              onDelete={() => handleDeleteValue(val.id)}
              onSaveLevel={(phaseId, desc) => handleSaveLevel(val.id, phaseId, desc)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ValueCard({ value, index, phases, expanded, onToggle, onUpdate, onDelete, onSaveLevel }) {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(value.name)
  const [mantra, setMantra] = useState(value.mantra || '')
  const [description, setDescription] = useState(value.description || '')
  const [type, setType] = useState(value.type || '')

  function handleSaveName() {
    if (name.trim() && name.trim() !== value.name) {
      onUpdate({ name: name.trim() })
    }
    setEditingName(false)
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={onToggle}
      >
        <span className="text-sm font-bold text-brand w-6 text-center">{index + 1}</span>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold outline-none border-b border-brand bg-transparent w-full"
              autoFocus
            />
          ) : (
            <h3 className="text-sm font-semibold text-neutral-800 truncate">{value.name}</h3>
          )}
          {value.mantra && (
            <p className="text-xs text-neutral-400 mt-0.5 truncate">"{value.mantra}"</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {value.type && (
            <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">{value.type}</span>
          )}
          <svg
            className={`w-4 h-4 text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-neutral-100 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Naam</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => { if (name.trim() !== value.name) onUpdate({ name: name.trim() }) }}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Categorie</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); onUpdate({ type: e.target.value }) }}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none"
              >
                <option value="">Geen</option>
                {VALUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Mantra</label>
            <input
              type="text"
              value={mantra}
              onChange={(e) => setMantra(e.target.value)}
              onBlur={() => onUpdate({ mantra: mantra.trim() })}
              placeholder="bijv. 'We think outside the box'"
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Beschrijving</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => onUpdate({ description: description.trim() })}
              rows={2}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none resize-none"
            />
          </div>

          {/* Phase level descriptions */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2">Gedragsbeschrijvingen per fase</label>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${phases.length}, 1fr)` }}>
              {phases.map((phase) => {
                const level = value.levels.find((l) => l.culturalPhaseId === phase.id)
                return (
                  <LevelCell
                    key={phase.id}
                    phaseName={phase.name}
                    description={level?.description || ''}
                    onSave={(desc) => onSaveLevel(phase.id, desc)}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-neutral-100">
            <button
              onClick={onDelete}
              className="text-xs text-neutral-400 hover:text-error transition-colors"
            >
              Waarde verwijderen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function LevelCell({ phaseName, description, onSave }) {
  const [text, setText] = useState(description)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setText(description)
  }, [description])

  function handleBlur() {
    if (dirty && text.trim()) {
      onSave(text.trim())
      setDirty(false)
    }
  }

  return (
    <div>
      <p className="text-[10px] font-semibold text-neutral-400 uppercase mb-1">{phaseName}</p>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setDirty(true) }}
        onBlur={handleBlur}
        rows={3}
        placeholder="Gedragsbeschrijving..."
        className="w-full px-2 py-1.5 border border-neutral-200 rounded-md text-xs focus:border-brand outline-none resize-none"
      />
    </div>
  )
}
