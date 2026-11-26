import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useContents, useProgressionStatus, useProgressionSteps, useSalon } from '../../hooks/queries'
import { Card, Badge, Spinner } from '../../components/ui'

export function Accueil() {
  const { profile } = useAuth()
  const { data: salon } = useSalon(profile?.salon_id ?? undefined)
  const { data: contents, isLoading } = useContents('published')
  const { data: steps } = useProgressionSteps()
  const { data: status } = useProgressionStatus(profile?.salon_id ?? undefined)

  const latest = contents?.slice(0, 3) ?? []
  const conseilDeLaSemaine = latest[0]

  const doneCount = status?.filter((s) => s.statut === 'termine').length ?? 0
  const totalSteps = steps?.length ?? 0

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        {salon?.logo_url && (
          <img
            src={salon.logo_url}
            alt={salon.nom_affichage}
            className="h-14 w-14 shrink-0 rounded-xl border border-line bg-paper object-contain p-1.5"
          />
        )}
        <div>
          <h1 className="font-display text-2xl text-ink">
            Bonjour {profile?.nom?.split(' ')[0] ?? ''}, prêt·e à faire progresser votre salon cette semaine ?
          </h1>
          <p className="mt-1 text-sm text-ink-dim">Voici ce qui vous attend sur JUST HAIR LABEL.</p>
        </div>
      </div>

      {isLoading && <Spinner />}

      {conseilDeLaSemaine && (
        <Card className="p-6">
          <Badge tone="gold">Le conseil de la semaine</Badge>
          <h2 className="mt-3 font-display text-lg text-ink">{conseilDeLaSemaine.titre}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-dim">{conseilDeLaSemaine.corps.slice(0, 220)}…</p>
          {conseilDeLaSemaine.action && (
            <p className="mt-3 text-sm font-medium text-ink">
              Votre prochaine action : <span className="font-normal text-ink-dim">{conseilDeLaSemaine.action}</span>
            </p>
          )}
          <Link to="/app/coach" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">
            Voir tous les conseils →
          </Link>
        </Card>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-base text-ink">Votre parcours</h3>
          <p className="mt-1 text-sm text-ink-dim">
            {doneCount} / {totalSteps} étapes terminées
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-soft">
            <div
              className="h-full bg-gold"
              style={{ width: totalSteps ? `${(doneCount / totalSteps) * 100}%` : '0%' }}
            />
          </div>
          <Link to="/app/parcours" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">
            Continuer mon parcours →
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-base text-ink">Besoin d'aide ?</h3>
          <p className="mt-1 text-sm text-ink-dim">
            Une question de gestion, de recrutement ou de communication ? L'équipe Just Hair vous répond.
          </p>
          <Link
            to="/app/accompagnement"
            className="mt-4 inline-block rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
          >
            Just Hair m'accompagne
          </Link>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base text-ink">Actualités du réseau</h3>
          <Link to="/app/coach" className="text-sm text-gold hover:underline">
            Tout voir
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {latest.map((c) => (
            <Card key={c.id} className="p-4">
              <h4 className="font-medium text-ink">{c.titre}</h4>
              <p className="mt-1.5 text-xs text-ink-dim">{c.corps.slice(0, 110)}…</p>
            </Card>
          ))}
          {!isLoading && latest.length === 0 && (
            <p className="text-sm text-ink-dim">Pas encore de contenu publié.</p>
          )}
        </div>
      </div>
    </div>
  )
}
