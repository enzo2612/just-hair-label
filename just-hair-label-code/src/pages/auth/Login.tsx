import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Login() {
  const { session, profile, loading, signInWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session && !loading) {
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/app'} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signInWithPassword(email, password)
    if (error) setError(error)
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-soft px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper">
            <span className="font-display text-lg">L</span>
          </div>
          <h1 className="font-display text-2xl text-ink">JUST HAIR LABEL</h1>
          <p className="mt-1 text-sm text-ink-dim">Vous êtes indépendant, mais vous n'êtes plus seul.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-dim" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-dim" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>

          {error && <p className="text-sm text-warn">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-60"
          >
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-dim">
          Accès réservé aux salons labellisés Just Hair. Besoin d'aide ? Contactez votre bureau Just Hair.
        </p>
      </div>
    </div>
  )
}
