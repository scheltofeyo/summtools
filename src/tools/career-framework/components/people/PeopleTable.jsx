import { useState, useEffect } from 'react'
import { useFramework } from '../../FrameworkEditor'
import { getPeople, createPerson, updatePerson, deletePerson } from '../../store/peopleStore'
import { getJobs } from '../../store/jobStore'
import { getTeams } from '../../store/teamStore'

export default function PeopleTable() {
  const { framework } = useFramework()
  const [people, setPeople] = useState([])
  const [jobs, setJobs] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [framework.id])

  async function loadData() {
    try {
      const [p, j, t] = await Promise.all([
        getPeople(framework.id),
        getJobs(framework.id),
        getTeams(framework.id),
      ])
      setPeople(p)
      setJobs(j)
      setTeams(t)
    } catch (err) {
      console.error('Failed to load people data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(data) {
    try {
      const person = await createPerson({ frameworkId: framework.id, ...data })
      setPeople((prev) => [...prev, person])
      setShowForm(false)
    } catch (err) {
      console.error('Failed to create person:', err)
    }
  }

  async function handleUpdate(id, data) {
    try {
      const updated = await updatePerson(id, data)
      setPeople((prev) => prev.map((p) => (p.id === id ? updated : p)))
      setEditingId(null)
    } catch (err) {
      console.error('Failed to update person:', err)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Medewerker verwijderen?')) return
    try {
      await deletePerson(id)
      setPeople((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Failed to delete person:', err)
    }
  }

  const filtered = people.filter((p) => {
    const fullName = [p.firstName, p.preposition, p.lastName].filter(Boolean).join(' ').toLowerCase()
    return fullName.includes(search.toLowerCase()) || (p.email || '').toLowerCase().includes(search.toLowerCase())
  })

  if (loading) {
    return <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Medewerkers</h1>
          <p className="text-sm text-neutral-500 mt-1">{people.length} medewerkers in het framework.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null) }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Toevoegen
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam of email..."
          className="w-full max-w-sm px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-neutral-500 border-b border-neutral-100">
              <th className="px-4 py-2.5 font-medium">Naam</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Job</th>
              <th className="px-4 py-2.5 font-medium">Team 1</th>
              <th className="px-4 py-2.5 font-medium">Team 2</th>
              <th className="px-4 py-2.5 font-medium w-20" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-sm text-neutral-400 py-8">
                  {people.length === 0 ? 'Nog geen medewerkers toegevoegd.' : 'Geen resultaten.'}
                </td>
              </tr>
            ) : (
              filtered.map((person) => {
                const job = jobs.find((j) => j.id === person.jobId)
                const team1 = teams.find((t) => t.id === person.primaryTeamId)
                const team2 = teams.find((t) => t.id === person.secondaryTeamId)
                const fullName = [person.firstName, person.preposition, person.lastName].filter(Boolean).join(' ')
                return (
                  <tr key={person.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium text-neutral-800">{fullName}</td>
                    <td className="px-4 py-2.5 text-sm text-neutral-500">{person.email || '—'}</td>
                    <td className="px-4 py-2.5 text-sm text-neutral-500">{job?.name || '—'}</td>
                    <td className="px-4 py-2.5 text-sm text-neutral-500">
                      {team1 ? `${team1.emoji || ''} ${team1.name}`.trim() : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-neutral-500">
                      {team2 ? `${team2.emoji || ''} ${team2.name}`.trim() : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingId(person.id); setShowForm(true) }}
                          className="p-1 text-neutral-400 hover:text-brand transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(person.id)}
                          className="p-1 text-neutral-400 hover:text-error transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <PersonFormModal
          person={editingId ? people.find((p) => p.id === editingId) : null}
          jobs={jobs}
          teams={teams}
          onSave={(data) => editingId ? handleUpdate(editingId, data) : handleCreate(data)}
          onClose={() => { setShowForm(false); setEditingId(null) }}
        />
      )}
    </div>
  )
}

function PersonFormModal({ person, jobs, teams, onSave, onClose }) {
  const [firstName, setFirstName] = useState(person?.firstName || '')
  const [preposition, setPreposition] = useState(person?.preposition || '')
  const [lastName, setLastName] = useState(person?.lastName || '')
  const [email, setEmail] = useState(person?.email || '')
  const [jobId, setJobId] = useState(person?.jobId || '')
  const [primaryTeamId, setPrimaryTeamId] = useState(person?.primaryTeamId || '')
  const [secondaryTeamId, setSecondaryTeamId] = useState(person?.secondaryTeamId || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    onSave({
      firstName: firstName.trim(),
      preposition: preposition.trim() || null,
      lastName: lastName.trim(),
      email: email.trim() || null,
      jobId: jobId || null,
      primaryTeamId: primaryTeamId || null,
      secondaryTeamId: secondaryTeamId || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          {person ? 'Medewerker bewerken' : 'Medewerker toevoegen'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-xs text-neutral-500 mb-1">Voornaam *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none" autoFocus />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Tussenvoegsel</label>
              <input type="text" value={preposition} onChange={(e) => setPreposition(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Achternaam *</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none" />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Job</label>
            <select value={jobId} onChange={(e) => setJobId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none">
              <option value="">Geen job</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Team 1 (primair)</label>
              <select value={primaryTeamId} onChange={(e) => setPrimaryTeamId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none">
                <option value="">Geen</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.emoji || ''} {t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Team 2 (secundair)</label>
              <select value={secondaryTeamId} onChange={(e) => setSecondaryTeamId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-sm focus:border-brand outline-none">
                <option value="">Geen</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.emoji || ''} {t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700">
              Annuleren
            </button>
            <button
              type="submit"
              disabled={!firstName.trim() || !lastName.trim()}
              className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
            >
              {person ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
