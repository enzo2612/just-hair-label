import { useAutomationLogs } from '../../hooks/queries'
import { Card, PageHeader, Spinner, Badge, EmptyState } from '../../components/ui'

const TYPE_LABEL: Record<string, string> = {
  publish_scheduled_content: 'Publication programmée',
  weekly_digest: 'Récapitulatif hebdomadaire',
  inactivity_detection: "Détection d'inactivité",
  monthly_admin_report: 'Rapport mensuel admin',
}

export function AdminAutomatisations() {
  const { data: logs, isLoading } = useAutomationLogs()

  return (
    <div>
      <PageHeader
        eyebrow="Bureau"
        title="Automatisations"
        description="Historique d'exécution des automatisations de la plateforme — publication programmée, relances, rapports."
      />

      {isLoading && <Spinner />}

      <Card className="divide-y divide-line">
        {logs?.map((log) => (
          <div key={log.id} className="flex items-center gap-4 px-5 py-3">
            <Badge tone={log.resultat === 'succes' ? 'success' : 'warn'}>{log.resultat}</Badge>
            <span className="flex-1 text-sm text-ink">{TYPE_LABEL[log.type] ?? log.type}</span>
            <span className="text-xs text-ink-dim">{new Date(log.created_at).toLocaleString('fr-FR')}</span>
          </div>
        ))}
      </Card>
      {!isLoading && (logs?.length ?? 0) === 0 && (
        <EmptyState>Aucune automatisation exécutée pour l'instant — l'historique se remplira dès que les tâches planifiées tourneront sur votre projet Supabase.</EmptyState>
      )}
    </div>
  )
}
