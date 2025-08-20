export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          google_event_id: string | null
          id: string
          lembrete_minutos: number | null
          local_link: string | null
          participantes: string[] | null
          status: string | null
          sync_with_google: boolean | null
          tipo: string | null
          titulo: string
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          google_event_id?: string | null
          id?: string
          lembrete_minutos?: number | null
          local_link?: string | null
          participantes?: string[] | null
          status?: string | null
          sync_with_google?: boolean | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          google_event_id?: string | null
          id?: string
          lembrete_minutos?: number | null
          local_link?: string | null
          participantes?: string[] | null
          status?: string | null
          sync_with_google?: boolean | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cliente_id: string
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      automacao_execucoes: {
        Row: {
          automacao_id: string | null
          cliente_id: string | null
          erro: string | null
          executado_em: string | null
          id: string
          resultado: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          automacao_id?: string | null
          cliente_id?: string | null
          erro?: string | null
          executado_em?: string | null
          id?: string
          resultado?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          automacao_id?: string | null
          cliente_id?: string | null
          erro?: string | null
          executado_em?: string | null
          id?: string
          resultado?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automacao_execucoes_automacao_id_fkey"
            columns: ["automacao_id"]
            isOneToOne: false
            referencedRelation: "automacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automacao_execucoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      automacoes: {
        Row: {
          acoes: Json | null
          ativo: boolean | null
          condicoes: Json | null
          created_at: string | null
          id: string
          nome: string
          trigger_config: Json | null
          trigger_tipo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          acoes?: Json | null
          ativo?: boolean | null
          condicoes?: Json | null
          created_at?: string | null
          id?: string
          nome: string
          trigger_config?: Json | null
          trigger_tipo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          acoes?: Json | null
          ativo?: boolean | null
          condicoes?: Json | null
          created_at?: string | null
          id?: string
          nome?: string
          trigger_config?: Json | null
          trigger_tipo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          data_contrato: string | null
          data_vencimento: string | null
          dias_atraso: number | null
          email: string | null
          empresa: string
          estado: string | null
          id: string
          numero: string | null
          observacoes: string | null
          origem: Database["public"]["Enums"]["project_origin"] | null
          plano_escolhido: string | null
          responsavel: string
          rua: string | null
          servicos_avulsos: Json | null
          site: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          status_pagamento: string | null
          telefone: string | null
          updated_at: string
          user_id: string
          valor_em_atraso: number | null
          valor_plano: number | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          data_contrato?: string | null
          data_vencimento?: string | null
          dias_atraso?: number | null
          email?: string | null
          empresa: string
          estado?: string | null
          id?: string
          numero?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["project_origin"] | null
          plano_escolhido?: string | null
          responsavel: string
          rua?: string | null
          servicos_avulsos?: Json | null
          site?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          status_pagamento?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
          valor_em_atraso?: number | null
          valor_plano?: number | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          data_contrato?: string | null
          data_vencimento?: string | null
          dias_atraso?: number | null
          email?: string | null
          empresa?: string
          estado?: string | null
          id?: string
          numero?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["project_origin"] | null
          plano_escolhido?: string | null
          responsavel?: string
          rua?: string | null
          servicos_avulsos?: Json | null
          site?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          status_pagamento?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
          valor_em_atraso?: number | null
          valor_plano?: number | null
        }
        Relationships: []
      }
      configuracoes_notificacao: {
        Row: {
          antecedencia_dias: number | null
          ativa: boolean | null
          created_at: string | null
          email: boolean | null
          horario_envio: string | null
          id: string
          owner_id: string | null
          push: boolean | null
          sms: boolean | null
          tipo_notificacao: string
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          antecedencia_dias?: number | null
          ativa?: boolean | null
          created_at?: string | null
          email?: boolean | null
          horario_envio?: string | null
          id?: string
          owner_id?: string | null
          push?: boolean | null
          sms?: boolean | null
          tipo_notificacao: string
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          antecedencia_dias?: number | null
          ativa?: boolean | null
          created_at?: string | null
          email?: boolean | null
          horario_envio?: string | null
          id?: string
          owner_id?: string | null
          push?: boolean | null
          sms?: boolean | null
          tipo_notificacao?: string
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      email_history: {
        Row: {
          assunto: string
          cliente_id: string | null
          corpo: string
          data_abertura: string | null
          data_envio: string | null
          email_para: string
          erro: string | null
          id: string
          status: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          assunto: string
          cliente_id?: string | null
          corpo: string
          data_abertura?: string | null
          data_envio?: string | null
          email_para: string
          erro?: string | null
          id?: string
          status?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          assunto?: string
          cliente_id?: string | null
          corpo?: string
          data_abertura?: string | null
          data_envio?: string | null
          email_para?: string
          erro?: string | null
          id?: string
          status?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_history_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          assunto: string
          ativo: boolean | null
          categoria: string
          corpo: string
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
          user_id: string | null
          variaveis: string[] | null
        }
        Insert: {
          assunto: string
          ativo?: boolean | null
          categoria: string
          corpo: string
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          user_id?: string | null
          variaveis?: string[] | null
        }
        Update: {
          assunto?: string
          ativo?: boolean | null
          categoria?: string
          corpo?: string
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          user_id?: string | null
          variaveis?: string[] | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          cliente_id: string
          content: string | null
          created_at: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cliente_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cliente_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          acao_texto: string | null
          acao_url: string | null
          cliente_id: string | null
          created_at: string | null
          data_vencimento: string | null
          id: string
          lida: boolean | null
          mensagem: string
          metadata: Json | null
          owner_id: string | null
          prioridade: string | null
          tipo: string
          titulo: string
          updated_at: string | null
          usuario_id: string | null
          valor_relacionado: number | null
        }
        Insert: {
          acao_texto?: string | null
          acao_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_vencimento?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          metadata?: Json | null
          owner_id?: string | null
          prioridade?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
          usuario_id?: string | null
          valor_relacionado?: number | null
        }
        Update: {
          acao_texto?: string | null
          acao_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_vencimento?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          metadata?: Json | null
          owner_id?: string | null
          prioridade?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          usuario_id?: string | null
          valor_relacionado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nome_completo: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_conclusao: string | null
          data_vencimento: string | null
          descricao: string | null
          id: string
          observacoes: string | null
          prioridade: string | null
          status: string | null
          tipo: string | null
          titulo: string
          updated_at: string | null
          user_id: string | null
          usuario_responsavel: string | null
          valor_relacionado: number | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: string | null
          status?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          user_id?: string | null
          usuario_responsavel?: string | null
          valor_relacionado?: number | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: string | null
          status?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          user_id?: string | null
          usuario_responsavel?: string | null
          valor_relacionado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_history: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_envio: string | null
          id: string
          mensagem: string
          status: string | null
          telefone: string
          template_usado: string | null
          user_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_envio?: string | null
          id?: string
          mensagem: string
          status?: string | null
          telefone: string
          template_usado?: string | null
          user_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_envio?: string | null
          id?: string
          mensagem?: string
          status?: string | null
          telefone?: string
          template_usado?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_history_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_status_pagamento: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_permission: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "ADMINISTRADOR" | "EDITOR" | "USUARIO"
      project_origin: "Tráfego Pago" | "LA Educação" | "Orgânico" | "Indicação"
      project_status: "LEAD" | "Assinante" | "Inadimplente" | "Cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["ADMINISTRADOR", "EDITOR", "USUARIO"],
      project_origin: ["Tráfego Pago", "LA Educação", "Orgânico", "Indicação"],
      project_status: ["LEAD", "Assinante", "Inadimplente", "Cancelado"],
    },
  },
} as const
