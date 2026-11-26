import { useContents, usePackInterests, useSalons, useTickets } from '../../hooks/queries'
import { Card, PageHeader, Spinner } from '../../components/ui'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">{label}</p>
      <p className="mt-1.5 font-display text-3xl text-ink">{value}</p>
    </Card>
  )
}

export function AdminStatistiques() {
  const { data: salons, isLoading: loadingSalons } = useSalons()
  const { data: contents } = useContents()
  const { data: tickets } = useTickets()
  const { data: interests } = usePackInterests()

  const actifs = salons?.filter((s) => s.statut === 'actif').length ?? 0
  const contenusPublies = contents?.filter((c) => c.statut === 'published').length ?? 0
  const demandesOuvertes = tickets?.filter((t) => t.statut !== 'resolue').length ?? 0

  const packCounts = new Map<string, number>()
  interests?.forEach((i) => {
    const name = i.packs?.nom ?? 'Pack supprimé'
    packCounts.set(name, (packCounts.get(name) ?? 0) + 1)
  })
  const topPacks = [...packCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div>
      <PageHeader eyebrow="Bureau" title="Statistiques" description="Un tableau de bord simple pour piloter la plateforme en quelques minutes." />

      {loadingSalons && <Spinner />}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Partenaires inscrits" value={salons?.length ?? 0} />
        <StatCard label="Partenaires actifs" value={actifs} />
        <StatCard label="Contenus publiés" value={contenusPublies} />
        <StatCard label="Demandes ouvertes" value={demandesOuvertes} />
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-display text-base text-ink">Packs les plus demandés</h3>
        {topPacks.length === 0 && <p className="text-sm text-ink-dim">Pas encore de demande commerciale.</p>}
        <div className="space-y-3">
          {topPacks.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm text-ink">{name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-soft">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${(count / (topPacks[0]?.[1] ?? 1)) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-xs text-ink-dim">{count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
