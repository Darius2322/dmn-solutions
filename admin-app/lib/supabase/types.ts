export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_admin: boolean;
          role_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          is_admin?: boolean;
          role_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          is_admin?: boolean;
          role_id?: string | null;
          created_at?: string;
        };
      };
      admin_roles: {
        Row: {
          id: string;
          name: "super_admin" | "administrator" | "content_manager" | "support_manager" | "analyst";
          permissions: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          name: "super_admin" | "administrator" | "content_manager" | "support_manager" | "analyst";
          permissions?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          name?: "super_admin" | "administrator" | "content_manager" | "support_manager" | "analyst";
          permissions?: Record<string, unknown>;
        };
      };
      services: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: "digital_technology" | "electrical" | "computer_training" | "isp";
          icon: string;
          price_label: string | null;
          features: string[];
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          category: "digital_technology" | "electrical" | "computer_training" | "isp";
          icon?: string;
          price_label?: string | null;
          features?: string[];
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          category?: "digital_technology" | "electrical" | "computer_training" | "isp";
          icon?: string;
          price_label?: string | null;
          features?: string[];
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolio: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          technologies: string[];
          image_url: string | null;
          live_url: string | null;
          featured: boolean;
          completion_date: string | null;
          client_name: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          technologies?: string[];
          image_url?: string | null;
          live_url?: string | null;
          featured?: boolean;
          completion_date?: string | null;
          client_name?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          category?: string;
          technologies?: string[];
          image_url?: string | null;
          live_url?: string | null;
          featured?: boolean;
          completion_date?: string | null;
          client_name?: string | null;
          tags?: string[];
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          user_name: string;
          rating: number;
          service: string | null;
          comment: string | null;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_name: string;
          rating: number;
          service?: string | null;
          comment?: string | null;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_name?: string;
          rating?: number;
          service?: string | null;
          comment?: string | null;
          approved?: boolean;
          created_at?: string;
        };
      };
      service_requests: {
        Row: {
          id: string;
          tracking_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          service_id: string | null;
          location: string | null;
          description: string | null;
          budget_range: string | null;
          preferred_contact: string | null;
          status: string;
          payment_status: string;
          assigned_to: string | null;
          internal_notes: string | null;
          customer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tracking_number?: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          service_id?: string | null;
          location?: string | null;
          description?: string | null;
          budget_range?: string | null;
          preferred_contact?: string | null;
          status?: string;
          payment_status?: string;
          assigned_to?: string | null;
          internal_notes?: string | null;
          customer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tracking_number?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          service_id?: string | null;
          location?: string | null;
          description?: string | null;
          budget_range?: string | null;
          preferred_contact?: string | null;
          status?: string;
          payment_status?: string;
          assigned_to?: string | null;
          internal_notes?: string | null;
          customer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      track_sessions: {
        Row: {
          id: string;
          token: string;
          service_request_id: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          service_request_id: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          service_request_id?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          reference_number: string;
          referrer_name: string;
          referrer_email: string;
          referrer_phone: string | null;
          referred_name: string;
          referred_contact: string;
          service_interested: string | null;
          notes: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reference_number?: string;
          referrer_name: string;
          referrer_email: string;
          referrer_phone?: string | null;
          referred_name: string;
          referred_contact: string;
          service_interested?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          reference_number?: string;
          referrer_name?: string;
          referrer_email?: string;
          referrer_phone?: string | null;
          referred_name?: string;
          referred_contact?: string;
          service_interested?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      support_submissions: {
        Row: {
          id: string;
          type: "equipment_donation" | "financial_support";
          donor_name: string | null;
          donor_email: string | null;
          donor_phone: string | null;
          details: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: "equipment_donation" | "financial_support";
          donor_name?: string | null;
          donor_email?: string | null;
          donor_phone?: string | null;
          details: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: "equipment_donation" | "financial_support";
          donor_name?: string | null;
          donor_email?: string | null;
          donor_phone?: string | null;
          details?: string;
          status?: string;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
        };
      };
      site_content: {
        Row: {
          key: string;
          value: unknown;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value: unknown;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          key?: string;
          value?: unknown;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: string | null;
          sort_order: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          category?: string | null;
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          category?: string | null;
          sort_order?: number;
          active?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_type: "admin" | "customer";
          recipient_id: string | null;
          service_request_id: string | null;
          type: "success" | "warning" | "error" | "info";
          title: string;
          message: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_type: "admin" | "customer";
          recipient_id?: string | null;
          service_request_id?: string | null;
          type: "success" | "warning" | "error" | "info";
          title: string;
          message?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_type?: "admin" | "customer";
          recipient_id?: string | null;
          service_request_id?: string | null;
          type?: "success" | "warning" | "error" | "info";
          title?: string;
          message?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      media_assets: {
        Row: {
          id: string;
          storage_path: string;
          bucket: string;
          file_name: string;
          mime_type: string | null;
          alt_text: string | null;
          usage_context: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          bucket: string;
          file_name: string;
          mime_type?: string | null;
          alt_text?: string | null;
          usage_context?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          storage_path?: string;
          bucket?: string;
          file_name?: string;
          mime_type?: string | null;
          alt_text?: string | null;
          usage_context?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          previous_state: unknown;
          new_state: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          previous_state?: unknown;
          new_state?: unknown;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          previous_state?: unknown;
          new_state?: unknown;
          created_at?: string;
        };
      };
      visitor_sessions: {
        Row: {
          id: string;
          session_token: string;
          first_seen: string;
          last_seen: string;
          device_category: string | null;
          browser: string | null;
          os: string | null;
          country: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          session_token: string;
          first_seen?: string;
          last_seen?: string;
          device_category?: string | null;
          browser?: string | null;
          os?: string | null;
          country?: string | null;
          referrer?: string | null;
        };
        Update: {
          id?: string;
          session_token?: string;
          first_seen?: string;
          last_seen?: string;
          device_category?: string | null;
          browser?: string | null;
          os?: string | null;
          country?: string | null;
          referrer?: string | null;
        };
      };
      page_views: {
        Row: {
          id: string;
          session_id: string;
          path: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          path: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          path?: string;
          viewed_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          session_id: string | null;
          event_type: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          event_type: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          event_type?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
