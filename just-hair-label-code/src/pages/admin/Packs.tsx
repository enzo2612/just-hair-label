import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { usePackInterests, usePacks } from '../../hooks/queries'
import { Card, PageHeader, Spinner, Badge, EmptyState } from '../../components/ui'

export function AdminPacks() {
  const { data: packs, isLoading } = usePacks()
  const { data: interests } = usePackInterests()
  const qc = useQueryClient()

  const toggleActif = useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { error } = await supabase.from('packs').update({ actif }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packs'] }),
  })

  const createPack = useMutation({
    mutationFn: async (payload: { nom: string; description: string; tarif: number | null }) => {
      const { error } = await supabase.from('packs').insert({ ...payload, ordre: (packs?.length ?? 0) + 1 })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packs'] }),
  })

  const [form, setForm] = useState({ nom: '', description: '', tarif: '' })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) return
    createPack.mutate({ nom: form.nom, description: form.description, tarif: form.tarif ? Number(form.tarif) : null })
    setForm({ nom: '', description: '', tarif: '' })
  }

  return (
    <div>
      <PageHeader eyebrow="Bureau" title="Packs" description="Le catalogue de packs proposés aux salons labellisés." />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Card className="mb-6 p-5">
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
              <input
                placeholder="Nom du pack"
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold sm:col-span-2"
              />
              <input
                placeholder="Tarif (€)"
                value={form.tarif}
                onChange={(e) => setForm((f) => ({ ...f, tarif: e.target.value }))}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <button className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">Ajouter</button>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold sm:col-span-4"
                rows={2}
              />
            </form>
          </Card>

          {isLoading && <Spinner />}
          <div className="space-y-2">
            {packs?.map((p) => (
              <Card key={p.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-ink">{p.nom}</p>
                  <p className="text-xs text-ink-dim">{p.description}</p>
                </div>
                <span className="text-sm text-ink-dim">{p.tarif ? `${p.tarif} €` : 'Sur devis'}</span>
                <label className="flex items-center gap-1.5 text-xs text-ink-dim">
                  <input
                    type="checkbox"
                    checked={p.actif}
                    onChange={(e) => toggleActif.mutate({ id: p.id, actif: e.target.checked })}
                    className="h-3.5 w-3.5 accent-ink"
                  />
                  Actif
                </label>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-display text-base text-ink">Demandes commerciales</h3>
          <div className="space-y-2">
            {interests?.map((i) => (
              <Card key={i.id} className="p-4">
                <div className="mb-1 flex items-center justify-between">
                  <Badge tone={i.statut === 'nouvelle' ? 'gold' : 'default'}>{i.statut}</Badge>
                  <span className="text-xs text-ink-dim">{i.source === 'auto_recommandation' ? 'Suggestion auto' : 'Manuel'}</span>
                </div>
                <p className="text-sm font-medium text-ink">{i.salons?.nom_affichage ?? '—'}</p>
                <p className="text-xs text-ink-dim">{i.packs?.nom ?? '—'}</p>
              </Card>
            ))}
            {(interests?.length ?? 0) === 0 && <EmptyState>Aucune demande pour l'instant.</EmptyState>}
          </div>
        </div>
      </div>
    </div>
  )
}
