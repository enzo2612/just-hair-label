-- Logo propre à chaque salon labellisé, affiché dans son propre espace
-- (brief : personnaliser l'espace de chaque partenaire sans diluer la
-- marque Just Hair Label, qui reste affichée dans l'en-tête).

alter table salons add column if not exists logo_url text;

-- Bucket de stockage public (lecture) pour les logos de salons.
insert into storage.buckets (id, name, public)
values ('salon-logos', 'salon-logos', true)
on conflict (id) do nothing;

-- Convention de chemin : "<salon_id>/logo.<ext>" — chaque salon ne peut
-- déposer/modifier que dans son propre dossier ; l'admin peut tout gérer ;
-- la lecture est publique (nécessaire pour afficher le logo dans l'appli).
create policy salon_logos_public_read on storage.objects
  for select using (bucket_id = 'salon-logos');

create policy salon_logos_salon_insert on storage.objects
  for insert with check (
    bucket_id = 'salon-logos'
    and (is_admin() or (storage.foldername(name))[1] = auth_salon_id()::text)
  );

create policy salon_logos_salon_update on storage.objects
  for update using (
    bucket_id = 'salon-logos'
    and (is_admin() or (storage.foldername(name))[1] = auth_salon_id()::text)
  );

create policy salon_logos_salon_delete on storage.objects
  for delete using (
    bucket_id = 'salon-logos'
    and (is_admin() or (storage.foldername(name))[1] = auth_salon_id()::text)
  );
