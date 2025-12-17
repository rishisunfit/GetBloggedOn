"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { DashboardShimmer } from "@/components/DashboardShimmer";
import { postsApi } from "@/services/posts";
import { useAuth } from "@/hooks/useAuth";
import { useDialog } from "@/hooks/useDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: "draft" | "published";
  user_id: string;
  is_draft: boolean;
};

// Helper to convert DB post to UI format
const convertPost = (post: Post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  createdAt: new Date(post.created_at),
  updatedAt: new Date(post.updated_at),
  status: post.status as "draft" | "published",
  user_id: post.user_id,
  is_draft: post.is_draft,
});

export default function HomePage() {
  const [posts, setPosts] = useState<ReturnType<typeof convertPost>[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut, profile } = useAuth();
  const router = useRouter();
  const { showDialog } = useDialog();

  // Load posts from Supabase on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postsApi.getAll();
      setPosts(data.map(convertPost));
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    router.push("/editor/new");
  };

  const handleEditPost = (postId: string) => {
    router.push(`/editor/${postId}`);
  };

  const handleDeletePost = async (id: string) => {
    const confirmed = await showDialog({
      type: "confirm",
      message: "Are you sure you want to delete this post?",
      title: "Delete Post",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      try {
        await postsApi.delete(id);
        setPosts(posts.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
        await showDialog({
          type: "alert",
          message: "Failed to delete post",
          title: "Error",
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <DashboardShimmer />;
  }

  return (
    <ProtectedRoute>
      {/* Header with user info and logout */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blogish</h1>
            {profile?.name && (
              <p className="text-sm text-gray-600">Welcome, {profile.name}</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      <Dashboard
        onCreatePost={handleCreatePost}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        posts={posts}
        isCreating={false}
      />
    </ProtectedRoute>
  );
}
