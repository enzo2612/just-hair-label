import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type {
  AutomationLog,
  Content,
  ContentCategory,
  ContentStatus,
  Diagnostic,
  Pack,
  PackInterest,
  Profile,
  ProgressionStatusRow,
  ProgressionStep,
  Resource,
  Salon,
  StepStatus,
  SupportTicket,
  TicketMessage,
  TicketTheme,
} from '../types/database'

// ---------------------------------------------------------------------------
// Contenus / Coach Business
// ---------------------------------------------------------------------------

export function useContentCategories() {
  return useQuery({
    queryKey: ['content_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('content_categories').select('*').order('ordre')
      if (error) throw error
      return data as ContentCategory[]
    },
  })
}

export function useContents(statut?: ContentStatus) {
  return useQuery({
    queryKey: ['contents', statut ?? 'all'],
    queryFn: async () => {
      let query = supabase.from('contents').select('*').order('created_at', { ascending: false })
      if (statut) query = query.eq('statut', statut)
      const { data, error } = await query
      if (error) throw error
      return data as Content[]
    },
  })
}

export function useCreateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Content>) => {
      const { error } = await supabase.from('contents').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contents'] }),
  })
}

export function useDeleteContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contents').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contents'] }),
  })
}

// ---------------------------------------------------------------------------
// Bibliothèque de ressources
// ---------------------------------------------------------------------------

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Resource[]
    },
  })
}

// ---------------------------------------------------------------------------
// Packs
// ---------------------------------------------------------------------------

export function usePacks() {
  return useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('packs').select('*').order('ordre')
      if (error) throw error
      return data as Pack[]
    },
  })
}

export function useRegisterPackInterest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ salon_id, pack_id }: { salon_id: string; pack_id: string }) => {
      const { error } = await supabase
        .from('pack_interests')
        .insert({ salon_id, pack_id, source: 'manuel' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pack_interests'] }),
  })
}

export function usePackInterests() {
  return useQuery({
    queryKey: ['pack_interests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pack_interests')
        .select('*, salons(nom_affichage), packs(nom)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (PackInterest & { salons: { nom_affichage: string } | null; packs: { nom: string } | null })[]
    },
  })
}

// ---------------------------------------------------------------------------
// Demandes d'accompagnement
// ---------------------------------------------------------------------------

export function useTickets(salonId?: string) {
  return useQuery({
    queryKey: ['tickets', salonId ?? 'all'],
    queryFn: async () => {
      let query = supabase.from('support_tickets').select('*, salons(nom_affichage)').order('created_at', { ascending: false })
      if (salonId) query = query.eq('salon_id', salonId)
      const { data, error } = await query
      if (error) throw error
      return data as (SupportTicket & { salons: { nom_affichage: string } | null })[]
    },
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { salon_id: string; created_by: string; thematique: TicketTheme; sujet: string }) => {
      const { error } = await supabase.from('support_tickets').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: SupportTicket['statut'] }) => {
      const { error } = await supabase.from('support_tickets').update({ statut }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export function useTicketMessages(ticketId: string | null) {
  return useQuery({
    queryKey: ['ticket_messages', ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId as string)
        .order('created_at')
      if (error) throw error
      return data as TicketMessage[]
    },
  })
}

export function useSendTicketMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { ticket_id: string; auteur_id: string; corps: string }) => {
      const { error } = await supabase.from('ticket_messages').insert(payload)
      if (error) throw error
    },
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['ticket_messages', variables.ticket_id] }),
  })
}

// ---------------------------------------------------------------------------
// Diagnostic de performance
// ---------------------------------------------------------------------------

export function useDiagnostics(salonId?: string) {
  return useQuery({
    queryKey: ['diagnostics', salonId],
    enabled: !!salonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('salon_id', salonId as string)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Diagnostic[]
    },
  })
}

export function useCreateDiagnostic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<Diagnostic, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('diagnostics').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diagnostics'] }),
  })
}

// ---------------------------------------------------------------------------
// Parcours de progression
// ---------------------------------------------------------------------------

export function useProgressionSteps() {
  return useQuery({
    queryKey: ['progression_steps'],
    queryFn: async () => {
      const { data, error } = await supabase.from('progression_steps').select('*').order('ordre')
      if (error) throw error
      return data as ProgressionStep[]
    },
  })
}

export function useProgressionStatus(salonId?: string) {
  return useQuery({
    queryKey: ['progression_status', salonId],
    enabled: !!salonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progression_status')
        .select('*')
        .eq('salon_id', salonId as string)
      if (error) throw error
      return data as ProgressionStatusRow[]
    },
  })
}

export function useSetStepStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ salon_id, step_id, statut }: { salon_id: string; step_id: string; statut: StepStatus }) => {
      const { error } = await supabase
        .from('progression_status')
        .upsert(
          { salon_id, step_id, statut, completed_at: statut === 'termine' ? new Date().toISOString() : null },
          { onConflict: 'salon_id,step_id' },
        )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progression_status'] }),
  })
}

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Profile>) => {
      const { error } = await supabase.from('profiles').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

// ---------------------------------------------------------------------------
// Admin : partenaires & automatisations
// ---------------------------------------------------------------------------

export function useSalons() {
  return useQuery({
    queryKey: ['salons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('salons').select('*').order('date_adhesion', { ascending: false })
      if (error) throw error
      return data as Salon[]
    },
  })
}

export function useSalon(salonId?: string) {
  return useQuery({
    queryKey: ['salon', salonId],
    enabled: !!salonId,
    queryFn: async () => {
      const { data, error } = await supabase.from('salons').select('*').eq('id', salonId as string).single()
      if (error) throw error
      return data as Salon
    },
  })
}

// Dépôt du logo propre à un salon (bucket "salon-logos", voir
// 0003_salon_logo.sql) : upload du fichier puis mise à jour de
// salons.logo_url avec son URL publique.
export function useUploadSalonLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ salonId, file }: { salonId: string; file: File }) => {
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${salonId}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('salon-logos')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (uploadError) throw uploadError

      const { data: pub } = supabase.storage.from('salon-logos').getPublicUrl(path)
      // on ajoute un paramètre de cache-busting : même nom de fichier à
      // chaque remplacement, le navigateur doit recharger la nouvelle image.
      const logo_url = `${pub.publicUrl}?v=${Date.now()}`

      const { error: updateError } = await supabase.from('salons').update({ logo_url }).eq('id', salonId)
      if (updateError) throw updateError
      return logo_url
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['salon', variables.salonId] })
      qc.invalidateQueries({ queryKey: ['salons'] })
    },
  })
}

export function useAutomationLogs() {
  return useQuery({
    queryKey: ['automation_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as AutomationLog[]
    },
  })
}
