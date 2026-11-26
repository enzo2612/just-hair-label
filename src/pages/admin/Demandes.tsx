import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSendTicketMessage, useTicketMessages, useTickets, useUpdateTicketStatus } from '../../hooks/queries'
import { Card, PageHeader, Spinner, Badge, EmptyState } from '../../components/ui'
import type { TicketStatus } from '../../types/database'

const STATUS_LABEL: Record<TicketStatus, string> = {
  nouvelle: 'Nouvelle',
  en_cours: 'En cours',
  en_attente_partenaire: 'En attente du partenaire',
  resolue: 'Résolue',
}
const STATUS_TONE: Record<TicketStatus, 'default' | 'gold' | 'success'> = {
  nouvelle: 'gold',
  en_cours: 'gold',
  en_attente_partenaire: 'default',
  resolue: 'success',
}

export function AdminDemandes() {
  const { profile } = useAuth()
  const { data: tickets, isLoading } = useTickets()
  const updateStatus = useUpdateTicketStatus()
  const [selected, setSelected] = useState<string | null>(null)
  const { data: messages } = useTicketMessages(selected)
  const sendMessage = useSendTicketMessage()
  const [reply, setReply] = useState('')

  const activeTicket = tickets?.find((t) => t.id === selected)

  function handleReply(e: FormEvent) {
    e.preventDefault()
    if (!selected || !profile?.id || !reply.trim()) return
    sendMessage.mutate({ ticket_id: selected, auteur_id: profile.id, corps: reply })
    if (activeTicket?.statut === 'nouvelle') updateStatus.mutate({ id: selected, statut: 'en_attente_partenaire' })
    setReply('')
  }

  return (
    <div>
      <PageHeader eyebrow="Bureau" title="Demandes d'accompagnement" description="Les demandes envoyées par les salons labellisés." />

      {isLoading && <Spinner />}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-2">
          {tickets?.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`block w-full rounded-xl border p-3 text-left text-sm ${selected === t.id ? 'border-ink' : 'border-line hover:bg-paper-soft'}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge tone={STATUS_TONE[t.statut]}>{STATUS_LABEL[t.statut]}</Badge>
                <span className="text-xs text-ink-dim">{t.salons?.nom_affichage}</span>
              </div>
              <p className="line-clamp-2 text-ink">{t.sujet}</p>
            </button>
          ))}
          {!isLoading && (tickets?.length ?? 0) === 0 && <EmptyState>Aucune demande pour l'instant.</EmptyState>}
        </div>

        <Card className="p-6">
          {!activeTicket ? (
            <p className="text-sm text-ink-dim">Sélectionnez une demande.</p>
          ) : (
            <div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-base text-ink">{activeTicket.sujet}</h3>
                  <p className="text-xs text-ink-dim">{activeTicket.salons?.nom_affichage}</p>
                </div>
                <select
                  value={activeTicket.statut}
                  onChange={(e) => updateStatus.mutate({ id: activeTicket.id, statut: e.target.value as TicketStatus })}
                  className="rounded-lg border border-line px-2 py-1.5 text-xs outline-none focus:border-gold"
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {messages?.map((m) => (
                  <div key={m.id} className="rounded-lg bg-paper-soft px-3 py-2 text-sm text-ink">
                    {m.corps}
                  </div>
                ))}
                {(!messages || messages.length === 0) && <p className="text-sm text-ink-dim">Aucun échange pour l'instant.</p>}
              </div>

              <form onSubmit={handleReply} className="mt-4 flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Répondre au salon…"
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
                  Répondre
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
