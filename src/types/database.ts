export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Priority = "hot" | "warm" | "cold";
export type OrgType = "company" | "government" | "ngo" | "military";
export type EventType = "conference" | "trade_mission" | "bilateral" | "dinner" | "other";
export type InteractionType = "met_in_person" | "call" | "email" | "other";
export type FollowUpStatus = "pending" | "done" | "snoozed";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: OrgType | null;
          country: string | null;
          website: string | null;
          sector: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: OrgType | null;
          country?: string | null;
          website?: string | null;
          sector?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: OrgType | null;
          country?: string | null;
          website?: string | null;
          sector?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          name: string;
          type: EventType | null;
          location: string | null;
          country: string | null;
          start_date: string | null;
          end_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: EventType | null;
          location?: string | null;
          country?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: EventType | null;
          location?: string | null;
          country?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          job_title: string | null;
          organization_id: string | null;
          country: string | null;
          linkedin_url: string | null;
          photo_url: string | null;
          priority: Priority;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          job_title?: string | null;
          organization_id?: string | null;
          country?: string | null;
          linkedin_url?: string | null;
          photo_url?: string | null;
          priority?: Priority;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          job_title?: string | null;
          organization_id?: string | null;
          country?: string | null;
          linkedin_url?: string | null;
          photo_url?: string | null;
          priority?: Priority;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      interactions: {
        Row: {
          id: string;
          contact_id: string;
          event_id: string | null;
          type: InteractionType;
          date: string;
          summary: string | null;
          outcome: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          event_id?: string | null;
          type: InteractionType;
          date: string;
          summary?: string | null;
          outcome?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          event_id?: string | null;
          type?: InteractionType;
          date?: string;
          summary?: string | null;
          outcome?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      follow_ups: {
        Row: {
          id: string;
          contact_id: string;
          interaction_id: string | null;
          due_date: string;
          description: string;
          status: FollowUpStatus;
          priority: Priority;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          interaction_id?: string | null;
          due_date: string;
          description: string;
          status?: FollowUpStatus;
          priority?: Priority;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          interaction_id?: string | null;
          due_date?: string;
          description?: string;
          status?: FollowUpStatus;
          priority?: Priority;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_events: {
        Row: {
          contact_id: string;
          event_id: string;
          role: string | null;
          notes: string | null;
        };
        Insert: {
          contact_id: string;
          event_id: string;
          role?: string | null;
          notes?: string | null;
        };
        Update: {
          contact_id?: string;
          event_id?: string;
          role?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
