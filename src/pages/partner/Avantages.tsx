import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePacks, useRegisterPackInterest } from '../../hooks/queries'
import { Card, PageHeader, Spinner } from '../../components/ui'

export function Avantages() {
  const { profile } = useAuth()
  const { data: packs, isLoading } = usePacks()
  const registerInterest = useRegisterPackInterest()
  const [sentFor, setSentFor] = useState<string | null>(null)

  return (
    <div>
      <PageHeader
        eyebrow="Mes avantages"
        title="Packs de services complémentaires"
        description="Des accompagnements optionnels pour aller plus loin, en complément de ce qui est déjà inclus dans votre label."
      />

      {isLoading && <Spinner />}

      <div className="grid gap-5 sm:grid-cols-2">
        {packs?.map((pack) => (
          <Card key={pack.id} className="flex flex-col p-6">
            <h3 className="font-display text-lg text-ink">{pack.nom}</h3>
            <p className="mt-2 text-sm text-ink-dim">{pack.description}</p>
            {pack.problematique && (
              <p className="mt-3 text-xs text-ink-dim">
                <span className="font-medium text-ink">Pour qui : </span>
                {pack.problematique}
              </p>
            )}
            {pack.benefices && (
              <p className="mt-1 text-xs text-ink-dim">
                <span className="font-medium text-ink">Bénéfice : </span>
                {pack.benefices}
              </p>
            )}
            <div className="mt-4 text-sm text-ink-dim">{pack.tarif ? `${pack.tarif} €` : 'Tarif sur devis'}</div>
            <button
              disabled={!profile?.salon_id || registerInterest.isPending || sentFor === pack.id}
              onClick={() => {
                if (!profile?.salon_id) return
                registerInterest.mutate(
                  { salon_id: profile.salon_id, pack_id: pack.id },
                  { onSuccess: () => setSentFor(pack.id) },
                )
              }}
              className="mt-5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-60"
            >
              {sentFor === pack.id ? 'Demande envoyée ✓' : 'Je suis intéressé'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
