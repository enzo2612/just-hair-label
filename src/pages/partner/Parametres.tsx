import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useUpdateProfile } from '../../hooks/queries'
import { Card, PageHeader } from '../../components/ui'

export function Parametres() {
  const { profile } = useAuth()
  const updateProfile = useUpdateProfile()
  const [recap, setRecap] = useState(profile?.recevoir_recap_hebdo ?? true)
  const [saved, setSaved] = useState(false)

  if (!profile) return null

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
