export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      temperature_readings: {
        Row: {
          id: string
          temperature: number
          unit: 'celsius' | 'fahrenheit'
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          temperature: number
          unit?: 'celsius' | 'fahrenheit'
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          temperature?: number
          unit?: 'celsius' | 'fahrenheit'
          timestamp?: string
          created_at?: string
        }
      }
      aircon_state: {
        Row: {
          id: string
          is_on: boolean
          last_updated: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          is_on?: boolean
          last_updated?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          is_on?: boolean
          last_updated?: string
          updated_by?: string | null
        }
      }
      ir_protocols: {
        Row: {
          id: string
          name: string
          summary: string
          protocol_type: string
          frequency_khz: number | null
          is_selected: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          summary: string
          protocol_type: string
          frequency_khz?: number | null
          is_selected?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          summary?: string
          protocol_type?: string
          frequency_khz?: number | null
          is_selected?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}
