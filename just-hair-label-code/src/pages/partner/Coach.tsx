import { useState } from 'react'
import { useContentCategories, useContents } from '../../hooks/queries'
import { Card, PageHeader, Spinner, EmptyState, Badge } from '../../components/ui'

export function Coach() {
  const { data: categories } = useContentCategories()
  const { data: contents, isLoading } = useContents('published')
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all')

  const filtered = contents?.filter((c) => activeCategory === 'all' || c.categorie_id === activeCategory) ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Gratuit"
        title="Mon Coach Business"
        description="Des conseils concrets pour développer votre chiffre d'affaires, votre rentabilité, votre équipe et votre communication."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${activeCategory === 'all' ? 'border-ink bg-ink text-paper' : 'border-line text-ink-dim'}`}
        >
          Tout
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${activeCategory === cat.id ? 'border-ink bg-ink text-paper' : 'border-line text-ink-dim'}`}
          >
            {cat.nom}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((c) => (
          <Card key={c.id} className="p-5">
            {c.probleme && <Badge tone="gold">{c.probleme}</Badge>}
            <h3 className="mt-2 font-display text-base text-ink">{c.titre}</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-dim">{c.corps}</p>
            {c.exemple_chiffre && (
              <p className="mt-3 rounded-lg bg-paper-soft px-3 py-2 text-xs text-ink-dim">
                <span className="font-medium text-ink">En chiffres : </span>
                {c.exemple_chiffre}
              </p>
            )}
            {c.action && (
              <p className="mt-3 text-sm font-medium text-ink">
                À faire : <span className="font-normal text-ink-dim">{c.action}</span>
              </p>
            )}
          </Card>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <EmptyState>Aucun conseil publié dans cette thématique pour l'instant.</EmptyState>
      )}
    </div>
  )
}
