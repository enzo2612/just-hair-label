// Types manuels reflétant supabase/migrations/0001_init.sql.
// À remplacer par `supabase gen types typescript` une fois le projet Supabase
// créé (voir README) — en attendant, ce fichier garde l'app type-safe.

export type UserRole = 'admin' | 'dirigeant' | 'collaborateur'
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export type TicketStatus = 'nouvelle' | 'en_cours' | 'en_attente_partenaire' | 'resolue'
export type PackInterestStatus = 'nouvelle' | 'contactee' | 'convertie' | 'perdue'
export type StepStatus = 'a_faire' | 'en_cours' | 'termine'
export type ContentTheme =
  | 'chiffre_affaires'
  | 'rentabilite'
  | 'management'
  | 'communication'
  | 'fidelisation'
  | 'organisation'
export type TicketTheme =
  | 'chiffre_affaires'
  | 'rentabilite'
  | 'recrutement'
  | 'management'
  | 'communication'
  | 'fidelisation'
  | 'autre'

export interface Salon {
  id: string
  raison_sociale: string
  nom_affichage: string
  adresse: string | null
  statut: 'actif' | 'suspendu'
  date_adhesion: string
  logo_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  salon_id: string | null
  role: UserRole
  nom: string
  email: string
  recevoir_recap_hebdo: boolean
  created_at: string
}

export interface ContentCategory {
  id: string
  nom: string
  type: ContentTheme
  ordre: number
}

export interface Content {
  id: string
  titre: string
  categorie_id: string | null
  probleme: string | null
  corps: string
  action: string | null
  exemple_chiffre: string | null
  statut: ContentStatus
  scheduled_at: string | null
  published_at: string | null
  created_by: string | null
  created_at: string
}

export interface Resource {
  id: string
  titre: string
  description: string | null
  fichier_url: string
  categorie_id: string | null
  format: string
  created_at: string
}

export interface Pack {
  id: string
  nom: string
  description: string
  problematique: string | null
  benefices: string | null
  contenu: string | null
  modalites: string | null
  tarif: number | null
  actif: boolean
  ordre: number
}

export interface PackInterest {
  id: string
  salon_id: string
  pack_id: string
  source: 'manuel' | 'auto_recommandation'
  statut: PackInterestStatus
  created_at: string
}

export interface SupportTicket {
  id: string
  salon_id: string
  created_by: string | null
  thematique: TicketTheme
  sujet: string
  statut: TicketStatus
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  auteur_id: string | null
  corps: string
  created_at: string
}

export interface Diagnostic {
  id: string
  salon_id: string
  reponses: Record<string, number>
  score: number
  points_forts: string[]
  axes_amelioration: string[]
  created_at: string
}

export interface ProgressionStep {
  id: string
  titre: string
  objectif: string
  explication: string | null
  conseil: string | null
  checklist: string[]
  ordre: number
}

export interface ProgressionStatusRow {
  id: string
  salon_id: string
  step_id: string
  statut: StepStatus
  completed_at: string | null
}

export interface NotificationRow {
  id: string
  profile_id: string
  type: string
  titre: string
  lien: string | null
  lu: boolean
  created_at: string
}

export interface AutomationLog {
  id: string
  type: string
  resultat: 'succes' | 'erreur'
  details: Record<string, unknown> | null
  created_at: string
}

type TableDef<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> }

export interface Database {
  public: {
    Tables: {
      salons: TableDef<Salon>
      profiles: TableDef<Profile>
      content_categories: TableDef<ContentCategory>
      contents: TableDef<Content>
      resources: TableDef<Resource>
      packs: TableDef<Pack>
      pack_interests: TableDef<PackInterest>
      support_tickets: TableDef<SupportTicket>
      ticket_messages: TableDef<TicketMessage>
      diagnostics: TableDef<Diagnostic>
      progression_steps: TableDef<ProgressionStep>
      progression_status: TableDef<ProgressionStatusRow>
      notifications: TableDef<NotificationRow>
      automation_logs: TableDef<AutomationLog>
    }
  }
}
