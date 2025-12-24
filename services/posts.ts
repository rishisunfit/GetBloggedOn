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
  styles?: PostStyles;
}

export interface PostStyles {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  primaryTextColor: string;
  secondaryColor: string;
  linkColor: string;
  headingFont: string;
  headingWeight: string;
  bodyFont: string;
  bodyWeight: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  status: "draft" | "published";
  styles?: PostStyles;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  status?: "draft" | "published";
  is_draft?: boolean;
  styles?: PostStyles;
}

export const postsApi = {
  async getAll(): Promise<Post[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Post> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userData.user.id)
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error("Post not found");
    }
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
        title: postData.title,
        content: postData.content,
        status: postData.status,
        is_draft: postData.status === "draft",
        user_id: userData.user.id,
        styles: postData.styles || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, postData: UpdatePostData): Promise<Post> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("User not authenticated");
    }

    // Build update object
    const updateData: any = {};
    if (postData.title !== undefined) updateData.title = postData.title;
    if (postData.content !== undefined) updateData.content = postData.content;
    if (postData.status !== undefined) updateData.status = postData.status;
    if (postData.is_draft !== undefined) {
      updateData.is_draft = postData.is_draft;
    } else if (postData.status !== undefined) {
      updateData.is_draft = postData.status === "draft";
    }
    if (postData.styles !== undefined) updateData.styles = postData.styles;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userData.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error("Post not found");
    }
    return data;
  },

  async delete(id: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("user_id", userData.user.id);

    if (error) throw error;
  },
};

