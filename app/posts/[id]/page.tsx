"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { ReactionBar } from "@/components/viewer/ReactionBar";
import { CTAForm } from "@/components/viewer/CTAForm";
import { postsApi } from "@/services/posts";

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

export default function PublicPostPage() {
    const params = useParams();
    const id = params.id as string;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadPost();
        } else {
            setLoading(false);
            setError("Post ID is required");
        }
    }, [id]);

    // Update page title when post loads
    useEffect(() => {
        if (post) {
            document.title = `${post.title} | Blogish`;
        } else {
            document.title = "Blogish";
        }
    }, [post]);

    const loadPost = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await postsApi.getPublicById(id);
            setPost(data);
    } catch (err) {
      console.error("Error loading post:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load post";
      console.error("Full error details:", {
        message: errorMessage,
        error: err,
      });
      setError(errorMessage);
    } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded w-full mb-8"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="max-w-md mx-auto px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Post Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error || "The post you're looking for doesn't exist or is not published."}
                    </p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Article */}
            <article className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                        <Calendar size={16} />
                        {formatDate(new Date(post.created_at))}
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        {post.title || "Untitled Post"}
                    </h1>
                </header>

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none"
                    style={{
                        color: "rgb(17 24 39)",
                        lineHeight: "1.75",
                    }}
                >
                    {post.content ? (
                        <div
                            dangerouslySetInnerHTML={{ __html: post.content }}
                            className="preview-content"
                        />
                    ) : (
                        <p className="text-gray-400 italic">No content available.</p>
                    )}
                </div>

                {/* Reaction Bar */}
                <ReactionBar postId={post.id} />

                {/* CTA Form */}
                <CTAForm postId={post.id} />

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-gray-200">
                    <p className="text-gray-600 text-center">
                        Built with <span className="text-red-500">♥</span> using Blogish
                    </p>
                </footer>
            </article>
        </div>
    );
}

