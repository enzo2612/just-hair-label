import { createClient } from '@supabase/supabase-js'

// NB : on n'alimente pas createClient<Database>() ici. Le typage fin de chaque requête
// vient des interfaces de src/types/database.ts, appliquées explicitement dans
// src/hooks/queries.ts — plus simple à maintenir à la main que de coller exactement au
// format attendu par le générique GenericSchema de supabase-js. Remplacez ce fichier par
// les types générés (`supabase gen types typescript`) quand le projet Supabase existe,
// si vous voulez le typage de bout en bout sur le client lui-même.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Vrai seulement tant qu'aucun projet Supabase n'est connecté. App.tsx s'en sert pour
// afficher un écran de configuration explicite plutôt qu'une page blanche : createClient()
// lève une exception si on lui passe une URL vide, donc on lui donne un placeholder valide
// pour que l'app démarre quand même (les appels réseau échoueront simplement, proprement).
export const supabaseConfigMissing = !supabaseUrl || !supabaseAnonKey

if (supabaseConfigMissing) {
  // Voir le README pour la procédure de configuration complète.
  console.error(
    'Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. Copiez .env.example vers .env.local et renseignez votre projet Supabase.',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
