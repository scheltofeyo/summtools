import { useState, useEffect, useRef } from 'react'
import { useFramework } from '../../FrameworkEditor'
import { updateFramework } from '../../store/frameworkStore'
import { getDomains, createDomain, updateDomain, deleteDomain, reorderDomains } from '../../store/domainStore'
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../store/teamStore'

function SortableList({ items, onAdd, onUpdate, onDelete, onReorder, placeholder, renderItem }) {
  const [newValue, setNewValue] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!newValue.trim()) return
    onAdd(newValue.trim())
    setNewValue('')
  }

  return (
    <div>
      <div className="space-y-1.5 mb-3">
        {items.length === 0 && (
          <p className="text-sm text-neutral-400 italic py-2">Nog geen items toegevoegd.</p>
        )}
        {items.map((item, index) => renderItem(item, index))}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!newValue.trim()}
          className="px-3 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Toevoegen
        </button>
      </form>
    </div>
  )
}

function EditableItem({ value, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleSave() {
    if (text.trim() && text.trim() !== value) {
      onSave(text.trim())
    } else {
      setText(value)
    }
    setEditing(false)
  }

  return (
    <div className="group flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
      <svg className="w-4 h-4 text-neutral-300 shrink-0 cursor-grab" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
      </svg>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') { setText(value); setEditing(false) }
          }}
          className="flex-1 text-sm outline-none bg-transparent"
        />
      ) : (
        <span
          className="flex-1 text-sm text-neutral-700 cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {value}
        </span>
      )}
      <button
        onClick={onDelete}
        className="p-1 text-neutral-300 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
        title="Verwijderen"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function CompanySetup() {
  const { framework, setFramework } = useFramework()
  const [companyName, setCompanyName] = useState(framework.companyName)
  const [fwName, setFwName] = useState(framework.name)
  const [domains, setDomains] = useState([])
  const [teams, setTeams] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [framework.id])

  async function loadData() {
    try {
      const [d, t] = await Promise.all([
        getDomains(framework.id),
        getTeams(framework.id),
      ])
      setDomains(d)
      setTeams(t)
    } catch (err) {
      console.error('Failed to load setup data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveCompany() {
    try {
      setSaving(true)
      const updated = await updateFramework(framework.id, {
        companyName: companyName.trim(),
        name: fwName.trim(),
      })
      setFramework(updated)
      setSaveMsg('Opgeslagen')
      setTimeout(() => setSaveMsg(null), 2000)
    } catch (err) {
      setSaveMsg('Fout: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddDomain(name) {
    try {
      const domain = await createDomain({ frameworkId: framework.id, name, sortOrder: domains.length })
      setDomains((prev) => [...prev, domain])
    } catch (err) {
      console.error('Failed to add domain:', err)
    }
  }

  async function handleUpdateDomain(id, name) {
    try {
      const updated = await updateDomain(id, { name })
      setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)))
    } catch (err) {
      console.error('Failed to update domain:', err)
    }
  }

  async function handleDeleteDomain(id) {
    try {
      await deleteDomain(id)
      setDomains((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      console.error('Failed to delete domain:', err)
    }
  }

  async function handleAddTeam(name) {
    try {
      const team = await createTeam({ frameworkId: framework.id, name })
      setTeams((prev) => [...prev, team])
    } catch (err) {
      console.error('Failed to add team:', err)
    }
  }

  async function handleUpdateTeam(id, name) {
    try {
      const updated = await updateTeam(id, { name })
      setTeams((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      console.error('Failed to update team:', err)
    }
  }

  async function handleDeleteTeam(id) {
    try {
      await deleteTeam(id)
      setTeams((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Failed to delete team:', err)
    }
  }

  async function handleUpdateTeamEmoji(id, emoji) {
    try {
      const updated = await updateTeam(id, { emoji })
      setTeams((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      console.error('Failed to update team emoji:', err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-neutral-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Bedrijf & Setup</h1>
        <p className="text-sm text-neutral-500 mt-1">Basisgegevens en organisatie-indeling.</p>
      </div>

      {/* Company info */}
      <section className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="font-semibold text-neutral-800 mb-4">Bedrijfsgegevens</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Bedrijfsnaam</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Framework naam</label>
            <input
              type="text"
              value={fwName}
              onChange={(e) => setFwName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveCompany}
              disabled={saving}
              className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
            {saveMsg && (
              <span className="text-sm text-success">{saveMsg}</span>
            )}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="font-semibold text-neutral-800 mb-1">Domeinen</h2>
        <p className="text-xs text-neutral-400 mb-4">Bedrijfsdomeinen waaraan je jobs kunt koppelen (bijv. Legal, Finance, HR).</p>
        <SortableList
          items={domains}
          onAdd={handleAddDomain}
          placeholder="Nieuw domein..."
          renderItem={(item) => (
            <EditableItem
              key={item.id}
              value={item.name}
              onSave={(name) => handleUpdateDomain(item.id, name)}
              onDelete={() => handleDeleteDomain(item.id)}
            />
          )}
        />
      </section>

      {/* Teams */}
      <section className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="font-semibold text-neutral-800 mb-1">Teams</h2>
        <p className="text-xs text-neutral-400 mb-4">Teams binnen het bedrijf. Je kunt later medewerkers aan teams koppelen.</p>
        <div className="space-y-1.5 mb-3">
          {teams.length === 0 && (
            <p className="text-sm text-neutral-400 italic py-2">Nog geen teams toegevoegd.</p>
          )}
          {teams.map((team) => (
            <div key={team.id} className="group flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
              <button
                onClick={() => {
                  const emoji = prompt('Kies een emoji voor dit team:', team.emoji || '')
                  if (emoji !== null) handleUpdateTeamEmoji(team.id, emoji)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-100 hover:bg-neutral-200 transition-colors text-base cursor-pointer"
                title="Klik om emoji te wijzigen"
              >
                {team.emoji || '🏷️'}
              </button>
              <EditableItem
                value={team.name}
                onSave={(name) => handleUpdateTeam(team.id, name)}
                onDelete={() => handleDeleteTeam(team.id)}
              />
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.target.elements.teamName
            if (!input.value.trim()) return
            handleAddTeam(input.value.trim())
            input.value = ''
          }}
          className="flex gap-2"
        >
          <input
            name="teamName"
            type="text"
            placeholder="Nieuw team..."
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
          >
            Toevoegen
          </button>
        </form>
      </section>
    </div>
  )
}
