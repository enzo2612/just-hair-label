// Edge Function: publish-scheduled-content
//
// Déclenchée par pg_cron (voir supabase/migrations/0002_cron_jobs.sql), plusieurs fois
// par jour. Fait passer au statut "published" tout contenu programmé dont la date est
// arrivée — c'est l'automatisation "publication programmée" du brief (section 7 et 16).
//
// Ne nécessite aucun service payant : tourne sur le palier gratuit des Edge Functions
// Supabase, déclenchée par l'extension pg_cron, elle aussi gratuite et native à Postgres.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Les appels pg_cron passent un secret partagé pour éviter qu'un tiers ne déclenche
  // la fonction à volonté. Voir supabase/migrations/0002_cron_jobs.sql.
  const expectedSecret = Deno.env.get('CRON_SECRET')
  if (expectedSecret && req.headers.get('x-cron-secret') !== expectedSecret) {
    return new Response('unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const now = new Date().toISOString()

  const { data: due, error: selectError } = await supabase
    .from('contents')
    .select('id, titre')
    .eq('statut', 'scheduled')
    .lte('scheduled_at', now)

  if (selectError) {
    await supabase.from('automation_logs').insert({
      type: 'publish_scheduled_content',
      resultat: 'erreur',
      details: { message: selectError.message },
    })
    return new Response(JSON.stringify({ error: selectError.message }), { status: 500 })
  }

  if (!due || due.length === 0) {
    await supabase.from('automation_logs').insert({
      type: 'publish_scheduled_content',
      resultat: 'succes',
      details: { published: 0 },
    })
    return new Response(JSON.stringify({ published: 0 }), { status: 200 })
  }

  const ids = due.map((c) => c.id)
  const { error: updateError } = await supabase
    .from('contents')
    .update({ statut: 'published', published_at: now })
    .in('id', ids)

  await supabase.from('automation_logs').insert({
    type: 'publish_scheduled_content',
    resultat: updateError ? 'erreur' : 'succes',
    details: updateError
      ? { message: updateError.message }
      : { published: ids.length, titres: due.map((c) => c.titre) },
  })

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ published: ids.length }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
})
