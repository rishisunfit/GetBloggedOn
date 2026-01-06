"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { postsApi, type Post } from "@/services/posts";
import Link from "next/link";

interface NextArticleProps {
  nextPostId: string;
}

export function NextArticle({ nextPostId }: NextArticleProps) {
  const [nextPost, setNextPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadNextPost = async () => {
      try {
        setLoading(true);
        setError(false);
        // Try authenticated first, fallback to public
        try {
          const post = await postsApi.getById(nextPostId);
          setNextPost(post);
        } catch (authError) {
          // Fallback to public API
          const post = await postsApi.getPublicById(nextPostId);
          setNextPost(post);
        }
      } catch (err) {
        console.error("Error loading next post:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (nextPostId) {
      loadNextPost();
    }
  }, [nextPostId]);

  if (loading) {
    return (
      <div className="my-8 flex justify-end">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>
    );
  }

  if (error || !nextPost) {
    return null;
  }

  // Build the URL for the next post
  const nextPostUrl = nextPost.folder_slug && nextPost.post_slug
    ? `/${nextPost.folder_slug}/${nextPost.post_slug}`
    : `/posts/${nextPost.id}`;

  return (
    <div className="my-8 flex justify-end">
      <Link
        href={nextPostUrl}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        <span>Next: {nextPost.title}</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
