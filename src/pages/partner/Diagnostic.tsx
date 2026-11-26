import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCreateDiagnostic, useDiagnostics } from '../../hooks/queries'
import { Card, PageHeader, Spinner } from '../../components/ui'

const AXES: { key: string; label: string }[] = [
  { key: 'commercial', label: 'Activité commerciale' },
  { key: 'rentabilite', label: 'Rentabilité' },
  { key: 'organisation', label: 'Organisation' },
  { key: 'management', label: 'Management' },
  { key: 'communication', label: 'Communication' },
  { key: 'fidelisation', label: 'Fidélisation' },
  { key: 'developpement', label: 'Développement' },
]

export function Diagnostic() {
  const { profile } = useAuth()
  const { data: history, isLoading } = useDiagnostics(profile?.salon_id ?? undefined)
  const createDiagnostic = useCreateDiagnostic()
  const [answers, setAnswers] = useState<Record<string, number>>(
    Object.fromEntries(AXES.map((a) => [a.key, 3])),
  )
  const [result, setResult] = useState<{ score: number; forts: string[]; axes: string[] } | null>(null)

  function handleSubmit() {
    if (!profile?.salon_id) return
    const values = Object.values(answers)
    const score = Math.round((values.reduce((a, b) => a + b, 0) / (values.length * 5)) * 100)
    const sorted = [...AXES].sort((a, b) => answers[b.key] - answers[a.key])
    const points_forts = sorted.slice(0, 2).map((a) => a.label)
    const axes_amelioration = sorted.slice(-2).map((a) => a.label)

    createDiagnostic.mutate(
      { salon_id: profile.salon_id, reponses: answers, score, points_forts, axes_amelioration },
      { onSuccess: () => setResult({ score, forts: points_forts, axes: axes_amelioration }) },
    )
  }

  const lastResult = result ?? (history?.[0]
    ? { score: history[0].score, forts: history[0].points_forts, axes: history[0].axes_amelioration }
    : null)

  return (
    <div>
      <PageHeader
        eyebrow="Gratuit · outil indicatif"
        title="Diagnostic de performance"
        description="Un indicateur, pas un audit financier certifié — à refaire régulièrement pour mesurer votre progression."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="space-y-5">
            {AXES.map((axe) => (
              <div key={axe.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-ink">{axe.label}</span>
                  <span className="text-ink-dim">{answers[axe.key]} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={answers[axe.key]}
                  onChange={(e) => setAnswers((a) => ({ ...a, [axe.key]: Number(e.target.value) }))}
                  className="w-full accent-ink"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={createDiagnostic.isPending}
            className="mt-6 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
          >
            Calculer mon score
          </button>
        </Card>

        <div className="space-y-4">
          {isLoading && <Spinner />}
          {lastResult && (
            <Card className="p-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">Votre score</p>
              <p className="mt-1 font-display text-4xl text-ink">{lastResult.score}/100</p>
              <div className="mt-4 text-left text-sm">
                <p className="font-medium text-success">Points forts</p>
                <ul className="mt-1 space-y-0.5 text-ink-dim">
                  {lastResult.forts.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <p className="mt-3 font-medium text-warn">Axes d'amélioration</p>
                <ul className="mt-1 space-y-0.5 text-ink-dim">
                  {lastResult.axes.map((a) => (
                    <li key={a}>• {a}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-xs text-ink-dim">
                Voici les axes prioritaires que nous vous recommandons de travailler — retrouvez des conseils dans
                votre Coach Business.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
