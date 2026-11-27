import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Card, PageHeader } from '../../components/ui'

// Création d'un partenaire côté Bureau : crée la fiche salon ET le compte de
// son dirigeant (via la fonction Edge "admin-create-salon"), puis affiche un
// lien de connexion à usage unique qu'Enzo transmet lui-même (SMS/email) —
// pas d'envoi automatique, il garde la main sur le message envoyé au salon.
//
// Les paramètres d'URL (nom, societe, ville, email, gerant) permettent de
// pré-remplir ce formulaire depuis un autre outil (ex. le pipeline "Label
// Just Hair" de Gestion My Just Hair, au passage d'un prospect à "Signé").

type FormState = {
  nom_affichage: string
  raison_sociale: string
  adresse: string
  email: string
  nom_dirigeant: string
  date_adhesion: string
}

export function AdminNouveauPartenaire() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({
    nom_affichage: params.get('nom') ?? '',
    raison_sociale: params.get('societe') ?? '',
    adresse: params.get('ville') ?? '',
    email: params.get('email') ?? '',
    nom_dirigeant: params.get('gerant') ?? '',
    date_adhesion: new Date().toISOString().slice(0, 10),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ nom: string; lien: string | null } | null>(null)
  const [copied, setCopied] = useState(false)

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error: invokeError } = await supabase.functions.invoke('admin-create-salon', { body: form })
    setLoading(false)
    if (invokeError) {
      setError(invokeError.message)
      return
    }
    if (data?.error) {
      setError(data.error)
      return
    }
    setResult({ nom: data.salon.nom_affichage, lien: data.lien_connexion ?? null })
  }

  async function copyLink() {
    if (!result?.lien) return
    try {
      await navigator.clipboard.writeText(result.lien)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Presse-papiers indisponible : le lien reste affiché, copiable à la main.
    }
  }

  if (result) {
    return (
      <div>
        <PageHeader eyebrow="Bureau" title="Partenaire créé" />
        <Card className="max-w-lg p-6">
          <p className="text-sm text-ink">
            <span className="font-medium">{result.nom}</span> a été ajouté, avec un accès prêt pour son dirigeant.
          </p>
          {result.lien ? (
            <>
              <p className="mt-4 text-sm text-ink-dim">
                Transmettez-lui ce lien (SMS ou email) pour qu'il choisisse son mot de passe et accède à son espace :
              </p>
              <div className="mt-2 break-all rounded-lg border border-line bg-paper-soft p-3 text-xs text-ink">
                {result.lien}
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="mt-3 rounded-lg border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper-soft"
              >
                {copied ? 'Copié ✓' : 'Copier le lien'}
              </button>
            </>
          ) : (
            <p className="mt-4 text-sm text-warn">Compte créé, mais le lien de connexion n'a pas pu être généré.</p>
          )}
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="mt-6 block text-sm font-medium text-gold hover:underline"
          >
            ← Retour aux partenaires
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bureau"
        title="Nouveau partenaire"
        description="Crée le salon et l'accès de son dirigeant sur JUST HAIR LABEL."
      />
      <Card className="max-w-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nom du salon *" value={form.nom_affichage} onChange={(v) => update('nom_affichage', v)} required />
          <Field
            label="Raison sociale"
            value={form.raison_sociale}
            onChange={(v) => update('raison_sociale', v)}
            placeholder="Si différente du nom affiché"
          />
          <Field label="Ville / adresse" value={form.adresse} onChange={(v) => update('adresse', v)} />
          <Field
            label="Date d'adhésion"
            type="date"
            value={form.date_adhesion}
            onChange={(v) => update('date_adhesion', v)}
          />
          <Field label="Nom du dirigeant" value={form.nom_dirigeant} onChange={(v) => update('nom_dirigeant', v)} />
          <Field
            label="Email du dirigeant *"
            type="email"
            value={form.email}
            onChange={(v) => update('email', v)}
            required
          />
          {error && <p className="text-sm text-warn">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? 'Création…' : 'Créer le partenaire'}
          </button>
        </form>
      </Card>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}): ReactNode {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-gold"
      />
    </label>
  )
}
