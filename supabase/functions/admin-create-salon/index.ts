// Fonction Edge "admin-create-salon"
// ---------------------------------------------------------------------------
// Appelée depuis Bureau > Nouveau partenaire (src/pages/admin/NouveauPartenaire.tsx).
// Réservée aux comptes admin : crée la fiche salon ET le compte Auth de son
// dirigeant en une seule opération, puis renvoie un lien de connexion à usage
// unique (type "recovery") qu'Enzo transmet lui-même par SMS/email — aucun
// envoi automatique, il garde la main sur le message envoyé au salon.
//
// Déploiement : `supabase functions deploy admin-create-salon`
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY sont fournies
// automatiquement par l'environnement des fonctions Edge, rien à configurer).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Non authentifié.')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Client scopé au token de l'appelant, uniquement pour vérifier son rôle.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userErr,
    } = await callerClient.auth.getUser()
    if (userErr || !user) throw new Error('Session invalide.')

    const { data: callerProfile, error: profErr } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profErr || callerProfile?.role !== 'admin') throw new Error('Réservé au Bureau.')

    const body = await req.json()
    const nom_affichage = String(body.nom_affichage ?? '').trim()
    const raison_sociale = String(body.raison_sociale ?? nom_affichage).trim()
    const adresse = body.adresse ? String(body.adresse).trim() : null
    const date_adhesion = body.date_adhesion || new Date().toISOString().slice(0, 10)
    const email = String(body.email ?? '').trim().toLowerCase()
    const nom_dirigeant = String(body.nom_dirigeant ?? '').trim()

    if (!nom_affichage || !email) throw new Error('Nom du salon et email obligatoires.')

    // Client service-role : seule la fonction Edge y a accès, jamais le navigateur.
    const admin = createClient(supabaseUrl, serviceKey)

    const { data: salon, error: salonErr } = await admin
      .from('salons')
      .insert({ nom_affichage, raison_sociale, adresse, date_adhesion, statut: 'actif' })
      .select()
      .single()
    if (salonErr) throw salonErr

    const tempPassword = crypto.randomUUID()

    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'dirigeant', salon_id: salon.id, nom: nom_dirigeant },
    })
    if (createErr) {
      // Fiche salon orpheline sinon : on la retire si le compte n'a pas pu être créé.
      await admin.from('salons').delete().eq('id', salon.id)
      throw createErr
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
    })
    if (linkErr) throw linkErr

    return new Response(JSON.stringify({ salon, lien_connexion: linkData.properties?.action_link ?? null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
