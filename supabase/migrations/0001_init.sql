-- JUST HAIR LABEL — schéma initial (Phase 1)
-- Convention : toutes les tables métier sont rattachées à un salon via salon_id
-- (sauf les tables de référence globales : content_categories, packs, progression_steps).
-- La RLS isole chaque salon ; l'administrateur Just Hair (role = 'admin') voit tout.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type user_role as enum ('admin', 'dirigeant', 'collaborateur');
create type content_status as enum ('draft', 'scheduled', 'published', 'archived');
create type ticket_status as enum ('nouvelle', 'en_cours', 'en_attente_partenaire', 'resolue');
create type pack_interest_status as enum ('nouvelle', 'contactee', 'convertie', 'perdue');
create type step_status as enum ('a_faire', 'en_cours', 'termine');

-- ---------------------------------------------------------------------------
-- Salons & profils
-- ---------------------------------------------------------------------------

create table salons (
  id uuid primary key default gen_random_uuid(),
  raison_sociale text not null,
  nom_affichage text not null,
  adresse text,
  statut text not null default 'actif' check (statut in ('actif', 'suspendu')),
  date_adhesion date not null default current_date,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  salon_id uuid references salons (id) on delete set null,
  role user_role not null default 'dirigeant',
  nom text not null,
  email text not null,
  recevoir_recap_hebdo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Coach Business : catégories, contenus
-- ---------------------------------------------------------------------------

create table content_categories (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  -- les 6 thématiques du Coach Business, ou 'bibliotheque' pour une ressource générale
  type text not null check (
    type in (
      'chiffre_affaires',
      'rentabilite',
      'management',
      'communication',
      'fidelisation',
      'organisation'
    )
  ),
  ordre int not null default 0
);

create table contents (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  categorie_id uuid references content_categories (id) on delete set null,
  probleme text, -- la problématique concrète adressée
  corps text not null,
  action text, -- action à réaliser
  exemple_chiffre text,
  statut content_status not null default 'draft',
  scheduled_at timestamptz, -- quand le contenu doit se publier automatiquement
  published_at timestamptz,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index contents_scheduled_idx on contents (statut, scheduled_at)
  where statut = 'scheduled';

-- ---------------------------------------------------------------------------
-- Bibliothèque de ressources
-- ---------------------------------------------------------------------------

create table resources (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  fichier_url text not null,
  categorie_id uuid references content_categories (id) on delete set null,
  format text not null default 'pdf',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Packs de services complémentaires
-- ---------------------------------------------------------------------------

create table packs (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text not null,
  problematique text,
  benefices text,
  contenu text,
  modalites text,
  tarif numeric(10, 2),
  actif boolean not null default true,
  ordre int not null default 0
);

create table pack_interests (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons (id) on delete cascade,
  pack_id uuid not null references packs (id) on delete cascade,
  source text not null default 'manuel' check (source in ('manuel', 'auto_recommandation')),
  statut pack_interest_status not null default 'nouvelle',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Demandes d'accompagnement
-- ---------------------------------------------------------------------------

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons (id) on delete cascade,
  created_by uuid references profiles (id),
  thematique text not null check (
    thematique in (
      'chiffre_affaires',
      'rentabilite',
      'recrutement',
      'management',
      'communication',
      'fidelisation',
      'autre'
    )
  ),
  sujet text not null,
  statut ticket_status not null default 'nouvelle',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets (id) on delete cascade,
  auteur_id uuid references profiles (id),
  corps text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Diagnostic de performance
-- ---------------------------------------------------------------------------

create table diagnostics (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons (id) on delete cascade,
  reponses jsonb not null,
  score int not null check (score between 0 and 100),
  points_forts text[] not null default '{}',
  axes_amelioration text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Parcours de progression
-- ---------------------------------------------------------------------------

create table progression_steps (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  objectif text not null,
  explication text,
  conseil text,
  checklist text[] not null default '{}',
  ordre int not null default 0
);

create table progression_status (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons (id) on delete cascade,
  step_id uuid not null references progression_steps (id) on delete cascade,
  statut step_status not null default 'a_faire',
  completed_at timestamptz,
  unique (salon_id, step_id)
);

-- ---------------------------------------------------------------------------
-- Notifications & journal d'automatisation
-- ---------------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  titre text not null,
  lien text,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);

create table automation_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  resultat text not null check (resultat in ('succes', 'erreur')),
  details jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Fonctions utilitaires RLS
-- ---------------------------------------------------------------------------

create or replace function auth_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_salon_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select salon_id from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth_role() = 'admin';
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table salons enable row level security;
alter table profiles enable row level security;
alter table content_categories enable row level security;
alter table contents enable row level security;
alter table resources enable row level security;
alter table packs enable row level security;
alter table pack_interests enable row level security;
alter table support_tickets enable row level security;
alter table ticket_messages enable row level security;
alter table diagnostics enable row level security;
alter table progression_steps enable row level security;
alter table progression_status enable row level security;
alter table notifications enable row level security;
alter table automation_logs enable row level security;

-- salons : chacun voit son propre salon, l'admin voit tout
create policy salons_select on salons for select
  using (is_admin() or id = auth_salon_id());
create policy salons_admin_write on salons for insert with check (is_admin());
create policy salons_admin_update on salons for update using (is_admin());

-- profiles : chacun voit les profils de son salon (+ le sien), l'admin voit tout
create policy profiles_select on profiles for select
  using (is_admin() or salon_id = auth_salon_id() or id = auth.uid());
create policy profiles_self_update on profiles for update
  using (id = auth.uid() or is_admin());
create policy profiles_admin_insert on profiles for insert with check (is_admin() or id = auth.uid());

-- content_categories : lecture publique (aux utilisateurs connectés), écriture admin
create policy categories_select on content_categories for select using (auth.uid() is not null);
create policy categories_admin_write on content_categories for insert with check (is_admin());
create policy categories_admin_update on content_categories for update using (is_admin());
create policy categories_admin_delete on content_categories for delete using (is_admin());

-- contents : les partenaires ne voient que le contenu publié, l'admin voit tout
create policy contents_select_published on contents for select
  using (statut = 'published' or is_admin());
create policy contents_admin_write on contents for insert with check (is_admin());
create policy contents_admin_update on contents for update using (is_admin());
create policy contents_admin_delete on contents for delete using (is_admin());

-- resources : lecture par tout utilisateur connecté, écriture admin
create policy resources_select on resources for select using (auth.uid() is not null);
create policy resources_admin_write on resources for insert with check (is_admin());
create policy resources_admin_update on resources for update using (is_admin());
create policy resources_admin_delete on resources for delete using (is_admin());

-- packs : lecture des packs actifs par tous, admin voit/gère tout
create policy packs_select on packs for select using (actif or is_admin());
create policy packs_admin_write on packs for insert with check (is_admin());
create policy packs_admin_update on packs for update using (is_admin());
create policy packs_admin_delete on packs for delete using (is_admin());

-- pack_interests : un salon voit/crée les siens, l'admin voit/gère tout
create policy pack_interests_select on pack_interests for select
  using (is_admin() or salon_id = auth_salon_id());
create policy pack_interests_insert on pack_interests for insert
  with check (is_admin() or salon_id = auth_salon_id());
create policy pack_interests_admin_update on pack_interests for update using (is_admin());

-- support_tickets : un salon voit/crée les siens, l'admin voit/gère tout
create policy tickets_select on support_tickets for select
  using (is_admin() or salon_id = auth_salon_id());
create policy tickets_insert on support_tickets for insert
  with check (is_admin() or salon_id = auth_salon_id());
create policy tickets_update on support_tickets for update
  using (is_admin() or salon_id = auth_salon_id());

-- ticket_messages : visible si on voit le ticket parent
create policy ticket_messages_select on ticket_messages for select
  using (
    is_admin()
    or exists (
      select 1 from support_tickets t
      where t.id = ticket_messages.ticket_id and t.salon_id = auth_salon_id()
    )
  );
create policy ticket_messages_insert on ticket_messages for insert
  with check (
    is_admin()
    or exists (
      select 1 from support_tickets t
      where t.id = ticket_messages.ticket_id and t.salon_id = auth_salon_id()
    )
  );

-- diagnostics : un salon voit/crée les siens, l'admin voit tout
create policy diagnostics_select on diagnostics for select
  using (is_admin() or salon_id = auth_salon_id());
create policy diagnostics_insert on diagnostics for insert
  with check (is_admin() or salon_id = auth_salon_id());

-- progression_steps : référence globale, lecture pour tous, écriture admin
create policy progression_steps_select on progression_steps for select using (auth.uid() is not null);
create policy progression_steps_admin_write on progression_steps for insert with check (is_admin());
create policy progression_steps_admin_update on progression_steps for update using (is_admin());

-- progression_status : un salon voit/modifie le sien, admin voit tout
create policy progression_status_select on progression_status for select
  using (is_admin() or salon_id = auth_salon_id());
create policy progression_status_upsert on progression_status for insert
  with check (is_admin() or salon_id = auth_salon_id());
create policy progression_status_update on progression_status for update
  using (is_admin() or salon_id = auth_salon_id());

-- notifications : chacun voit les siennes
create policy notifications_select on notifications for select
  using (profile_id = auth.uid() or is_admin());
create policy notifications_update on notifications for update
  using (profile_id = auth.uid() or is_admin());

-- automation_logs : admin seulement
create policy automation_logs_admin on automation_logs for select using (is_admin());

-- ---------------------------------------------------------------------------
-- Création automatique du profil à l'inscription
-- (le rôle et le salon_id sont fournis via user_metadata lors de l'invitation,
--  typiquement envoyée par un administrateur depuis le back-office)
-- ---------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, salon_id, role, nom, email)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'salon_id', '')::uuid,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'dirigeant'),
    coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
