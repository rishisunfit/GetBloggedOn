import { supabase } from "@/lib/supabase";

export interface FormSubmission {
  id: string;
  phone: string;
  subject: string;
  message: string;
  post_id: string | null;
  user_id: string | null;
  created_at: string;
}

export interface CreateFormSubmissionData {
  phone: string;
  subject: string;
  message: string;
  post_id?: string | null;
  user_id?: string | null;
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
