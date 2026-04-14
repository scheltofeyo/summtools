import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-nav text-white h-12 flex items-center px-6">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-2">
          <span className="text-sm font-bold tracking-wide uppercase">Summ</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
