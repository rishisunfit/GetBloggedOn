import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the database
export interface Post {
  id: string;
  title: string;
  content: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  user_id: string;
  is_draft: boolean;
  styles: {
    bodyFont?: string;
    linkColor?: string;
    textColor?: string;
    bodyWeight?: string;
    headingFont?: string;
    primaryColor?: string;
    headingWeight?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    primaryTextColor?: string;
  } | null;
  template_data: {
    title?: string;
    subtitle?: string;
    authorName?: string;
    seriesName?: string;
    date?: string;
  } | null;
  folder_slug: string | null;
  post_slug: string | null;
}

export interface User {
  id: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  subdomain?: string | null;
}

