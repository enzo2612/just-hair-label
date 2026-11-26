import { useAuth } from '../../hooks/useAuth'
import { useProgressionSteps, useProgressionStatus, useSetStepStatus } from '../../hooks/queries'
import { Card, PageHeader, Spinner, Badge } from '../../components/ui'
import type { StepStatus } from '../../types/database'

export function Parcours() {
  const { profile } = useAuth()
  const { data: steps, isLoading } = useProgressionSteps()
  const { data: statusRows } = useProgressionStatus(profile?.salon_id ?? undefined)
  const setStatus = useSetStepStatus()

  const statusFor = (stepId: string): StepStatus => statusRows?.find((s) => s.step_id === stepId)?.statut ?? 'a_faire'

  const toneFor: Record<StepStatus, 'default' | 'gold' | 'success'> = {
    a_faire: 'default',
    en_cours: 'gold',
    termine: 'success',
  }
  const labelFor: Record<StepStatus, string> = {
    a_faire: 'À faire',
    en_cours: 'En cours',
    termine: 'Terminé',
  }

  return (
    <div>
      <PageHeader
        eyebrow="Gratuit"
        title="Mon parcours de développement"
        description="Des étapes concrètes pour faire progresser votre salon, à votre rythme."
      />

      {isLoading && <Spinner />}

      <div className="space-y-4">
        {steps?.map((step, i) => {
          const current = statusFor(step.id)
          return (
            <Card key={step.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-ink-dim">Étape {i + 1}</p>
                  <h3 className="mt-0.5 font-display text-base text-ink">{step.titre}</h3>
                  <p className="mt-1 text-sm text-ink-dim">{step.objectif}</p>
                </div>
                <Badge tone={toneFor[current]}>{labelFor[current]}</Badge>
              </div>

              {step.explication && <p className="mt-3 text-sm leading-relaxed text-ink-dim">{step.explication}</p>}
              {step.conseil && (
                <p className="mt-2 rounded-lg bg-paper-soft px-3 py-2 text-sm text-ink-dim">
                  <span className="font-medium text-ink">Conseil : </span>
                  {step.conseil}
                </p>
              )}
              {step.checklist?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {step.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-dim">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex gap-2">
                {current !== 'termine' && (
                  <button
                    onClick={() =>
                      profile?.salon_id &&
                      setStatus.mutate({ salon_id: profile.salon_id, step_id: step.id, statut: 'en_cours' })
                    }
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper-soft"
                  >
                    Marquer en cours
                  </button>
                )}
                {current !== 'termine' && (
                  <button
                    onClick={() =>
                      profile?.salon_id &&
                      setStatus.mutate({ salon_id: profile.salon_id, step_id: step.id, statut: 'termine' })
                    }
                    className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-ink/90"
                  >
                    Marquer comme terminé
                  </button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
