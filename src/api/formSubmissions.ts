import { supabase } from '../lib/supabase';

type FormSubmission = {
  id: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  post_id?: string;
};

export const formSubmissionsApi = {
  // Submit form
  async create(submission: Omit<FormSubmission, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([submission])
      .select()
      .single();

    if (error) throw error;
    return data as FormSubmission;
  },

  // Get all submissions (for admin view later)
  async getAll() {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FormSubmission[];
  },
};

