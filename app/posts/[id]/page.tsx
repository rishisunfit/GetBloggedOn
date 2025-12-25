"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { ReactionBar } from "@/components/viewer/ReactionBar";
import { CTAForm } from "@/components/viewer/CTAForm";
import { QuizRenderer } from "@/components/viewer/QuizRenderer";
import { VideoTimestamps } from "@/components/viewer/VideoTimestamps";
import { VideoJsPlayer, extractCloudflareVideoIdFromUrl } from "@/components/viewer/VideoJsPlayer";
import { postsApi, PostStyles } from "@/services/posts";
import { normalizeTemplateData, splitTemplateFromHtml, type PostTemplateData } from "@/services/postTemplate";

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
    styles?: PostStyles;
    template_data?: PostTemplateData | null;
};

// Font options matching the editor
const fontOptions = [
    { name: "PT Serif", value: "PT Serif, Georgia, serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Merriweather", value: "Merriweather, Georgia, serif" },
    { name: "Playfair Display", value: "Playfair Display, Georgia, serif" },
    { name: "Lora", value: "Lora, Georgia, serif" },
    { name: "Inter", value: "Inter, system-ui, sans-serif" },
    { name: "Open Sans", value: "Open Sans, system-ui, sans-serif" },
    { name: "Roboto", value: "Roboto, system-ui, sans-serif" },
];

// Default styles if post doesn't have styles
const defaultStyles: PostStyles = {
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    primaryColor: "#DB2777",
    primaryTextColor: "#FFFFFF",
    secondaryColor: "#6B7280",
    linkColor: "#4746E5",
    headingFont: "PT Serif",
    headingWeight: "700",
    bodyFont: "Georgia",
    bodyWeight: "400",
};

