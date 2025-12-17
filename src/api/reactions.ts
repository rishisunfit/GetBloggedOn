import { supabase } from '../lib/supabase';

type Reaction = {
  id: string;
  post_id: string;
  emoji: string;
  count: number;
};

export const reactionsApi = {
  // Get reactions for a post
  async getByPostId(postId: string) {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('post_id', postId);

    if (error) throw error;
    return data as Reaction[];
  },

  // Increment reaction count
  async increment(postId: string, emoji: string) {
    // Check if reaction exists
    const { data: existing } = await supabase
      .from('reactions')
      .select('*')
      .eq('post_id', postId)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('reactions')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as Reaction;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('reactions')
        .insert([{ post_id: postId, emoji, count: 1 }])
        .select()
        .single();

      if (error) throw error;
      return data as Reaction;
    }
  },
};

