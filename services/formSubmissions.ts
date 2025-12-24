import { supabase } from "@/lib/supabase";

export interface FormSubmission {
  id: string;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string;
  post_id: string | null;
  post_author_id: string | null;
  session_id: string | null;
  created_at: string;
}

export interface CreateFormSubmissionData {
  email?: string | null;
  phone?: string | null;
  subject: string;
  message: string;
  post_id?: string | null;
  post_author_id?: string | null;
  session_id?: string | null;
}

export const formSubmissionsApi = {
  async create(
    submissionData: CreateFormSubmissionData
  ): Promise<FormSubmission> {
    const { data, error } = await supabase
      .from("form_submissions")
      .insert(submissionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
