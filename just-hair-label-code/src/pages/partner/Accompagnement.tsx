import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCreateTicket, useSendTicketMessage, useTicketMessages, useTickets } from '../../hooks/queries'
import { Card, PageHeader, Spinner, Badge, EmptyState } from '../../components/ui'
import type { TicketStatus, TicketTheme } from '../../types/database'

const THEMES: { value: TicketTheme; label: string }[] = [
  { value: 'chiffre_affaires', label: 'Développer mon chiffre d\'affaires' },
  { value: 'rentabilite', label: 'Améliorer ma rentabilité' },
  { value: 'recrutement', label: 'Recruter' },
  { value: 'management', label: 'Manager mon équipe' },
  { value: 'communication', label: 'Développer ma communication' },
  { value: 'fidelisation', label: 'Fidéliser mes clients' },
  { value: 'autre', label: 'Autre demande' },
]

const STATUS_LABEL: Record<TicketStatus, string> = {
  nouvelle: 'Nouvelle',
  en_cours: 'En cours',
  en_attente_partenaire: 'En attente de vous',
  resolue: 'Résolue',
}
const STATUS_TONE: Record<TicketStatus, 'default' | 'gold' | 'success'> = {
  nouvelle: 'gold',
  en_cours: 'gold',
  en_attente_partenaire: 'default',
  resolue: 'success',
}

export function Accompagnement() {
  const { profile } = useAuth()
  const { data: tickets, isLoading } = useTickets(profile?.salon_id ?? undefined)
  const createTicket = useCreateTicket()
  const [selected, setSelected] = useState<string | null>(null)
  const [thematique, setThematique] = useState<TicketTheme>('chiffre_affaires')
  const [sujet, setSujet] = useState('')

  const { data: messages } = useTicketMessages(selected)
  const sendMessage = useSendTicketMessage()
  const [reply, setReply] = useState('')

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!profile?.salon_id || !sujet.trim()) return
    await createTicket.mutateAsync({ salon_id: profile.salon_id, created_by: profile.id, thematique, sujet })
    setSujet('')
  }

  function handleReply(e: FormEvent) {
    e.preventDefault()
    if (!selected || !profile?.id || !reply.trim()) return
    sendMessage.mutate({ ticket_id: selected, auteur_id: profile.id, corps: reply })
    setReply('')
  }

  const activeTicket = tickets?.find((t) => t.id === selected)

  return (
    <div>
      <PageHeader
        eyebrow="Gratuit"
        title="Just Hair m'accompagne"
        description="Une question de gestion, de recrutement ou de communication ? Décrivez votre besoin, l'équipe Just Hair vous répond."
      />

      <Card className="mb-8 p-6">
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <select
              value={thematique}
              onChange={(e) => setThematique(e.target.value as TicketTheme)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold sm:max-w-xs"
            >
              {THEMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Décrivez votre besoin en une phrase…"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          <button
            type="submit"
            disabled={createTicket.isPending}
            className="h-fit self-end rounded-lg bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
          >
            Envoyer
          </button>
        </form>
      </Card>

      {isLoading && <Spinner />}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {tickets?.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`block w-full rounded-xl border p-3 text-left text-sm ${selected === t.id ? 'border-ink' : 'border-line hover:bg-paper-soft'}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge tone={STATUS_TONE[t.statut]}>{STATUS_LABEL[t.statut]}</Badge>
              </div>
              <p className="line-clamp-2 text-ink">{t.sujet}</p>
            </button>
          ))}
          {!isLoading && (tickets?.length ?? 0) === 0 && <EmptyState>Aucune demande pour l'instant.</EmptyState>}
        </div>

        <Card className="p-6">
          {!activeTicket ? (
            <p className="text-sm text-ink-dim">Sélectionnez une demande pour voir l'échange.</p>
          ) : (
            <div className="flex h-full flex-col">
              <h3 className="font-display text-base text-ink">{activeTicket.sujet}</h3>
              <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
                {messages?.map((m) => (
                  <div key={m.id} className="rounded-lg bg-paper-soft px-3 py-2 text-sm text-ink">
                    {m.corps}
                  </div>
                ))}
                {(!messages || messages.length === 0) && (
                  <p className="text-sm text-ink-dim">Pas encore de réponse — votre demande est en cours de traitement.</p>
                )}
              </div>
              <form onSubmit={handleReply} className="mt-4 flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Ajouter une précision…"
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <button type="submit" className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-paper-soft">
                  Envoyer
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
