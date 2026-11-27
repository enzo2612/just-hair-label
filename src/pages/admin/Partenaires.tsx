import { useRef, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSalons, useUploadSalonLogo } from '../../hooks/queries'
import { Card, PageHeader, Spinner, Badge } from '../../components/ui'
import type { Salon } from '../../types/database'

// Dépôt du logo géré côté bureau : c'est l'admin qui importe/remplace le
// logo de chaque salon labellisé (pas le salon lui-même en libre-service).
function LogoCell({ salon }: { salon: Salon }) {
  const uploadLogo = useUploadSalonLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadLogo.mutate({ salonId: salon.id, file })
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadLogo.isPending}
        title={salon.logo_url ? 'Remplacer le logo' : 'Déposer un logo'}
        className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper-soft transition hover:border-gold disabled:opacity-60"
      >
        {salon.logo_url ? (
          <img src={salon.logo_url} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <span className="text-[10px] text-ink-dim">+</span>
        )}
        <span className="absolute inset-0 hidden items-center justify-center bg-ink/70 text-[9px] font-medium leading-tight text-paper group-hover:flex">
          {uploadLogo.isPending ? '…' : 'Modifier'}
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      {uploadLogo.isError && <span className="text-xs text-warn">Échec</span>}
    </div>
  )
}

export function AdminPartenaires() {
  const { data: salons, isLoading } = useSalons()

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="Bureau"
          title="Partenaires"
          description="Les salons et instituts labellisés, leur statut sur la plateforme. Déposez ici le logo de chaque salon : il s'affichera dans son propre espace."
        />
        <Link
          to="/admin/nouveau"
          className="shrink-0 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
        >
          + Nouveau partenaire
        </Link>
      </div>

      {isLoading && <Spinner />}

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper-soft text-xs uppercase tracking-wide text-ink-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Logo</th>
              <th className="px-4 py-3 font-medium">Salon</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Labellisé depuis</th>
            </tr>
          </thead>
          <tbody>
            {salons?.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <LogoCell salon={s} />
                </td>
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
