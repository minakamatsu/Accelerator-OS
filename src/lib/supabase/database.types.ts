export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analytics_connections: {
        Row: {
          allowed_hostname: string | null
          business_id: string
          created_at: string
          id: string
          last_event_at: string | null
          site_key: string
          status: Database['public']['Enums']['connection_status']
          updated_at: string
        }
        Insert: {
          allowed_hostname?: string | null
          business_id: string
          created_at?: string
          id?: string
          last_event_at?: string | null
          site_key?: string
          status?: Database['public']['Enums']['connection_status']
          updated_at?: string
        }
        Update: {
          allowed_hostname?: string | null
          business_id?: string
          created_at?: string
          id?: string
          last_event_at?: string | null
          site_key?: string
          status?: Database['public']['Enums']['connection_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'analytics_connections_business_id_fkey'
            columns: ['business_id']
            isOneToOne: true
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_type: Database['public']['Enums']['actor_type']
          actor_user_id: string | null
          business_id: string | null
          created_at: string
          id: string
          request_id: string | null
          resource_id: string | null
          resource_type: string
          safe_after: Json | null
          safe_before: Json | null
        }
        Insert: {
          action: string
          actor_type: Database['public']['Enums']['actor_type']
          actor_user_id?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
          safe_after?: Json | null
          safe_before?: Json | null
        }
        Update: {
          action?: string
          actor_type?: Database['public']['Enums']['actor_type']
          actor_user_id?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          safe_after?: Json | null
          safe_before?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_log_actor_user_id_fkey'
            columns: ['actor_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_log_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      automation_rules: {
        Row: {
          business_id: string
          created_at: string
          delay_seconds: number
          eligibility: Json
          enabled: boolean
          id: string
          kind: string
          template_version: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          delay_seconds?: number
          eligibility?: Json
          enabled?: boolean
          id?: string
          kind: string
          template_version: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          delay_seconds?: number
          eligibility?: Json
          enabled?: boolean
          id?: string
          kind?: string
          template_version?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'automation_rules_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      brand_settings: {
        Row: {
          business_id: string
          color_direction: Json
          created_at: string
          design_notes: string | null
          image_permission_notes: string | null
          logo_asset_id: string | null
          logo_treatment: string | null
          motion_preferences: Json
          shape_preferences: Json
          signature_feature: string | null
          typography_direction: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          color_direction?: Json
          created_at?: string
          design_notes?: string | null
          image_permission_notes?: string | null
          logo_asset_id?: string | null
          logo_treatment?: string | null
          motion_preferences?: Json
          shape_preferences?: Json
          signature_feature?: string | null
          typography_direction?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          color_direction?: Json
          created_at?: string
          design_notes?: string | null
          image_permission_notes?: string | null
          logo_asset_id?: string | null
          logo_treatment?: string | null
          motion_preferences?: Json
          shape_preferences?: Json
          signature_feature?: string | null
          typography_direction?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'brand_settings_business_id_fkey'
            columns: ['business_id']
            isOneToOne: true
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'brand_settings_logo_asset_fkey'
            columns: ['business_id', 'logo_asset_id']
            isOneToOne: false
            referencedRelation: 'business_assets'
            referencedColumns: ['business_id', 'id']
          },
        ]
      }
      business_assets: {
        Row: {
          alt_text: string | null
          business_id: string
          created_at: string
          id: string
          kind: Database['public']['Enums']['asset_kind']
          permission_notes: string | null
          source: string | null
          storage_path: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          business_id: string
          created_at?: string
          id?: string
          kind: Database['public']['Enums']['asset_kind']
          permission_notes?: string | null
          source?: string | null
          storage_path: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          business_id?: string
          created_at?: string
          id?: string
          kind?: Database['public']['Enums']['asset_kind']
          permission_notes?: string | null
          source?: string | null
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'business_assets_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      business_domains: {
        Row: {
          business_id: string
          created_at: string
          hostname: string
          id: string
          is_primary: boolean
          status: Database['public']['Enums']['domain_status']
          updated_at: string
          verification_token_hash: string | null
          verified_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          hostname: string
          id?: string
          is_primary?: boolean
          status?: Database['public']['Enums']['domain_status']
          updated_at?: string
          verification_token_hash?: string | null
          verified_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          hostname?: string
          id?: string
          is_primary?: boolean
          status?: Database['public']['Enums']['domain_status']
          updated_at?: string
          verification_token_hash?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'business_domains_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      business_memberships: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database['public']['Enums']['business_member_role']
          status: Database['public']['Enums']['membership_status']
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role: Database['public']['Enums']['business_member_role']
          status?: Database['public']['Enums']['membership_status']
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database['public']['Enums']['business_member_role']
          status?: Database['public']['Enums']['membership_status']
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'business_memberships_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'business_memberships_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      business_profiles: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          approved_offer: string | null
          business_id: string
          city: string | null
          contact_preference: string | null
          country_code: string
          created_at: string
          facts_source_notes: string | null
          hours: Json
          locale: string
          map_url: string | null
          postal_code: string | null
          primary_cta: string | null
          public_email: string | null
          public_phone: string | null
          region: string | null
          review_url: string | null
          service_area: string | null
          tone: string | null
          updated_at: string
          value_proposition: string | null
          website_url: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          approved_offer?: string | null
          business_id: string
          city?: string | null
          contact_preference?: string | null
          country_code?: string
          created_at?: string
          facts_source_notes?: string | null
          hours?: Json
          locale?: string
          map_url?: string | null
          postal_code?: string | null
          primary_cta?: string | null
          public_email?: string | null
          public_phone?: string | null
          region?: string | null
          review_url?: string | null
          service_area?: string | null
          tone?: string | null
          updated_at?: string
          value_proposition?: string | null
          website_url?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          approved_offer?: string | null
          business_id?: string
          city?: string | null
          contact_preference?: string | null
          country_code?: string
          created_at?: string
          facts_source_notes?: string | null
          hours?: Json
          locale?: string
          map_url?: string | null
          postal_code?: string | null
          primary_cta?: string | null
          public_email?: string | null
          public_phone?: string | null
          region?: string | null
          review_url?: string | null
          service_area?: string | null
          tone?: string | null
          updated_at?: string
          value_proposition?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'business_profiles_business_id_fkey'
            columns: ['business_id']
            isOneToOne: true
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      businesses: {
        Row: {
          category: string
          client_contact_email: string | null
          client_contact_name: string | null
          client_contact_phone: string | null
          created_at: string
          created_by: string
          currency: string
          design_approved_at: string | null
          facts_approved_at: string | null
          id: string
          name: string
          onboarding_state: Json
          slug: string
          status: Database['public']['Enums']['business_status']
          timezone: string
          updated_at: string
        }
        Insert: {
          category?: string
          client_contact_email?: string | null
          client_contact_name?: string | null
          client_contact_phone?: string | null
          created_at?: string
          created_by: string
          currency?: string
          design_approved_at?: string | null
          facts_approved_at?: string | null
          id?: string
          name: string
          onboarding_state?: Json
          slug: string
          status?: Database['public']['Enums']['business_status']
          timezone?: string
          updated_at?: string
        }
        Update: {
          category?: string
          client_contact_email?: string | null
          client_contact_name?: string | null
          client_contact_phone?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          design_approved_at?: string | null
          facts_approved_at?: string | null
          id?: string
          name?: string
          onboarding_state?: Json
          slug?: string
          status?: Database['public']['Enums']['business_status']
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'businesses_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      integration_connections: {
        Row: {
          business_id: string
          capabilities: Json
          created_at: string
          external_account_reference: string | null
          id: string
          provider: string
          status: Database['public']['Enums']['connection_status']
          updated_at: string
        }
        Insert: {
          business_id: string
          capabilities?: Json
          created_at?: string
          external_account_reference?: string | null
          id?: string
          provider: string
          status?: Database['public']['Enums']['connection_status']
          updated_at?: string
        }
        Update: {
          business_id?: string
          capabilities?: Json
          created_at?: string
          external_account_reference?: string | null
          id?: string
          provider?: string
          status?: Database['public']['Enums']['connection_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'integration_connections_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      lead_events: {
        Row: {
          actor_type: Database['public']['Enums']['actor_type']
          actor_user_id: string | null
          business_id: string
          created_at: string
          event_type: string
          id: string
          lead_id: string
          metadata: Json
        }
        Insert: {
          actor_type: Database['public']['Enums']['actor_type']
          actor_user_id?: string | null
          business_id: string
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          metadata?: Json
        }
        Update: {
          actor_type?: Database['public']['Enums']['actor_type']
          actor_user_id?: string | null
          business_id?: string
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'lead_events_actor_user_id_fkey'
            columns: ['actor_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lead_events_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lead_events_business_lead_fkey'
            columns: ['business_id', 'lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['business_id', 'id']
          },
        ]
      }
      lead_notes: {
        Row: {
          author_user_id: string
          body: string
          business_id: string
          created_at: string
          id: string
          lead_id: string
          updated_at: string
        }
        Insert: {
          author_user_id: string
          body: string
          business_id: string
          created_at?: string
          id?: string
          lead_id: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          body?: string
          business_id?: string
          created_at?: string
          id?: string
          lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lead_notes_author_user_id_fkey'
            columns: ['author_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lead_notes_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lead_notes_business_lead_fkey'
            columns: ['business_id', 'lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['business_id', 'id']
          },
        ]
      }
      leads: {
        Row: {
          assigned_user_id: string | null
          business_id: string
          consent_text: string
          consent_version: string
          consented_at: string
          contacted_at: string | null
          created_at: string
          currency: string
          email: string | null
          estimated_value_minor: number | null
          full_name: string
          id: string
          loss_reason: string | null
          lost_at: string | null
          message: string | null
          phone: string | null
          request_fingerprint_hash: string | null
          service_id: string | null
          service_request: string | null
          source: string | null
          status: Database['public']['Enums']['lead_status']
          submission_idempotency_key: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_year: number | null
          won_at: string | null
          won_value_minor: number | null
        }
        Insert: {
          assigned_user_id?: string | null
          business_id: string
          consent_text: string
          consent_version: string
          consented_at: string
          contacted_at?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          estimated_value_minor?: number | null
          full_name: string
          id?: string
          loss_reason?: string | null
          lost_at?: string | null
          message?: string | null
          phone?: string | null
          request_fingerprint_hash?: string | null
          service_id?: string | null
          service_request?: string | null
          source?: string | null
          status?: Database['public']['Enums']['lead_status']
          submission_idempotency_key?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: number | null
          won_at?: string | null
          won_value_minor?: number | null
        }
        Update: {
          assigned_user_id?: string | null
          business_id?: string
          consent_text?: string
          consent_version?: string
          consented_at?: string
          contacted_at?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          estimated_value_minor?: number | null
          full_name?: string
          id?: string
          loss_reason?: string | null
          lost_at?: string | null
          message?: string | null
          phone?: string | null
          request_fingerprint_hash?: string | null
          service_id?: string | null
          service_request?: string | null
          source?: string | null
          status?: Database['public']['Enums']['lead_status']
          submission_idempotency_key?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: number | null
          won_at?: string | null
          won_value_minor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'leads_assigned_user_id_fkey'
            columns: ['assigned_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_business_service_fkey'
            columns: ['business_id', 'service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['business_id', 'id']
          },
        ]
      }
      message_deliveries: {
        Row: {
          business_id: string
          created_at: string
          id: string
          lead_id: string | null
          outbox_job_id: string
          provider: string
          provider_message_id: string | null
          recipient_display: string
          status: Database['public']['Enums']['delivery_status']
          template_key: string
          template_version: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          lead_id?: string | null
          outbox_job_id: string
          provider: string
          provider_message_id?: string | null
          recipient_display: string
          status: Database['public']['Enums']['delivery_status']
          template_key: string
          template_version: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          outbox_job_id?: string
          provider?: string
          provider_message_id?: string | null
          recipient_display?: string
          status?: Database['public']['Enums']['delivery_status']
          template_key?: string
          template_version?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'message_deliveries_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'message_deliveries_business_job_fkey'
            columns: ['business_id', 'outbox_job_id']
            isOneToOne: false
            referencedRelation: 'outbox_jobs'
            referencedColumns: ['business_id', 'id']
          },
          {
            foreignKeyName: 'message_deliveries_business_lead_fkey'
            columns: ['business_id', 'lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['business_id', 'id']
          },
        ]
      }
      notification_recipients: {
        Row: {
          business_id: string
          created_at: string
          enabled_event_kinds: string[]
          id: string
          recipient_address: string
          recipient_type: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          enabled_event_kinds?: string[]
          id?: string
          recipient_address: string
          recipient_type?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          enabled_event_kinds?: string[]
          id?: string
          recipient_address?: string
          recipient_type?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notification_recipients_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      outbox_jobs: {
        Row: {
          attempt_count: number
          business_id: string
          created_at: string
          id: string
          idempotency_key: string
          kind: string
          last_error_code: string | null
          lead_id: string | null
          lease_token: string | null
          lease_until: string | null
          payload: Json
          run_after: string
          status: Database['public']['Enums']['job_status']
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          business_id: string
          created_at?: string
          id?: string
          idempotency_key: string
          kind: string
          last_error_code?: string | null
          lead_id?: string | null
          lease_token?: string | null
          lease_until?: string | null
          payload?: Json
          run_after?: string
          status?: Database['public']['Enums']['job_status']
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          business_id?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          kind?: string
          last_error_code?: string | null
          lead_id?: string | null
          lease_token?: string | null
          lease_until?: string | null
          payload?: Json
          run_after?: string
          status?: Database['public']['Enums']['job_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'outbox_jobs_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'outbox_jobs_business_lead_fkey'
            columns: ['business_id', 'lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['business_id', 'id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          display_name: string
          id: string
          platform_role: Database['public']['Enums']['platform_role']
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id: string
          platform_role?: Database['public']['Enums']['platform_role']
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id?: string
          platform_role?: Database['public']['Enums']['platform_role']
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          business_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'services_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      site_events: {
        Row: {
          anonymous_session_hash: string | null
          business_id: string
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          path: string
          referrer_host: string | null
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          anonymous_session_hash?: string | null
          business_id: string
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          path: string
          referrer_host?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          anonymous_session_hash?: string | null
          business_id?: string
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          path?: string
          referrer_host?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'site_events_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      subscriptions: {
        Row: {
          business_id: string
          created_at: string
          current_period_end: string | null
          external_customer_id: string | null
          external_subscription_id: string | null
          id: string
          last_webhook_at: string | null
          plan_code: string
          provider: string
          status: Database['public']['Enums']['subscription_status']
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          current_period_end?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          last_webhook_at?: string | null
          plan_code: string
          provider: string
          status?: Database['public']['Enums']['subscription_status']
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          current_period_end?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          last_webhook_at?: string | null
          plan_code?: string
          provider?: string
          status?: Database['public']['Enums']['subscription_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      webhook_events: {
        Row: {
          external_event_id: string
          id: string
          processed_at: string | null
          provider: string
          received_at: string
          sanitized_error: string | null
          signature_verified: boolean
          status: Database['public']['Enums']['webhook_status']
        }
        Insert: {
          external_event_id: string
          id?: string
          processed_at?: string | null
          provider: string
          received_at?: string
          sanitized_error?: string | null
          signature_verified?: boolean
          status?: Database['public']['Enums']['webhook_status']
        }
        Update: {
          external_event_id?: string
          id?: string
          processed_at?: string | null
          provider?: string
          received_at?: string
          sanitized_error?: string | null
          signature_verified?: boolean
          status?: Database['public']['Enums']['webhook_status']
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_lead_note: {
        Args: {
          requested_body: string
          requested_business_id: string
          requested_lead_id: string
        }
        Returns: string
      }
      cancel_business_notification_job: {
        Args: {
          requested_job_id: string
          requested_lease_token: string
          requested_reason: string
        }
        Returns: boolean
      }
      capture_public_lead: {
        Args: {
          requested_consent_text: string
          requested_consent_version: string
          requested_email: string
          requested_fingerprint_hash: string
          requested_full_name: string
          requested_idempotency_key: string
          requested_message: string
          requested_phone: string
          requested_service_request: string
          requested_service_slug: string
          requested_slug: string
          requested_source: string
          requested_utm_campaign: string
          requested_utm_medium: string
          requested_utm_source: string
          requested_vehicle_make: string
          requested_vehicle_model: string
          requested_vehicle_year: number
        }
        Returns: Json
      }
      claim_business_notification_jobs: {
        Args: {
          requested_job_id?: string
          requested_lead_id?: string
          requested_limit?: number
        }
        Returns: {
          attempt_count: number
          business_id: string
          id: string
          idempotency_key: string
          lead_id: string
          lease_token: string
          payload: Json
        }[]
      }
      complete_business_notification_job: {
        Args: {
          requested_delivery_status: Database['public']['Enums']['delivery_status']
          requested_job_id: string
          requested_lease_token: string
          requested_provider: string
          requested_provider_message_id: string
          requested_recipient_display: string
          requested_template_key: string
          requested_template_version: string
        }
        Returns: boolean
      }
      create_agency_business: {
        Args: {
          address_line_1?: string
          business_name: string
          business_slug: string
          business_timezone: string
          city?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          postal_code?: string
          region?: string
          website_hostname?: string
          website_url?: string
        }
        Returns: string
      }
      create_business_draft: {
        Args: {
          business_name: string
          business_slug: string
          business_timezone?: string
        }
        Returns: string
      }
      fail_business_notification_job: {
        Args: {
          requested_error_code: string
          requested_job_id: string
          requested_lease_token: string
        }
        Returns: string
      }
      get_public_site: { Args: { requested_slug: string }; Returns: Json }
      record_external_site_event: {
        Args: {
          requested_anonymous_session_hash?: string
          requested_device_type?: string
          requested_event_type: string
          requested_origin_hostname: string
          requested_path: string
          requested_referrer_host?: string
          requested_site_key: string
          requested_source?: string
          requested_utm_source?: string
        }
        Returns: boolean
      }
      record_public_site_event: {
        Args: {
          requested_anonymous_session_hash?: string
          requested_device_type?: string
          requested_event_type: string
          requested_path: string
          requested_referrer_host?: string
          requested_slug: string
          requested_source?: string
          requested_utm_source?: string
        }
        Returns: boolean
      }
      resolve_public_site_slug: {
        Args: { requested_hostname: string }
        Returns: string
      }
      rotate_analytics_site_key: {
        Args: { target_business_id: string }
        Returns: string
      }
      set_agency_business_status: {
        Args: {
          requested_status: Database['public']['Enums']['business_status']
          target_business_id: string
        }
        Returns: boolean
      }
      set_analytics_connection_enabled: {
        Args: { requested_enabled: boolean; target_business_id: string }
        Returns: boolean
      }
      set_lead_status: {
        Args: {
          requested_business_id: string
          requested_lead_id: string
          requested_loss_reason?: string
          requested_status: Database['public']['Enums']['lead_status']
        }
        Returns: boolean
      }
      set_lead_values: {
        Args: {
          requested_business_id: string
          requested_estimated_value_minor: number
          requested_lead_id: string
          requested_won_value_minor: number
        }
        Returns: boolean
      }
      update_agency_business: {
        Args: {
          address_line_1?: string
          business_name: string
          business_timezone: string
          city?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          postal_code?: string
          region?: string
          target_business_id: string
          website_hostname?: string
          website_url?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      actor_type: 'user' | 'system' | 'visitor' | 'provider'
      asset_kind: 'logo' | 'photo' | 'icon' | 'document'
      business_member_role: 'owner' | 'manager' | 'staff' | 'viewer'
      business_status: 'draft' | 'active' | 'suspended' | 'archived'
      connection_status: 'disconnected' | 'pending' | 'connected' | 'error'
      delivery_status:
        'captured' | 'queued' | 'sent' | 'delivered' | 'failed' | 'suppressed'
      domain_status: 'pending' | 'verified' | 'failed' | 'removed'
      job_status: 'pending' | 'processing' | 'sent' | 'canceled' | 'failed'
      lead_status: 'new' | 'contacted' | 'estimate_sent' | 'won' | 'lost'
      membership_status: 'active' | 'suspended'
      platform_role: 'admin' | 'member'
      subscription_status:
        'unknown' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'
      webhook_status: 'received' | 'processed' | 'ignored' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      actor_type: ['user', 'system', 'visitor', 'provider'],
      asset_kind: ['logo', 'photo', 'icon', 'document'],
      business_member_role: ['owner', 'manager', 'staff', 'viewer'],
      business_status: ['draft', 'active', 'suspended', 'archived'],
      connection_status: ['disconnected', 'pending', 'connected', 'error'],
      delivery_status: [
        'captured',
        'queued',
        'sent',
        'delivered',
        'failed',
        'suppressed',
      ],
      domain_status: ['pending', 'verified', 'failed', 'removed'],
      job_status: ['pending', 'processing', 'sent', 'canceled', 'failed'],
      lead_status: ['new', 'contacted', 'estimate_sent', 'won', 'lost'],
      membership_status: ['active', 'suspended'],
      platform_role: ['admin', 'member'],
      subscription_status: [
        'unknown',
        'trialing',
        'active',
        'past_due',
        'canceled',
        'paused',
      ],
      webhook_status: ['received', 'processed', 'ignored', 'failed'],
    },
  },
} as const
