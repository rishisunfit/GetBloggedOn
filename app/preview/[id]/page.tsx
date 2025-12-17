"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Preview } from "@/components/viewer/Preview";
import { postsApi } from "@/services/posts";
import { useDialog } from "@/hooks/useDialog";
import { DashboardShimmer } from "@/components/DashboardShimmer";
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

export default function PreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { showDialog } = useDialog();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPost();
    } else {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const loadPost = async () => {
    if (!id) return;

    try {
      const data = await postsApi.getById(id);
      setPost(data);
    } catch (error) {
      console.error("Error loading post for preview:", error);
      await showDialog({
        type: "alert",
        message: "Failed to load post for preview",
        title: "Error",
      });
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (id) {
      router.push(`/editor/${id}`);
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return <DashboardShimmer />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
        Post not found.
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Preview
        title={post.title}
        content={post.content}
        date={new Date(post.created_at)}
        postId={post.id}
        onBack={handleBack}
      />
    </ProtectedRoute>
  );
}
