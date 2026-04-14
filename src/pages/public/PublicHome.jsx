export default function PublicHome() {
  return (
    <div className="py-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <div className="w-14 h-14 bg-brand-lightest rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">
          Welkom bij Summ
        </h1>
        <p className="text-neutral-500 leading-relaxed max-w-md mx-auto">
          Je bent uitgenodigd om deel te nemen aan een workshop activiteit.
          Gebruik de link die je van je begeleider hebt ontvangen om verder te gaan.
        </p>
      </div>

      <div className="mt-5 bg-brand-lightest rounded-xl border border-brand/15 px-6 py-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-brand shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-sm text-brand-dark leading-relaxed">
          Geen link ontvangen? Vraag je begeleider om een nieuwe uitnodiging.
        </p>
      </div>
    </div>
  )
}
