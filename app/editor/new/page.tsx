"use client";

import { useRouter } from "next/navigation";
import { Editor } from "@/components/editor/Editor";
import { postsApi } from "@/services/posts";
import { useDialog } from "@/hooks/useDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function NewEditorPage() {
  const router = useRouter();
  const { showDialog } = useDialog();

  const handleBack = () => {
    router.push("/");
  };

  const handlePreview = async () => {
    await showDialog({
      type: "alert",
      message: "Please save the post before previewing",
      title: "Preview",
    });
  };

  const handleSave = async (title: string, content: string, silent = false) => {
    // For new posts, create them first
    try {
      const newPost = await postsApi.create({
        title: title || "Untitled Post",
        content,
        status: "draft",
      });
      // Update URL to include the new post ID
      router.replace(`/editor/${newPost.id}`);
      if (!silent) {
        await showDialog({
          type: "alert",
          message: "Post created successfully!",
          title: "Success",
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      await showDialog({
        type: "alert",
        message: "Failed to create post",
        title: "Error",
      });
    }
  };

  return (
    <ProtectedRoute>
      <Editor
        key="new"
        postId={undefined}
        initialTitle=""
        initialContent=""
        onBack={handleBack}
        onPreview={handlePreview}
        onSave={handleSave}
      />
    </ProtectedRoute>
  );
}
