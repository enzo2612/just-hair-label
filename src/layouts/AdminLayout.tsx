import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const TABS = [
  { to: '/admin', label: 'Partenaires', end: true },
  { to: '/admin/contenus', label: 'Contenus' },
  { to: '/admin/packs', label: 'Packs' },
  { to: '/admin/demandes', label: 'Demandes' },
  { to: '/admin/statistiques', label: 'Statistiques' },
  { to: '/admin/automatisations', label: 'Automatisations' },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-paper-soft">
      <header className="sticky top-0 z-20 border-b border-line bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo-white.png" alt="Just Hair" className="h-7 w-auto" />
            <div className="h-5 w-px bg-paper/30" />
            <div className="font-display text-sm leading-none tracking-wide text-paper/80">LABEL — BUREAU</div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm text-paper/80">
            <span>{profile?.nom}</span>
            <NavLink to="/app" className="rounded-full border border-paper/30 px-3 py-1 text-xs hover:bg-paper/10">
              Vue partenaire
            </NavLink>
            <button onClick={() => signOut()} className="text-xs underline-offset-2 hover:underline">
              Déconnexion
            </button>
          </div>
        </div>
        <nav className="scrollbar-none mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-3 py-2.5 font-display text-[15px] ${
                  isActive ? 'border-gold text-paper' : 'border-transparent text-paper/60 hover:text-paper'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
