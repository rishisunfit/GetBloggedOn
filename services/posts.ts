// Local storage-based posts (will refactor to Supabase later)

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

const STORAGE_KEY = "blogish_posts";

// Helper to generate UUID
const generateId = (): string => {
  return crypto.randomUUID?.() || 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

// Helper to get posts from localStorage
const getStoredPosts = (): Post[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save posts to localStorage
const savePosts = (posts: Post[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const postsApi = {
  async getAll(): Promise<Post[]> {
    return getStoredPosts();
  },

  async getById(id: string): Promise<Post> {
    const posts = getStoredPosts();
    const post = posts.find(p => p.id === id);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  },

  async create(postData: CreatePostData): Promise<Post> {
    const posts = getStoredPosts();
    const now = new Date().toISOString();
    
    const newPost: Post = {
      id: generateId(),
      ...postData,
      user_id: "local-user",
      is_draft: postData.status === "draft",
      created_at: now,
      updated_at: now,
    };
    
    posts.unshift(newPost); // Add to beginning
    savePosts(posts);
    
    return newPost;
  },

  async update(id: string, postData: UpdatePostData): Promise<Post> {
    const posts = getStoredPosts();
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error("Post not found");
    }
    
    const updatedPost: Post = {
      ...posts[index],
      ...postData,
      is_draft: postData.status ? postData.status === "draft" : posts[index].is_draft,
      updated_at: new Date().toISOString(),
    };
    
    posts[index] = updatedPost;
    savePosts(posts);
    
    return updatedPost;
  },

  async delete(id: string): Promise<void> {
    const posts = getStoredPosts();
    const filtered = posts.filter(p => p.id !== id);
    savePosts(filtered);
  },
};

