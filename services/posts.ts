import { supabase } from "@/lib/supabase";

export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: "draft" | "published";
  user_id: string;
  is_draft: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  status: "draft" | "published";
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  status?: "draft" | "published";
  is_draft?: boolean;
}

export const postsApi = {
  async getAll(): Promise<Post[]> {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Post> {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(postData: CreatePostData): Promise<Post> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        ...postData,
        user_id: userData.user.id,
        is_draft: postData.status === "draft",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, postData: UpdatePostData): Promise<Post> {
    const { data, error } = await supabase
      .from("posts")
      .update({
        ...postData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
  },
};

