// Types for the Supabase database (public schema).
// Mirrors supabase/migrations/*.sql.
// After connecting a project you can regenerate this file with:
//   npx supabase gen types typescript --project-id <ref> --schema public > lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string };

export type Database = {
  public: {
    Tables: {
      settings: {
        Row: { key: string; value: string | null };
        Insert: { key: string; value?: string | null };
        Update: { key?: string; value?: string | null };
        Relationships: [];
      };
      slides: {
        Row: { id: number; image: string; title: string | null; link: string | null; sort: number; active: boolean } & Timestamps;
        Insert: { id?: never; image: string; title?: string | null; link?: string | null; sort?: number; active?: boolean; created_at?: string };
        Update: { image?: string; title?: string | null; link?: string | null; sort?: number; active?: boolean; created_at?: string };
        Relationships: [];
      };
      news: {
        Row: {
          id: number; slug: string; title_en: string; title_kn: string | null; category: string; published_at: string;
          excerpt_en: string | null; excerpt_kn: string | null; body_en: string | null; body_kn: string | null;
          image: string | null; images: string[]; featured: boolean;
        } & Timestamps;
        Insert: {
          id?: never; slug: string; title_en: string; title_kn?: string | null; category?: string; published_at?: string;
          excerpt_en?: string | null; excerpt_kn?: string | null; body_en?: string | null; body_kn?: string | null;
          image?: string | null; images?: string[]; featured?: boolean; created_at?: string;
        };
        Update: {
          slug?: string; title_en?: string; title_kn?: string | null; category?: string; published_at?: string;
          excerpt_en?: string | null; excerpt_kn?: string | null; body_en?: string | null; body_kn?: string | null;
          image?: string | null; images?: string[]; featured?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: number; slug: string; title_en: string; title_kn: string | null; summary_en: string | null; summary_kn: string | null;
          body_en: string | null; body_kn: string | null; image: string | null; images: string[];
          start_date: string; end_date: string | null; time: string | null; venue_en: string | null; venue_kn: string | null;
        } & Timestamps;
        Insert: {
          id?: never; slug: string; title_en: string; title_kn?: string | null; summary_en?: string | null; summary_kn?: string | null;
          body_en?: string | null; body_kn?: string | null; image?: string | null; images?: string[];
          start_date: string; end_date?: string | null; time?: string | null; venue_en?: string | null; venue_kn?: string | null; created_at?: string;
        };
        Update: {
          slug?: string; title_en?: string; title_kn?: string | null; summary_en?: string | null; summary_kn?: string | null;
          body_en?: string | null; body_kn?: string | null; image?: string | null; images?: string[];
          start_date?: string; end_date?: string | null; time?: string | null; venue_en?: string | null; venue_kn?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      gallery: {
        Row: {
          id: number; image: string | null; images: string[]; video: string | null; title_en: string | null; title_kn: string | null;
          album: string; sort: number;
        } & Timestamps;
        Insert: {
          id?: never; image?: string | null; images?: string[]; video?: string | null; title_en?: string | null; title_kn?: string | null;
          album?: string; sort?: number; created_at?: string;
        };
        Update: {
          image?: string | null; images?: string[]; video?: string | null; title_en?: string | null; title_kn?: string | null;
          album?: string; sort?: number; created_at?: string;
        };
        Relationships: [];
      };
      leaders: {
        Row: {
          id: number; name_en: string; name_kn: string | null; role_en: string; role_kn: string | null; tier: string; district: string | null;
          photo: string | null; bio_en: string | null; bio_kn: string | null; quote_en: string | null; quote_kn: string | null; sort: number;
        } & Timestamps;
        Insert: {
          id?: never; name_en: string; name_kn?: string | null; role_en: string; role_kn?: string | null; tier?: string; district?: string | null;
          photo?: string | null; bio_en?: string | null; bio_kn?: string | null; quote_en?: string | null; quote_kn?: string | null; sort?: number;
          created_at?: string;
        };
        Update: {
          name_en?: string; name_kn?: string | null; role_en?: string; role_kn?: string | null; tier?: string; district?: string | null;
          photo?: string | null; bio_en?: string | null; bio_kn?: string | null; quote_en?: string | null; quote_kn?: string | null; sort?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      partners: {
        Row: { id: number; name: string; logo: string | null; url: string | null; sort: number } & Timestamps;
        Insert: { id?: never; name: string; logo?: string | null; url?: string | null; sort?: number; created_at?: string };
        Update: { name?: string; logo?: string | null; url?: string | null; sort?: number; created_at?: string };
        Relationships: [];
      };
      instagram: {
        Row: { id: number; image: string; caption: string | null; url: string | null; likes: number; sort: number } & Timestamps;
        Insert: { id?: never; image: string; caption?: string | null; url?: string | null; likes?: number; sort?: number; created_at?: string };
        Update: { image?: string; caption?: string | null; url?: string | null; likes?: number; sort?: number; created_at?: string };
        Relationships: [];
      };
      wards: {
        Row: { id: number; name: string; sort: number } & Timestamps;
        Insert: { id?: never; name: string; sort?: number; created_at?: string };
        Update: { name?: string; sort?: number; created_at?: string };
        Relationships: [];
      };
      admins: {
        Row: { user_id: string; name: string; email: string } & Timestamps;
        Insert: { user_id: string; name?: string; email: string; created_at?: string };
        Update: { user_id?: string; name?: string; email?: string; created_at?: string };
        Relationships: [];
      };
      members: {
        Row: {
          id: number; member_no: string | null; user_id: string | null; auth_email: string | null; name: string; email: string | null;
          phone: string; ward: string | null; pincode: string | null; photo: string | null; status: string; amount: number;
          order_id: string | null; payment_id: string | null; payment_mode: string | null;
        } & Timestamps;
        Insert: {
          id?: never; member_no?: string | null; user_id?: string | null; auth_email?: string | null; name: string; email?: string | null;
          phone: string; ward?: string | null; pincode?: string | null; photo?: string | null; status?: string; amount?: number;
          order_id?: string | null; payment_id?: string | null; payment_mode?: string | null; created_at?: string;
        };
        Update: {
          member_no?: string | null; user_id?: string | null; auth_email?: string | null; name?: string; email?: string | null;
          phone?: string; ward?: string | null; pincode?: string | null; photo?: string | null; status?: string; amount?: number;
          order_id?: string | null; payment_id?: string | null; payment_mode?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      pending_orders: {
        Row: { order_id: string; kind: string; payload: Json; amount: number; status: string; result_id: number | null } & Timestamps;
        Insert: { order_id: string; kind: string; payload: Json; amount: number; status?: string; result_id?: number | null; created_at?: string };
        Update: { order_id?: string; kind?: string; payload?: Json; amount?: number; status?: string; result_id?: number | null; created_at?: string };
        Relationships: [];
      };
      donations: {
        Row: {
          id: number; receipt_no: string | null; name: string; email: string | null; phone: string | null; pan: string | null; amount: number;
          campaign_id: number | null; message: string | null; anonymous: boolean; order_id: string | null; payment_id: string | null;
          payment_mode: string | null;
        } & Timestamps;
        Insert: {
          id?: never; receipt_no?: string | null; name: string; email?: string | null; phone?: string | null; pan?: string | null; amount: number;
          campaign_id?: number | null; message?: string | null; anonymous?: boolean; order_id?: string | null; payment_id?: string | null;
          payment_mode?: string | null; created_at?: string;
        };
        Update: {
          receipt_no?: string | null; name?: string; email?: string | null; phone?: string | null; pan?: string | null; amount?: number;
          campaign_id?: number | null; message?: string | null; anonymous?: boolean; order_id?: string | null; payment_id?: string | null;
          payment_mode?: string | null; created_at?: string;
        };
        Relationships: [
          { foreignKeyName: 'donations_campaign_id_fkey'; columns: ['campaign_id']; isOneToOne: false; referencedRelation: 'campaigns'; referencedColumns: ['id'] },
        ];
      };
      messages: {
        Row: { id: number; name: string; email: string | null; phone: string | null; subject: string | null; message: string; is_read: boolean } & Timestamps;
        Insert: { id?: never; name: string; email?: string | null; phone?: string | null; subject?: string | null; message: string; is_read?: boolean; created_at?: string };
        Update: { name?: string; email?: string | null; phone?: string | null; subject?: string | null; message?: string; is_read?: boolean; created_at?: string };
        Relationships: [];
      };
      event_registrations: {
        Row: { id: number; campaign_id: number; member_id: number | null; volunteer_id: number | null } & Timestamps;
        Insert: { id?: never; campaign_id: number; member_id?: number | null; volunteer_id?: number | null; created_at?: string };
        Update: { campaign_id?: number; member_id?: number | null; volunteer_id?: number | null; created_at?: string };
        Relationships: [
          { foreignKeyName: 'event_registrations_campaign_id_fkey'; columns: ['campaign_id']; isOneToOne: false; referencedRelation: 'campaigns'; referencedColumns: ['id'] },
          { foreignKeyName: 'event_registrations_member_id_fkey'; columns: ['member_id']; isOneToOne: false; referencedRelation: 'members'; referencedColumns: ['id'] },
          { foreignKeyName: 'event_registrations_volunteer_id_fkey'; columns: ['volunteer_id']; isOneToOne: false; referencedRelation: 'volunteers'; referencedColumns: ['id'] },
        ];
      };
      volunteers: {
        Row: {
          id: number; volunteer_no: string | null; user_id: string | null; auth_email: string | null;
          name: string; email: string | null; phone: string; ward: string | null; pincode: string | null;
          proof_type: string; proof_path: string; verified: boolean; status: string;
        } & Timestamps;
        Insert: {
          id?: never; volunteer_no?: string | null; user_id?: string | null; auth_email?: string | null;
          name: string; email?: string | null; phone: string; ward?: string | null; pincode?: string | null;
          proof_type: string; proof_path: string; verified?: boolean; status?: string; created_at?: string;
        };
        Update: {
          volunteer_no?: string | null; user_id?: string | null; auth_email?: string | null;
          name?: string; email?: string | null; phone?: string; ward?: string | null; pincode?: string | null;
          proof_type?: string; proof_path?: string; verified?: boolean; status?: string; created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      verify_member: {
        Args: { p_member_no: string };
        Returns: { member_no: string; name: string; ward: string | null; photo: string | null; status: string; created_at: string }[];
      };
      admin_stats: { Args: Record<PropertyKey, never>; Returns: Json };
      event_registration_count: { Args: { p_campaign_id: number }; Returns: number };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database['public'];
export type TableName = keyof PublicSchema['Tables'];
export type Tables<T extends TableName> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends TableName> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends TableName> = PublicSchema['Tables'][T]['Update'];
