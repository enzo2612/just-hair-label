-- Planification de l'automatisation "publication programmée" (brief, sections 7 et 16).
--
-- pg_cron et pg_net sont des extensions Postgres natives, gratuites sur Supabase :
-- aucune automatisation planifiée de ce projet ne nécessite de service tiers payant.
--
-- ÉTAPE MANUELLE REQUISE AVANT QUE CE JOB NE FONCTIONNE (une fois, depuis le SQL Editor
-- du dashboard Supabase — jamais de secret en clair dans une migration versionnée) :
--
--   select vault.create_secret(
--     'https://<votre-ref-projet>.supabase.co/functions/v1/publish-scheduled-content',
--     'cron_publish_url'
--   );
--   select vault.create_secret('<un secret aléatoire, ex. généré avec openssl rand -hex 32>', 'cron_shared_secret');
--
-- …puis définissez le même secret côté fonction Edge :
--   supabase secrets set CRON_SECRET=<le même secret aléatoire>
--
-- Voir le README pour la procédure complète.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if exists (select 1 from vault.decrypted_secrets where name = 'cron_publish_url') then
    perform cron.schedule(
      'publish-scheduled-content',
      '*/15 * * * *', -- toutes les 15 minutes : suffisant pour un calendrier lundi/mercredi/vendredi
      $cron$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'cron_publish_url'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_shared_secret')
        ),
        body := '{}'::jsonb
      );
      $cron$
    );
  else
    raise notice 'Secrets Vault "cron_publish_url" / "cron_shared_secret" absents : job cron non créé. Voir les instructions en haut de ce fichier, puis relancez ce bloc manuellement depuis le SQL Editor.';
  end if;
end $$;
