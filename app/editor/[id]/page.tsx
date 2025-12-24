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
  quiz_id: string | null;
};

export default function EditorPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { showDialog } = useDialog();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizId, setQuizId] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (!id) return;

    try {
      const data = await postsApi.getById(id);
      setPost(data);
      setQuizId(data.quiz_id);
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


  const handleUpdateQuizId = async (newQuizId: string | null) => {
    if (!id) return;
    try {
      await postsApi.update(id, {
        quiz_id: newQuizId,
      });
      setQuizId(newQuizId);
      await loadPost();
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  const handleSaveDraft = async (title: string, content: string, silent = false) => {
    if (!id) return;

    try {
      await postsApi.update(id, {
        title,
        content,
        status: "draft",
        is_draft: true,
        quiz_id: quizId,
      });

      // Reload post data to get latest
      await loadPost();

      if (!silent) {
        await showDialog({
          type: "alert",
          message: "Post saved as draft!",
          title: "Success",
        });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      await showDialog({
        type: "alert",
        message: "Failed to save draft",
        title: "Error",
      });
    }
  };

  const handlePublish = async (title: string, content: string, silent = false) => {
    if (!id) return;

    try {
      await postsApi.update(id, {
        title,
        content,
        status: "published",
        is_draft: false,
        quiz_id: quizId,
      });

      // Reload post data to get latest
      await loadPost();

      if (!silent) {
        await showDialog({
          type: "alert",
          message: "Post published successfully!",
          title: "Success",
        });
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      await showDialog({
        type: "alert",
        message: "Failed to publish post",
        title: "Error",
      });
    }
  };

  const handleSave = async (title: string, content: string, silent = false) => {
    // Fallback to save as draft for backward compatibility
    await handleSaveDraft(title, content, silent);
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
        initialQuizId={post?.quiz_id || null}
        onBack={handleBack}
        onPreview={handlePreview}
        onSave={handleSave}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onUpdateQuizId={handleUpdateQuizId}
      />
    </ProtectedRoute>
  );
}
