import { useState } from 'react'
import { useResources } from '../../hooks/queries'
import { Card, PageHeader, Spinner, EmptyState } from '../../components/ui'

export function Outils() {
  const { data: resources, isLoading } = useResources()
  const [search, setSearch] = useState('')

  const filtered = resources?.filter((r) => r.titre.toLowerCase().includes(search.toLowerCase())) ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Gratuit"
        title="Mes outils"
        description="Modèles de réunions, checklists commerciales, guides de fidélisation et supports pratiques, prêts à l'emploi."
      />

      <input
        type="search"
        placeholder="Rechercher un document…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full max-w-sm rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
      />

      {isLoading && <Spinner />}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((r) => (
          <Card key={r.id} className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium text-ink">{r.titre}</h3>
              {r.description && <p className="mt-0.5 text-xs text-ink-dim">{r.description}</p>}
            </div>
            <a
              href={r.fichier_url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper-soft"
            >
              Télécharger
            </a>
          </Card>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && <EmptyState>Aucun document ne correspond à votre recherche.</EmptyState>}
    </div>
  )
}
