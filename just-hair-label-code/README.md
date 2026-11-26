# JUST HAIR LABEL

Plateforme digitale d'accompagnement des salons labellisés Just Hair — Phase 1 (MVP).

Stack : React + TypeScript + Vite + Tailwind CSS (frontend) · Supabase — Postgres, Auth, Storage, Edge Functions (backend) · Netlify (hébergement du frontend). Indépendante du logiciel Aaros : aucune base, clé ou compte partagé.

## 1. Créer le projet Supabase

1. Sur [supabase.com](https://supabase.com), créez un nouveau projet (le plan gratuit suffit largement pour démarrer : 500 Mo de base, 1 Go de stockage, 50 000 utilisateurs actifs/mois).
2. Dans **Project Settings → API**, notez l'**URL du projet** et la clé **anon public**.
3. Installez la CLI Supabase si besoin (`npm install -g supabase`), puis liez le projet local :
   ```bash
   supabase login
   supabase link --project-ref <votre-ref-projet>
   ```
4. Appliquez les migrations (schéma + RLS) :
   ```bash
   supabase db push
   ```
5. (Optionnel mais recommandé pour tester) chargez les données de démonstration :
   ```bash
   psql "$(supabase db url)" -f supabase/seed.sql
   ```
   Ces données sont clairement des exemples (thématiques, packs, étapes de parcours) — à adapter ou supprimer avant la mise en production réelle.

## 2. Configurer le frontend

```bash
cp .env.example .env.local
# renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

## 3. Créer le premier compte administrateur

Le plus simple, depuis le SQL Editor du dashboard Supabase, après avoir créé un utilisateur via **Authentication → Add user** :

```sql
update profiles set role = 'admin' where email = 'vous@justhair.fr';
```

Les comptes suivants (dirigeants labellisés) s'invitent ensuite depuis Supabase Auth avec les métadonnées `role` et `salon_id` pour que le profil se crée automatiquement avec le bon rattachement (voir le trigger `handle_new_user` dans `supabase/migrations/0001_init.sql`).

## 4. Déployer le frontend sur Netlify

1. Poussez ce dépôt sur GitHub/GitLab et connectez-le à Netlify, ou utilisez `netlify deploy`.
2. `netlify.toml` configure déjà la commande de build (`npm run build`) et le dossier de publication (`dist`), avec une redirection SPA.
3. Dans **Site settings → Environment variables**, ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.

## 5. Activer l'automatisation "publication programmée"

C'est l'automatisation centrale du brief (un contenu programmé par l'admin se publie seul à la date prévue, sans service payant — `pg_cron` + Edge Functions, tous deux gratuits sur Supabase).

```bash
# 1. Déployez la fonction
supabase functions deploy publish-scheduled-content

# 2. Générez un secret partagé et configurez-le côté fonction
openssl rand -hex 32
supabase secrets set CRON_SECRET=<le secret généré>

# 3. Depuis le SQL Editor du dashboard, enregistrez les secrets Vault
#    (jamais en clair dans une migration versionnée) :
select vault.create_secret(
  'https://<votre-ref-projet>.supabase.co/functions/v1/publish-scheduled-content',
  'cron_publish_url'
);
select vault.create_secret('<le même secret généré ci-dessus>', 'cron_shared_secret');

# 4. Relancez la migration du job cron (ou exécutez son contenu manuellement) :
supabase db push
```

Vous pouvez suivre l'historique d'exécution dans l'application, onglet **Bureau → Automatisations**.

## Structure du projet

```
src/
  lib/supabase.ts        client Supabase
  hooks/useAuth.tsx       session, profil, rôle
  hooks/queries.ts        tous les accès aux données (React Query)
  components/             UI partagée (Card, Badge, Button…)
  layouts/                PartnerLayout, AdminLayout (navigation par rôle)
  pages/partner/           Accueil, Coach Business, Outils, Parcours, Avantages,
                           Accompagnement, Diagnostic, Paramètres
  pages/admin/              Partenaires, Contenus, Packs, Demandes, Statistiques,
                           Automatisations
supabase/
  migrations/              schéma SQL + politiques RLS + job cron
  functions/                Edge Functions (publication programmée)
  seed.sql                 données de démonstration
```

## Ce qui est livré en Phase 1 (voir le brief pour le détail complet)

- Authentification et 3 rôles (admin, dirigeant labellisé, collaborateur), données isolées par salon via RLS.
- Tableau de bord partenaire, Coach Business, bibliothèque de ressources, parcours de progression, packs, demandes d'accompagnement, diagnostic de performance.
- Back-office : gestion des partenaires, des contenus (avec publication programmée automatique), des packs, des demandes, statistiques, suivi des automatisations.
- Design system sobre (blanc / noir / gris + touches dorées), responsive mobile.

## Pas encore dans cette version (Phases 2 et 3 du brief)

- E-mails automatisés (récapitulatif hebdomadaire, relance d'inactivité) — prévus avec un service à palier gratuit type Resend.
- Recommandations commerciales automatiques basées sur les contenus consultés.
- Assistant conversationnel et génération de contenu assistée par IA (nécessitent une API payante — à activer uniquement après validation budgétaire).

## Données de démonstration

Les données chargées par `supabase/seed.sql` (thématiques, packs, étapes de parcours) sont des exemples destinés à tester l'application. Ne les présentez jamais comme des données réelles — remplacez-les par vos propres contenus avant toute mise en production.
