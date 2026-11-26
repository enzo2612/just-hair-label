import { useSalons } from '../../hooks/queries'
import { Card, PageHeader, Spinner, Badge } from '../../components/ui'

export function AdminPartenaires() {
  const { data: salons, isLoading } = useSalons()

  return (
    <div>
      <PageHeader
        eyebrow="Bureau"
        title="Partenaires"
        description="Les salons et instituts labellisés, et leur statut sur la plateforme."
      />

      {isLoading && <Spinner />}

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper-soft text-xs uppercase tracking-wide text-ink-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Salon</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Labellisé depuis</th>
            </tr>
          </thead>
          <tbody>
            {salons?.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{s.nom_affichage}</div>
                  <div className="text-xs text-ink-dim">{s.raison_sociale}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={s.statut === 'actif' ? 'success' : 'warn'}>{s.statut}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-dim">
                  {new Date(s.date_adhesion).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
