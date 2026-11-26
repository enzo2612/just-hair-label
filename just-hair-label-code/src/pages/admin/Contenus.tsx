import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useContentCategories, useContents, useCreateContent, useDeleteContent } from '../../hooks/queries'
import { Card, PageHeader, Spinner, Badge, EmptyState } from '../../components/ui'
import type { ContentStatus } from '../../types/database'

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Programmé',
  published: 'Publié',
  archived: 'Archivé',
}
const STATUS_TONE: Record<ContentStatus, 'default' | 'gold' | 'success'> = {
  draft: 'default',
  scheduled: 'gold',
  published: 'success',
  archived: 'default',
}

export function AdminContenus() {
  const { profile } = useAuth()
  const { data: categories } = useContentCategories()
  const { data: contents, isLoading } = useContents()
  const createContent = useCreateContent()
  const deleteContent = useDeleteContent()

  const [form, setForm] = useState({
    titre: '',
    categorie_id: '',
    probleme: '',
    corps: '',
    action: '',
    exemple_chiffre: '',
    mode: 'draft' as 'draft' | 'scheduled' | 'published',
    scheduled_at: '',
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.titre.trim() || !form.corps.trim()) return

    const statut: ContentStatus = form.mode
    await createContent.mutateAsync({
      titre: form.titre,
      categorie_id: form.categorie_id || null,
      probleme: form.probleme || null,
      corps: form.corps,
      action: form.action || null,
      exemple_chiffre: form.exemple_chiffre || null,
      statut,
      scheduled_at: form.mode === 'scheduled' && form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      published_at: form.mode === 'published' ? new Date().toISOString() : null,
      created_by: profile?.id,
    })
    setForm({ titre: '', categorie_id: '', probleme: '', corps: '', action: '', exemple_chiffre: '', mode: 'draft', scheduled_at: '' })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bureau"
        title="Contenus — Coach Business"
        description="Préparez, programmez ou publiez un conseil. Un contenu programmé se publie automatiquement à la date choisie."
      />

      <Card className="mb-8 p-6">
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Titre"
              value={form.titre}
              onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
              className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <select
              value={form.categorie_id}
              onChange={(e) => setForm((f) => ({ ...f, categorie_id: e.target.value }))}
              className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="">Thématique…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <input
            placeholder="Problématique concrète adressée"
            value={form.probleme}
            onChange={(e) => setForm((f) => ({ ...f, probleme: e.target.value }))}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <textarea
            placeholder="Corps du conseil"
            rows={4}
            value={form.corps}
            onChange={(e) => setForm((f) => ({ ...f, corps: e.target.value }))}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Action à réaliser"
              value={form.action}
              onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
              className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <input
              placeholder="Exemple chiffré (optionnel)"
              value={form.exemple_chiffre}
              onChange={(e) => setForm((f) => ({ ...f, exemple_chiffre: e.target.value }))}
              className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={form.mode}
              onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as typeof f.mode }))}
              className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="draft">Enregistrer en brouillon</option>
              <option value="scheduled">Programmer la publication</option>
              <option value="published">Publier maintenant</option>
            </select>
            {form.mode === 'scheduled' && (
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
              />
            )}
            <button
              type="submit"
              disabled={createContent.isPending}
              className="ml-auto rounded-lg bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Card>

      {isLoading && <Spinner />}

      <div className="space-y-2">
        {contents?.map((c) => (
          <Card key={c.id} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge tone={STATUS_TONE[c.statut]}>{STATUS_LABEL[c.statut]}</Badge>
                {c.statut === 'scheduled' && c.scheduled_at && (
                  <span className="text-xs text-ink-dim">
                    → {new Date(c.scheduled_at).toLocaleString('fr-FR')}
                  </span>
                )}
              </div>
              <p className="font-medium text-ink">{c.titre}</p>
            </div>
            <button
              onClick={() => deleteContent.mutate(c.id)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-dim hover:bg-paper-soft"
            >
              Supprimer
            </button>
          </Card>
        ))}
        {!isLoading && (contents?.length ?? 0) === 0 && <EmptyState>Aucun contenu pour l'instant.</EmptyState>}
      </div>
    </div>
  )
}
