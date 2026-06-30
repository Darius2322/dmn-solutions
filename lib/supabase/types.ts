// lib/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type CommentType = 'feedback' | 'complaint' | 'comment' | 'suggestion';
export type UserRole    = 'member' | 'admin' | 'moderator';
export type RequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; user_id: string; email: string | null;
          full_name: string | null; avatar_url: string | null;
          role: UserRole; is_active: boolean;
          last_seen_at: string | null; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      services: {
        Row: {
          id: string; title: string; description: string | null;
          icon: string | null; price_label: string | null;
          features: Json; category: string;
          is_active: boolean; sort_order: number; created_at: string; updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      portfolio: {
        Row: {
          id: string; title: string; description: string | null;
          url: string | null; image: string | null; tags: string | null;
          category: string; featured: boolean; hidden: boolean; sort_order: number; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['portfolio']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['portfolio']['Insert']>;
      };
      feedback: {
        Row: {
          id: string; user_id: string | null; user_email: string | null;
          user_name: string | null; rating: number; service: string | null;
          comment: string | null; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['feedback']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['feedback']['Insert']>;
      };
      comments: {
        Row: {
          id: string; user_id: string | null; user_email: string | null;
          user_name: string | null; type: CommentType;
          message: string; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      requests: {
        Row: {
          id: string; user_id: string | null; user_email: string | null;
          user_name: string | null; title: string; description: string | null;
          service: string | null; status: RequestStatus;
          admin_reply: string | null; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['requests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
      };
      badges: {
        Row: {
          id: string; user_email: string; badge_key: string;
          badge_label: string; badge_icon: string;
          awarded_by: string | null; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['badges']['Insert']>;
      };
      notifications: {
        Row: {
          id: string; user_id: string; title: string; message: string | null;
          type: string; icon: string | null; is_read: boolean;
          action_url: string | null; created_at: string; expires_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      activity_log: {
        Row: {
          id: string; user_id: string | null; user_email: string | null;
          action_type: string; resource_id: string | null;
          resource_name: string | null; metadata: Json; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_log']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin_user: { Args: Record<string, never>; Returns: boolean };
    };
  };
}

// Convenience type aliases
export type Profile      = Database['public']['Tables']['profiles']['Row'];
export type Service      = Database['public']['Tables']['services']['Row'];
export type Portfolio    = Database['public']['Tables']['portfolio']['Row'];
export type Feedback     = Database['public']['Tables']['feedback']['Row'];
export type Comment      = Database['public']['Tables']['comments']['Row'];
export type Request      = Database['public']['Tables']['requests']['Row'];
export type Badge        = Database['public']['Tables']['badges']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type ActivityLog  = Database['public']['Tables']['activity_log']['Row'];
