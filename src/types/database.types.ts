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
      admins: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          role: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          role?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          role?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      doctors: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          designation: string | null;
          specialization: string;
          qualification: string;
          experience: string;
          bio: string | null;
          detailed_bio: string | null;
          image: string;
          storage_path: string | null;
          consultation_fee: number;
          display_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          designation?: string | null;
          specialization: string;
          qualification: string;
          experience: string;
          bio?: string | null;
          detailed_bio?: string | null;
          image: string;
          storage_path?: string | null;
          consultation_fee?: number;
          display_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          designation?: string | null;
          specialization?: string;
          qualification?: string;
          experience?: string;
          bio?: string | null;
          detailed_bio?: string | null;
          image?: string;
          storage_path?: string | null;
          consultation_fee?: number;
          display_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      doctor_availability: {
        Row: {
          id: string;
          doctor_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          slot_duration: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          slot_duration?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          day_of_week?: string;
          start_time?: string;
          end_time?: string;
          slot_duration?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          }
        ];
      };
      treatments: {
        Row: {
          id: string;
          name: string;
          slug: string;
          short_description: string | null;
          description: string;
          duration: string;
          price: number;
          image: string | null;
          storage_path: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          short_description?: string | null;
          description: string;
          duration: string;
          price: number;
          image?: string | null;
          storage_path?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string;
          duration?: string;
          price?: number;
          image?: string | null;
          storage_path?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          short_description: string | null;
          description: string;
          price: number;
          stock: number;
          category: string;
          image: string;
          images: string[] | null;
          storage_paths: string[] | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          short_description?: string | null;
          description: string;
          price: number;
          stock?: number;
          category: string;
          image: string;
          images?: string[] | null;
          storage_paths?: string[] | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string;
          price?: number;
          stock?: number;
          category?: string;
          image?: string;
          images?: string[] | null;
          storage_paths?: string[] | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          image_url: string;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          image_url: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          image_url?: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          phone: string;
          email: string;
          address: string;
          city: string;
          state: string;
          pincode: string;
          subtotal: number;
          total: number;
          payment_status: string;
          order_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          phone: string;
          email: string;
          address: string;
          city: string;
          state: string;
          pincode: string;
          subtotal: number;
          total: number;
          payment_status?: string;
          order_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          phone?: string;
          email?: string;
          address?: string;
          city?: string;
          state?: string;
          pincode?: string;
          subtotal?: number;
          total?: number;
          payment_status?: string;
          order_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price_at_purchase?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      appointments: {
        Row: {
          id: string;
          patient_name: string;
          phone: string;
          email: string;
          doctor_id: string;
          treatment_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string | null;
          status: string;
          payment_status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_name: string;
          phone: string;
          email: string;
          doctor_id: string;
          treatment_id: string;
          appointment_date: string;
          start_time: string;
          end_time?: string | null;
          status?: string;
          payment_status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_name?: string;
          phone?: string;
          email?: string;
          doctor_id?: string;
          treatment_id?: string;
          appointment_date?: string;
          start_time?: string;
          end_time?: string | null;
          status?: string;
          payment_status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          }
        ];
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          category: string;
          author: string;
          read_time: string | null;
          featured_image: string | null;
          storage_path: string | null;
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          category?: string;
          author?: string;
          read_time?: string | null;
          featured_image?: string | null;
          storage_path?: string | null;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          category?: string;
          author?: string;
          read_time?: string | null;
          featured_image?: string | null;
          storage_path?: string | null;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patient_stories: {
        Row: {
          id: string;
          patient_name: string;
          treatment: string;
          story: string;
          location: string | null;
          image: string | null;
          storage_path: string | null;
          rating: number;
          published: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_name: string;
          treatment: string;
          story: string;
          location?: string | null;
          image?: string | null;
          storage_path?: string | null;
          rating?: number;
          published?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_name?: string;
          treatment?: string;
          story?: string;
          location?: string | null;
          image?: string | null;
          storage_path?: string | null;
          rating?: number;
          published?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      gallery: {
        Row: {
          id: string;
          title: string;
          caption: string | null;
          image: string;
          storage_path: string | null;
          file_size: number | null;
          category: string;
          published: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          caption?: string | null;
          image: string;
          storage_path?: string | null;
          file_size?: number | null;
          category: string;
          published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          caption?: string | null;
          image?: string;
          storage_path?: string | null;
          file_size?: number | null;
          category?: string;
          published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      video_testimonials: {
        Row: {
          id: string;
          title: string;
          patient_name: string;
          description: string | null;
          video_url: string;
          storage_path: string | null;
          thumbnail_url: string | null;
          thumbnail_storage_path: string | null;
          file_size: number | null;
          duration: number | null;
          published: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          patient_name: string;
          description?: string | null;
          video_url: string;
          storage_path?: string | null;
          thumbnail_url?: string | null;
          thumbnail_storage_path?: string | null;
          file_size?: number | null;
          duration?: number | null;
          published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          patient_name?: string;
          description?: string | null;
          video_url?: string;
          storage_path?: string | null;
          thumbnail_url?: string | null;
          thumbnail_storage_path?: string | null;
          file_size?: number | null;
          duration?: number | null;
          published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
