export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chatbot_documents: {
        Row: {
          id: string
          chatbot_user: string
          filename: string
          content: string
          file_size: number
          upload_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chatbot_user: string
          filename: string
          content: string
          file_size: number
          upload_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chatbot_user?: string
          filename?: string
          content?: string
          file_size?: number
          upload_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_embeddings: {
        Row: {
          id: string
          document_id: string
          chatbot_user: string
          chunk_text: string
          chunk_index: number
          embedding: number[]
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          chatbot_user: string
          chunk_text: string
          chunk_index: number
          embedding: number[]
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          chatbot_user?: string
          chunk_text?: string
          chunk_index?: number
          embedding?: number[]
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dentist_homepage: {
        Row: {
          address: string | null
          bio: string | null
          color_palette: string | null
          created_at: string | null
          enabled: boolean | null
          id: number
          model: string | null
          phone: string | null
          schedule: string | null
          slug: string | null
          specialty: string | null
          theme_preference: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          bio?: string | null
          color_palette?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: number
          model?: string | null
          phone?: string | null
          schedule?: string | null
          slug?: string | null
          specialty?: string | null
          theme_preference?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          bio?: string | null
          color_palette?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: number
          model?: string | null
          phone?: string | null
          schedule?: string | null
          slug?: string | null
          specialty?: string | null
          theme_preference?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          city: string | null
          clinic_address: string | null
          clinic_name: string | null
          clinic_phone: string | null
          consultation_price: string | null
          created_at: string | null
          cro: string | null
          gender: string | null
          id: number
          is_professor: boolean | null
          is_student: boolean | null
          name: string | null
          profession: string | null
          specialty: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          consultation_price?: string | null
          created_at?: string | null
          cro?: string | null
          gender?: string | null
          id?: number
          is_professor?: boolean | null
          is_student?: boolean | null
          name?: string | null
          profession?: string | null
          specialty?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          consultation_price?: string | null
          created_at?: string | null
          cro?: string | null
          gender?: string | null
          id?: number
          is_professor?: boolean | null
          is_student?: boolean | null
          name?: string | null
          profession?: string | null
          specialty?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          city: string | null
          color_palette: string | null
          created_at: string | null
          gender: string | null
          id: number
          is_professor: boolean | null
          is_student: boolean | null
          name: string | null
          profession: string | null
          state: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          birth_date?: string | null
          city?: string | null
          color_palette?: string | null
          created_at?: string | null
          gender?: string | null
          id?: number
          is_professor?: boolean | null
          is_student?: boolean | null
          name?: string | null
          profession?: string | null
          state?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          birth_date?: string | null
          city?: string | null
          color_palette?: string | null
          created_at?: string | null
          gender?: string | null
          id?: number
          is_professor?: boolean | null
          is_student?: boolean | null
          name?: string | null
          profession?: string | null
          state?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