export default function PublicPostPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const [post, setPost] = useState<Post | null>(null);
    const [template, setTemplate] = useState<PostTemplateData | null>(null);
    const [bodyHtml, setBodyHtml] = useState<string>("");
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

    const extractedVideo = useMemo(() => {
        if (typeof window === "undefined" || !bodyHtml) {
            return { src: null, id: null, primaryColor: null };
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyHtml, "text/html");
        const iframe = doc.querySelector<HTMLIFrameElement>(
            'iframe[src*="cloudflarestream.com"], iframe[src*="videodelivery.net"]'
        );
        const src = iframe?.getAttribute("src") || null;
        const normalizedSrc = src ? (src.startsWith("http") ? src : `https://${src.replace(/^\/\//, "")}`) : null;
        const { videoId } = normalizedSrc ? extractCloudflareVideoIdFromUrl(normalizedSrc) : { videoId: null };

        // Extract primaryColor from URL
        let primaryColor: string | null = null;
        if (normalizedSrc) {
            try {
                const urlObj = new URL(normalizedSrc);
                const pc = urlObj.searchParams.get("primaryColor");
                if (pc) {
                    primaryColor = pc.startsWith("#") ? pc : `#${pc.replace(/^%23/, "")}`;
                } else {
                    // Try regex fallback
                    const match = normalizedSrc.match(/primaryColor=%23([a-fA-F0-9]{6})/);
                    if (match) {
                        primaryColor = `#${match[1]}`;
                    }
                }
            } catch {
                // Invalid URL, try regex
                const match = normalizedSrc.match(/primaryColor=%23([a-fA-F0-9]{6})/);
                if (match) {
                    primaryColor = `#${match[1]}`;
                }
            }
        }

        return { src: normalizedSrc, id: videoId, primaryColor };
    }, [bodyHtml]);

    const loadPost = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await postsApi.getPublicById(id);
            const t = (data as any).template_data as PostTemplateData | null | undefined;
            if (t) {
                setTemplate(normalizeTemplateData(t, data.created_at));
                setBodyHtml(data.content || "");
            } else {
                // Legacy fallback: older posts may have header embedded in HTML content
                const split = splitTemplateFromHtml(data.content || "", data.created_at);
                setTemplate(split.template);
                setBodyHtml(split.body || "");
            }
            setPost(data as any);
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
            <div className="min-h-screen" style={{ backgroundColor: defaultStyles.backgroundColor }}>
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

    // Get styles from post or use defaults (only when post exists)
    const styles = post.styles || defaultStyles;

    // Get font values
    const headingFont = fontOptions.find(f => f.name === styles.headingFont)?.value || styles.headingFont;
    const bodyFont = fontOptions.find(f => f.name === styles.bodyFont)?.value || styles.bodyFont;

    const safeTemplate = normalizeTemplateData(template, post.created_at);
    const enableVideoJs = searchParams?.get("player") === "videojs";

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: styles.backgroundColor,
                color: styles.textColor,
            }}
        >
            {/* Article */}
            <article
                className="max-w-3xl mx-auto px-4 py-12"
                style={{
                    fontFamily: bodyFont,
                    fontWeight: styles.bodyWeight,
                }}
            >
                {/* Header (from template_data with legacy fallback) */}
                <header className="mb-8">
                    <div className="text-center text-xs font-bold tracking-[0.18em] uppercase mb-4" style={{ opacity: 0.8 }}>
                        {(safeTemplate.seriesName || "").trim()}
                        {(safeTemplate.seriesName || "").trim() && (safeTemplate.volume || "").trim() ? " • " : ""}
                        {(safeTemplate.volume || "").trim() ? `Volume ${safeTemplate.volume}` : ""}
                    </div>

                    <h1
                        className="text-5xl font-bold mb-4 text-center"
                        style={{
                            fontFamily: headingFont,
                            fontWeight: styles.headingWeight,
                            color: styles.textColor,
                        }}
                    >
                        {(safeTemplate.title || "").trim() || post.title || "Untitled Post"}
                    </h1>

                    {(safeTemplate.subtitle || "").trim() ? (
                        <p className="text-center text-xl italic mb-6" style={{ opacity: 0.9 }}>
                            {safeTemplate.subtitle}
                        </p>
                    ) : null}

                    <div className="flex items-center justify-center gap-2 text-sm mb-4" style={{ color: styles.textColor, opacity: 0.7 }}>
                        <Calendar size={16} />
                        {safeTemplate.date || formatDate(new Date(post.created_at))}
                    </div>

                    {(safeTemplate.authorName || "").trim() ? (
                        <div className="text-center text-xs font-bold tracking-[0.14em] uppercase border-b pb-4" style={{ opacity: 0.8, borderColor: styles.textColor }}>
                            By {safeTemplate.authorName}
                        </div>
                    ) : (
                        <div className="border-b pb-4" style={{ opacity: 0.2, borderColor: styles.textColor }} />
                    )}
                </header>

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none"
                    style={{
                        color: styles.textColor,
                        lineHeight: "1.75",
                        fontFamily: bodyFont,
                        fontWeight: styles.bodyWeight,
                    }}
                >
                    {bodyHtml ? (
                        <>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                    .preview-content h1,
                                    .preview-content h2,
                                    .preview-content h3,
                                    .preview-content h4,
                                    .preview-content h5,
                                    .preview-content h6 {
                                        font-family: ${headingFont};
                                        font-weight: ${styles.headingWeight};
                                        color: ${styles.textColor};
                                    }
                                    .preview-content a {
                                        color: ${styles.linkColor};
                                    }
                                    .preview-content blockquote {
                                        border-left-color: ${styles.textColor};
                                        color: ${styles.textColor};
                                    }
                                    .preview-content code {
                                        background-color: ${styles.backgroundColor === "#FFFFFF" ? "#F3F4F6" : "rgba(0,0,0,0.1)"};
                                    }
                                `
                            }} />
                            <div
                                dangerouslySetInnerHTML={{ __html: bodyHtml }}
                                className="preview-content"
                                style={{
                                    fontFamily: bodyFont,
                                    fontWeight: styles.bodyWeight,
                                }}
                            />
                            {bodyHtml && <VideoTimestamps postId={post.id} key={bodyHtml} />}
                            {enableVideoJs && extractedVideo.src && extractedVideo.id ? (
                                <VideoJsPlayer
                                    key={`videojs-${post.id}-${extractedVideo.id}`}
                                    postId={post.id}
                                    videoUrl={extractedVideo.src}
                                    videoId={extractedVideo.id}
                                    primaryColor={extractedVideo.primaryColor}
                                />
                            ) : enableVideoJs ? (
                                <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm text-yellow-800">
                                        Video.js enabled but no video found. Debug: src={extractedVideo.src ? "exists" : "null"}, id={extractedVideo.id ? "exists" : "null"}
                                    </p>
                                </div>
                            ) : null}
                            <QuizRenderer />
                        </>
                    ) : (
                        <p style={{ color: styles.textColor, opacity: 0.6, fontStyle: "italic" }}>
                            No content available.
                        </p>
                    )}
                </div>

                {/* Reaction Bar */}
                <ReactionBar postId={post.id} />

                {/* CTA Form */}
                <CTAForm postId={post.id} quizId={post.quiz_id} />

                {/* Footer */}
                <footer
                    className="mt-16 pt-8 border-t"
                    style={{
                        borderColor: styles.textColor,
                        opacity: 0.2,
                    }}
                >
                    <p
                        className="text-center"
                        style={{
                            color: styles.textColor,
                            opacity: 0.7,
                        }}
                    >
                        Built with <span style={{ color: styles.primaryColor }}>♥</span> using Blogish
                    </p>
                </footer>
            </article>
        </div>
    );
}

