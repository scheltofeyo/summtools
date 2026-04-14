import { useState } from 'react'
import { findGreedyPairs, findBalancedPairs, normalizeDistance, findBestDuoForUnmatched } from '../utils/matching'

export default function MatchResultsPanel({ submissions, values }) {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [algorithm, setAlgorithm] = useState('greedy')

  const completedSubmissions = submissions.filter((s) => s.status !== 'in_progress')

  if (completedSubmissions.length < 2) {
    return (
      <p className="text-sm text-neutral-400 py-4">
        Er zijn minimaal 2 inzendingen nodig om matches te berekenen.
      </p>
    )
  }

  const findPairs = algorithm === 'greedy' ? findGreedyPairs : findBalancedPairs
  const { pairs, unmatched } = findPairs(completedSubmissions)
  const valueMap = Object.fromEntries(values.map((v) => [v.id, v]))

  function switchAlgorithm(alg) {
    setAlgorithm(alg)
    setExpandedIndex(null)
  }

  return (
    <div>
      {/* Algorithm toggle */}
      <div className="flex items-center gap-1 mb-3 p-1 bg-neutral-100 rounded-lg w-fit">
        <button
          onClick={() => switchAlgorithm('greedy')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            algorithm === 'greedy'
              ? 'bg-white text-neutral-800 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Greedy
        </button>
        <button
          onClick={() => switchAlgorithm('balanced')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            algorithm === 'balanced'
              ? 'bg-white text-neutral-800 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Gebalanceerd
        </button>
      </div>

      <div className="space-y-2">
        {pairs.map((pair, i) => {
          const oppositionPct = normalizeDistance(pair.distance, values.length)
          const isExpanded = expandedIndex === i
          return (
            <div key={i} className="border border-neutral-200 rounded-lg bg-white">
              {/* Compact clickable row */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex -space-x-2 shrink-0">
                    <div className="w-8 h-8 bg-brand-lightest text-brand rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white">
                      {pair.participant1.participantName.charAt(0).toUpperCase()}
                    </div>
                    <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white">
                      {pair.participant2.participantName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-sm min-w-0 truncate">
                    <span className="font-medium text-neutral-800">
                      {pair.participant1.participantName}
                    </span>
                    <span className="text-neutral-400 mx-1.5">&amp;</span>
                    <span className="font-medium text-neutral-800">
                      {pair.participant2.participantName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-brand">{oppositionPct}%</span>
                    <span className="text-xs text-neutral-400 ml-1">tegengesteld</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-neutral-100">
                  {/* Opposition bar */}
                  <div className="mt-3 mb-4">
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div
                        className="bg-brand h-2 rounded-full transition-all"
                        style={{ width: `${oppositionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Side-by-side rankings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-neutral-400 mb-2">
                        {pair.participant1.participantName}
                      </p>
                      <ol className="space-y-1">
                        {pair.participant1.rankings.map((valueId, j) => {
                          const v = valueMap[valueId]
                          if (!v) return null
                          return (
                            <li key={valueId} className="flex items-center gap-2 text-sm">
                              <span className="w-4 text-neutral-400 text-xs text-right">{j + 1}.</span>
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: v.color }}
                              />
                              <span className="text-neutral-600 truncate">{v.title}</span>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-400 mb-2">
                        {pair.participant2.participantName}
                      </p>
                      <ol className="space-y-1">
                        {pair.participant2.rankings.map((valueId, j) => {
                          const v = valueMap[valueId]
                          if (!v) return null
                          return (
                            <li key={valueId} className="flex items-center gap-2 text-sm">
                              <span className="w-4 text-neutral-400 text-xs text-right">{j + 1}.</span>
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: v.color }}
                              />
                              <span className="text-neutral-600 truncate">{v.title}</span>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {unmatched && (() => {
          const suggestedDuo = findBestDuoForUnmatched(unmatched, pairs, values.length)
          return (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 space-y-2">
              <p className="text-sm text-neutral-600">
                <strong>{unmatched.participantName}</strong> heeft geen match (oneven aantal deelnemers).
              </p>
              {suggestedDuo && (
                <p className="text-sm text-neutral-500">
                  Suggestie: laat {unmatched.participantName} aansluiten bij{' '}
                  <strong>{suggestedDuo.pair.participant1.participantName}</strong> &{' '}
                  <strong>{suggestedDuo.pair.participant2.participantName}</strong>{' '}
                  <span className="text-neutral-400">
                    (gemiddeld {suggestedDuo.avgOpposition}% tegengesteld)
                  </span>
                </p>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
