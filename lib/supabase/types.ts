type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> };

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        id: string;
        email: string;
        full_name: string | null;
        is_admin: boolean;
        role_id: string | null;
        created_at: string;
      }>;
      admin_roles: Table<{
        id: string;
        name: "super_admin" | "administrator" | "content_manager" | "support_manager" | "analyst";
        permissions: Record<string, unknown>;
      }>;
      services: Table<{
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
      }>;
      portfolio: Table<{
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
      }>;
      feedback: Table<{
        id: string;
        user_id: string | null;
        user_name: string;
        rating: number;
        service: string | null;
        comment: string | null;
        approved: boolean;
        created_at: string;
      }>;
      service_requests: Table<{
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
      }>;
      track_sessions: Table<{
        id: string;
        token: string;
        service_request_id: string;
        expires_at: string;
        created_at: string;
      }>;
      referrals: Table<{
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
      }>;
      support_submissions: Table<{
        id: string;
        type: "equipment_donation" | "financial_support";
        donor_name: string | null;
        donor_email: string | null;
        donor_phone: string | null;
        details: string;
        status: string;
        created_at: string;
      }>;
      site_content: Table<{
        key: string;
        value: unknown;
        updated_at: string;
        updated_by: string | null;
      }>;
      faqs: Table<{
        id: string;
        question: string;
        answer: string;
        category: string | null;
        sort_order: number;
        active: boolean;
      }>;
      notifications: Table<{
        id: string;
        recipient_type: "admin" | "customer";
        recipient_id: string | null;
        service_request_id: string | null;
        type: "success" | "warning" | "error" | "info";
        title: string;
        message: string | null;
        read: boolean;
        created_at: string;
      }>;
      media_assets: Table<{
        id: string;
        storage_path: string;
        bucket: string;
        file_name: string;
        mime_type: string | null;
        alt_text: string | null;
        usage_context: string | null;
        created_at: string;
      }>;
      audit_log: Table<{
        id: string;
        actor_id: string | null;
        action: string;
        resource_type: string;
        resource_id: string | null;
        previous_state: unknown;
        new_state: unknown;
        created_at: string;
      }>;
      visitor_sessions: Table<{
        id: string;
        session_token: string;
        first_seen: string;
        last_seen: string;
        device_category: string | null;
        browser: string | null;
        os: string | null;
        country: string | null;
        referrer: string | null;
      }>;
      page_views: Table<{
        id: string;
        session_id: string;
        path: string;
        viewed_at: string;
      }>;
      analytics_events: Table<{
        id: string;
        session_id: string | null;
        event_type: string;
        metadata: Record<string, unknown>;
        created_at: string;
      }>;
    };
  };
};
