export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          company_name: string | null
          email: string | null
          phone: string | null
          status: "new" | "qualified" | "discarded" | "converted"
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          company_name?: string | null
          email?: string | null
          phone?: string | null
          status?: "new" | "qualified" | "discarded" | "converted"
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          company_name?: string | null
          email?: string | null
          phone?: string | null
          status?: "new" | "qualified" | "discarded" | "converted"
          created_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          client_id: string
          channel: "whatsapp" | "email" | "internal"
          message: string
          agent_response: string | null
          intent_detected: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          channel: "whatsapp" | "email" | "internal"
          message: string
          agent_response?: string | null
          intent_detected?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          channel?: "whatsapp" | "email" | "internal"
          message?: string
          agent_response?: string | null
          intent_detected?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          status: "draft" | "active" | "completed" | "canceled"
          start_date: string | null
          end_date: string | null
          prd_document_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          status?: "draft" | "active" | "completed" | "canceled"
          start_date?: string | null
          end_date?: string | null
          prd_document_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          status?: "draft" | "active" | "completed" | "canceled"
          start_date?: string | null
          end_date?: string | null
          prd_document_url?: string | null
          created_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          project_id: string
          link: string | null
          scheduled_by_agent: boolean
          scheduled_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          link?: string | null
          scheduled_by_agent?: boolean
          scheduled_at: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          link?: string | null
          scheduled_by_agent?: boolean
          scheduled_at?: string
          created_at?: string
        }
      }
      quotations: {
        Row: {
          id: string
          project_id: string
          pdf_url: string | null
          amount: number | null
          currency: string
          status: "pending" | "sent" | "approved" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          pdf_url?: string | null
          amount?: number | null
          currency?: string
          status?: "pending" | "sent" | "approved" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          pdf_url?: string | null
          amount?: number | null
          currency?: string
          status?: "pending" | "sent" | "approved" | "rejected"
          created_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          project_id: string
          template_used: string | null
          pdf_url: string | null
          status: "draft" | "sent" | "signed" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          template_used?: string | null
          pdf_url?: string | null
          status?: "draft" | "sent" | "signed" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          template_used?: string | null
          pdf_url?: string | null
          status?: "draft" | "sent" | "signed" | "rejected"
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: "admin" | "sales" | "legal" | "tech"
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: "admin" | "sales" | "legal" | "tech"
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: "admin" | "sales" | "legal" | "tech"
          created_at?: string
        }
      }
      agent_settings: {
        Row: {
          id: string
          agent_type: string
          prompt_template: string
          model: string
          temperature: number
          max_tokens: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_type: string
          prompt_template: string
          model?: string
          temperature?: number
          max_tokens?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_type?: string
          prompt_template?: string
          model?: string
          temperature?: number
          max_tokens?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
