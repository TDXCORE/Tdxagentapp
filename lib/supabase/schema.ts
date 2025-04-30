export type ClientStatus = "new" | "qualified" | "discarded" | "converted"
export type InteractionChannel = "whatsapp" | "email" | "internal"
export type ProjectStatus = "draft" | "active" | "completed" | "canceled"
export type QuotationStatus = "pending" | "sent" | "approved" | "rejected"
export type ContractStatus = "draft" | "sent" | "signed" | "rejected"
export type UserRole = "admin" | "sales" | "legal" | "tech"

export interface Client {
  id: string
  name: string
  company_name: string | null
  email: string | null
  phone: string | null
  status: ClientStatus
  created_at: string
}

export interface Interaction {
  id: string
  client_id: string
  channel: InteractionChannel
  message: string
  agent_response: string | null
  intent_detected: string | null
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  title: string
  description: string | null
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  prd_document_url: string | null
  created_at: string
}

export interface Meeting {
  id: string
  project_id: string
  link: string | null
  scheduled_by_agent: boolean
  scheduled_at: string
  created_at: string
}

export interface Quotation {
  id: string
  project_id: string
  pdf_url: string | null
  amount: number | null
  currency: string
  status: QuotationStatus
  created_at: string
}

export interface Contract {
  id: string
  project_id: string
  template_used: string | null
  pdf_url: string | null
  status: ContractStatus
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface AgentSetting {
  id: string
  agent_type: string
  prompt_template: string
  model: string
  temperature: number
  max_tokens: number
  created_at: string
  updated_at: string
}
