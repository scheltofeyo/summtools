import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-brand-lightest rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>

        <h1 className="text-5xl font-bold text-neutral-900">404</h1>
        <p className="mt-3 text-neutral-500 leading-relaxed">
          Deze pagina bestaat niet of is verplaatst.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 bg-brand text-white font-medium px-5 py-2.5 rounded-lg hover:bg-brand-light active:scale-[0.98] transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Terug naar home
        </Link>
      </div>
    </div>
  )
}
