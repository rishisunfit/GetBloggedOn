"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@/components/editor/Editor";
import { postsApi } from "@/services/posts";
import { useDialog } from "@/hooks/useDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EditorShimmer } from "@/components/EditorShimmer";

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

export default function EditorPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { showDialog } = useDialog();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPost = useCallback(async () => {
    if (!id) return;

    try {
      const data = await postsApi.getById(id);
      setPost(data);
    } catch (error) {
      console.error("Error loading post:", error);
      await showDialog({
        type: "alert",
        message: "Failed to load post",
        title: "Error",
      });
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [id, router, showDialog]);

  useEffect(() => {
    if (id) {
      loadPost();
    } else {
      setLoading(false);
      setPost(null);
    }
  }, [id, loadPost]);

  const handleBack = () => {
    router.push("/");
  };

  const handlePreview = async () => {
    if (id) {
      router.push(`/preview/${id}`);
    } else {
      await showDialog({
        type: "alert",
        message: "Please save the post before previewing",
        title: "Preview",
      });
    }
  };

  const handleSave = async (title: string, content: string, silent = false) => {
    if (!id) return;

    try {
      await postsApi.update(id, {
        title,
        content,
      });

      // Reload post data to get latest
      await loadPost();

      if (!silent) {
        await showDialog({
          type: "alert",
          message: "Post saved successfully!",
          title: "Success",
        });
      }
    } catch (error) {
      console.error("Error saving post:", error);
      await showDialog({
        type: "alert",
        message: "Failed to save post",
        title: "Error",
      });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <EditorShimmer />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Editor
        key={post?.id || "new"}
        postId={id}
        initialTitle={post?.title || ""}
        initialContent={post?.content || ""}
        onBack={handleBack}
        onPreview={handlePreview}
        onSave={handleSave}
      />
    </ProtectedRoute>
  );
}
