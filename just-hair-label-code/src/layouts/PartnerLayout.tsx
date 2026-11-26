import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const TABS = [
  { to: '/app', label: 'Accueil', end: true },
  { to: '/app/coach', label: 'Mon Coach Business' },
  { to: '/app/outils', label: 'Mes outils' },
  { to: '/app/parcours', label: 'Mon parcours' },
  { to: '/app/avantages', label: 'Mes avantages' },
  { to: '/app/accompagnement', label: 'Mes accompagnements' },
  { to: '/app/diagnostic', label: 'Diagnostic' },
]

export function PartnerLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-paper-soft">
      <header className="sticky top-0 z-20 border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper">
              <span className="font-display text-sm">L</span>
            </div>
            <div className="font-display text-base leading-none text-ink">JUST HAIR LABEL</div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm text-ink-dim">
            <span>{profile?.nom}</span>
            {profile?.role === 'admin' && (
              <NavLink to="/admin" className="rounded-full border border-line px-3 py-1 text-xs hover:bg-paper-soft">
                Vue bureau
              </NavLink>
            )}
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
                  isActive ? 'border-gold text-ink' : 'border-transparent text-ink-dim hover:text-ink'
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
