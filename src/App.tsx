import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth'
import { supabaseConfigMissing } from './lib/supabase'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PartnerLayout } from './layouts/PartnerLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { Login } from './pages/auth/Login'
import { Accueil } from './pages/partner/Accueil'
import { Coach } from './pages/partner/Coach'
import { Outils } from './pages/partner/Outils'
import { Parcours } from './pages/partner/Parcours'
import { Avantages } from './pages/partner/Avantages'
import { Accompagnement } from './pages/partner/Accompagnement'
import { Diagnostic } from './pages/partner/Diagnostic'
import { Parametres } from './pages/partner/Parametres'
import { AdminPartenaires } from './pages/admin/Partenaires'
import { AdminNouveauPartenaire } from './pages/admin/NouveauPartenaire'
import { AdminContenus } from './pages/admin/Contenus'
import { AdminPacks } from './pages/admin/Packs'
import { AdminDemandes } from './pages/admin/Demandes'
import { AdminStatistiques } from './pages/admin/Statistiques'
import { AdminAutomatisations } from './pages/admin/Automatisations'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function SetupNeeded() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-soft px-4">
      <div className="max-w-md rounded-2xl border border-line bg-paper p-8 text-center shadow-sm">
        <img src="/logo-black.png" alt="Just Hair" className="mx-auto mb-4 h-8 w-auto" />
        <h1 className="font-display text-xl text-ink">Configuration requise</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          Aucun projet Supabase n'est connecté. Copiez <code className="rounded bg-paper-soft px-1 py-0.5">.env.example</code> vers{' '}
          <code className="rounded bg-paper-soft px-1 py-0.5">.env.local</code>, renseignez l'URL et la clé anonyme de votre
          projet, puis relancez l'application. Voir le README pour la procédure complète.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (supabaseConfigMissing) return <SetupNeeded />

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/connexion" element={<Login />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute allow={['dirigeant', 'collaborateur']}>
                  <PartnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Accueil />} />
              <Route path="coach" element={<Coach />} />
              <Route path="outils" element={<Outils />} />
              <Route path="parcours" element={<Parcours />} />
              <Route path="avantages" element={<Avantages />} />
              <Route path="accompagnement" element={<Accompagnement />} />
              <Route path="diagnostic" element={<Diagnostic />} />
              <Route path="parametres" element={<Parametres />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminPartenaires />} />
              <Route path="nouveau" element={<AdminNouveauPartenaire />} />
              <Route path="contenus" element={<AdminContenus />} />
              <Route path="packs" element={<AdminPacks />} />
              <Route path="demandes" element={<AdminDemandes />} />
              <Route path="statistiques" element={<AdminStatistiques />} />
              <Route path="automatisations" element={<AdminAutomatisations />} />
            </Route>

            <Route path="/" element={<Navigate to="/connexion" replace />} />
            <Route path="*" element={<Navigate to="/connexion" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
