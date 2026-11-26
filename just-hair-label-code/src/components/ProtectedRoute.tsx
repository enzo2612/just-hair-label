import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types/database'

export function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode
  /** Rôles autorisés. Omis = tout utilisateur connecté. */
  allow?: UserRole[]
}) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-ink-dim">
        Chargement…
      </div>
    )
  }

  if (!session) return <Navigate to="/connexion" replace />

  if (allow && profile && !allow.includes(profile.role)) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/app'} replace />
  }

  return <>{children}</>
}
