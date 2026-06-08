// =============================================================================
// Tipos gerados a partir do schema do banco (prisma/schema.prisma + migrations
// em prisma/migrations/). Equivalente ao output de:
//
//   supabase gen types typescript --project-id <ref> --schema public
//
// Regenere este arquivo sempre que o schema mudar para manter o shape em
// sincronia com o banco real.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatarUrl: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatarUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatarUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: Database["public"]["Enums"]["Plan"];
          stripeCustomerId: string | null;
          stripePriceId: string | null;
          stripeSubId: string | null;
          planExpiresAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: Database["public"]["Enums"]["Plan"];
          stripeCustomerId?: string | null;
          stripePriceId?: string | null;
          stripeSubId?: string | null;
          planExpiresAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: Database["public"]["Enums"]["Plan"];
          stripeCustomerId?: string | null;
          stripePriceId?: string | null;
          stripeSubId?: string | null;
          planExpiresAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          workspaceId: string;
          userId: string;
          role: Database["public"]["Enums"]["Role"];
          joinedAt: string;
        };
        Insert: {
          workspaceId: string;
          userId: string;
          role?: Database["public"]["Enums"]["Role"];
          joinedAt?: string;
        };
        Update: {
          workspaceId?: string;
          userId?: string;
          role?: Database["public"]["Enums"]["Role"];
          joinedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspaceId_fkey";
            columns: ["workspaceId"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      invites: {
        Row: {
          id: string;
          workspaceId: string;
          email: string;
          role: Database["public"]["Enums"]["Role"];
          token: string;
          expiresAt: string;
          acceptedAt: string | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          workspaceId: string;
          email: string;
          role?: Database["public"]["Enums"]["Role"];
          token?: string;
          expiresAt: string;
          acceptedAt?: string | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          workspaceId?: string;
          email?: string;
          role?: Database["public"]["Enums"]["Role"];
          token?: string;
          expiresAt?: string;
          acceptedAt?: string | null;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invites_workspaceId_fkey";
            columns: ["workspaceId"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          workspaceId: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          jobTitle: string | null;
          status: string;
          notes: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          workspaceId: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          jobTitle?: string | null;
          status?: string;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          workspaceId?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          jobTitle?: string | null;
          status?: string;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_workspaceId_fkey";
            columns: ["workspaceId"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          workspaceId: string;
          leadId: string;
          title: string;
          value: number | null;
          stage: Database["public"]["Enums"]["Stage"];
          ownerId: string;
          dueDate: string | null;
          notes: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          workspaceId: string;
          leadId: string;
          title: string;
          value?: number | null;
          stage?: Database["public"]["Enums"]["Stage"];
          ownerId: string;
          dueDate?: string | null;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          workspaceId?: string;
          leadId?: string;
          title?: string;
          value?: number | null;
          stage?: Database["public"]["Enums"]["Stage"];
          ownerId?: string;
          dueDate?: string | null;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_workspaceId_fkey";
            columns: ["workspaceId"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_leadId_fkey";
            columns: ["leadId"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_ownerId_fkey";
            columns: ["ownerId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          leadId: string;
          authorId: string;
          type: Database["public"]["Enums"]["ActivityType"];
          description: string;
          date: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          leadId: string;
          authorId: string;
          type: Database["public"]["Enums"]["ActivityType"];
          description: string;
          date?: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          leadId?: string;
          authorId?: string;
          type?: Database["public"]["Enums"]["ActivityType"];
          description?: string;
          date?: string;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_leadId_fkey";
            columns: ["leadId"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_authorId_fkey";
            columns: ["authorId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_workspace_member: {
        Args: { p_workspace_id: string };
        Returns: boolean;
      };
      is_workspace_admin: {
        Args: { p_workspace_id: string };
        Returns: boolean;
      };
      lead_workspace_id: {
        Args: { p_lead_id: string };
        Returns: string;
      };
    };
    Enums: {
      Plan: "FREE" | "PRO";
      Role: "ADMIN" | "MEMBER";
      Stage:
        | "NEW_LEAD"
        | "CONTACTED"
        | "PROPOSAL_SENT"
        | "NEGOTIATION"
        | "WON"
        | "LOST";
      ActivityType: "CALL" | "EMAIL" | "MEETING" | "NOTE";
    };
    CompositeTypes: Record<string, never>;
  };
};

// ---------------------------------------------------------------------------
// Helpers de conveniência (mesmo padrão do `supabase gen types`)
// ---------------------------------------------------------------------------

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
