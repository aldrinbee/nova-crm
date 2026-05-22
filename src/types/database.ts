export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Priority = "hot" | "warm" | "cold";
export type OrgType = "company" | "government" | "ngo" | "military";
export type EventType = "conference" | "trade_mission" | "bilateral" | "dinner" | "other";
export type InteractionType = "met_in_person" | "call" | "email" | "other";
export type FollowUpStatus = "pending" | "done" | "snoozed";

export interface Database {
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
        Insert: Omit<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
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
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
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
        Insert: Omit<Database["public"]["Tables"]["contacts"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
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
        Insert: Omit<Database["public"]["Tables"]["interactions"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["interactions"]["Insert"]>;
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
        Insert: Omit<Database["public"]["Tables"]["follow_ups"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["follow_ups"]["Insert"]>;
      };
      contact_events: {
        Row: {
          contact_id: string;
          event_id: string;
          role: string | null;
          notes: string | null;
        };
        Insert: Database["public"]["Tables"]["contact_events"]["Row"];
        Update: Partial<Database["public"]["Tables"]["contact_events"]["Insert"]>;
      };
    };
  };
}
