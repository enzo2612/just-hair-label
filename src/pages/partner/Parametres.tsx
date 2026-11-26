import { useRef, useState, type ChangeEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSalon, useUpdateProfile, useUploadSalonLogo } from '../../hooks/queries'
import { Card, PageHeader } from '../../components/ui'

export function Parametres() {
  const { profile } = useAuth()
  const updateProfile = useUpdateProfile()
  const { data: salon } = useSalon(profile?.salon_id ?? undefined)
  const uploadLogo = useUploadSalonLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [recap, setRecap] = useState(profile?.recevoir_recap_hebdo ?? true)
  const [saved, setSaved] = useState(false)

  if (!profile) return null

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile?.salon_id) return
    uploadLogo.mutate({ salonId: profile.salon_id, file })
  }

  return (
    <div>
      <PageHeader title="Paramètres" description="Votre profil et vos préférences de notification." />

      <div className="grid gap-5 sm:max-w-lg">
        <Card className="p-6">
          <h3 className="font-display text-base text-ink">Mon profil</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-dim">Nom</dt>
              <dd className="text-ink">{profile.nom}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-dim">E-mail</dt>
              <dd className="text-ink">{profile.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-dim">Rôle</dt>
              <dd className="capitalize text-ink">{profile.role}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-base text-ink">Logo de mon salon</h3>
          <p className="mt-1 text-sm text-ink-dim">
            Affiché sur votre espace, en plus de la marque Just Hair Label. Format carré recommandé, fond
            transparent (PNG ou SVG).
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-line bg-paper-soft">
              {salon?.logo_url ? (
                <img src={salon.logo_url} alt={salon.nom_affichage} className="h-full w-full object-contain p-1.5" />
              ) : (
                <span className="text-xs text-ink-dim">Aucun</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLogo.isPending}
                className="rounded-lg border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper-soft disabled:opacity-50"
              >
                {uploadLogo.isPending ? 'Envoi…' : salon?.logo_url ? 'Remplacer le logo' : 'Déposer un logo'}
              </button>
              {uploadLogo.isError && <p className="mt-2 text-xs text-warn">Échec de l'envoi, réessayez.</p>}
              {uploadLogo.isSuccess && <p className="mt-2 text-xs text-success">Logo mis à jour.</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-base text-ink">Notifications</h3>
          <label className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink-dim">Recevoir le récapitulatif hebdomadaire par e-mail</span>
            <input
              type="checkbox"
              checked={recap}
              onChange={(e) => {
                setRecap(e.target.checked)
                updateProfile.mutate(
                  { id: profile.id, recevoir_recap_hebdo: e.target.checked },
                  { onSuccess: () => setSaved(true) },
                )
              }}
              className="h-4 w-4 accent-ink"
            />
          </label>
          {saved && <p className="mt-2 text-xs text-success">Préférence enregistrée.</p>}
        </Card>
      </div>
    </div>
  )
}
