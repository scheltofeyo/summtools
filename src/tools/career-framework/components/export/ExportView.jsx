import { useFramework } from '../../FrameworkEditor'

export default function ExportView() {
  const { framework } = useFramework()

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-neutral-900">Export</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-8">
        Exporteer het carriere-framework voor {framework.companyName}.
      </p>

      <div className="text-center py-16 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl">
        <svg className="w-10 h-10 text-neutral-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm font-medium text-neutral-400">Binnenkort beschikbaar</p>
        <p className="text-xs text-neutral-300 mt-1">Export naar CSV, PDF, of de SUMM app.</p>
      </div>
    </div>
  )
}
