import { supabase } from '../lib/supabase';

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
};

export const postsApi = {
  // Get all posts
  async getAll() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Post[];
  },

  // Get single post
  async getById(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Post;
  },

  // Create new post
  async create(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  // Update post
  async update(id: string, post: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update(post)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  // Delete post
  async delete(id: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

