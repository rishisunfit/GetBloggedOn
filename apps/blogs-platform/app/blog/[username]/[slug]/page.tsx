import { supabase, type Post, type User } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PostPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

async function getUser(subdomain: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

async function getPost(userId: string, slug: string): Promise<Post | null> {
  // Try to find by post_slug first, then by id
  let query = supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "published")
    .eq("is_draft", false);

  // Check if slug looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  if (isUUID) {
    query = query.eq("id", slug);
  } else {
    query = query.eq("post_slug", slug);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }

  return data as Post;
}

export default async function PostPage({ params }: PostPageProps) {
  const { username, slug } = await params;

  const user = await getUser(username);
  if (!user) {
    notFound();
  }

  const post = await getPost(user.id, slug);
  if (!post) {
    notFound();
  }

  // Apply custom styles if available
  const styles = post.styles || {};
  const customStyles = {
    "--bg-color": styles.backgroundColor || "#ffffff",
    "--text-color": styles.textColor || "#000000",
    "--link-color": styles.linkColor || "#4746E5",
    "--primary-color": styles.primaryColor || "#DB2777",
    "--heading-font": styles.headingFont || "Georgia, serif",
    "--body-font": styles.bodyFont || "Georgia, serif",
    "--heading-weight": styles.headingWeight || "700",
    "--body-weight": styles.bodyWeight || "400",
  } as React.CSSProperties;

  return (
    <main
      className="min-h-screen"
      style={{
        ...customStyles,
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      {/* Header */}
      <header className="border-b border-gray-100/20">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: "var(--link-color)" }}
          >
            ← Back to {user.name || username}'s blog
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <header className="mb-12 text-center">
          {post.template_data?.seriesName && (
            <p
              className="text-sm uppercase tracking-wider mb-4"
              style={{ color: "var(--primary-color)" }}
            >
              {post.template_data.seriesName}
            </p>
          )}
          <h1
            className="text-4xl md:text-5xl mb-6"
            style={{
              fontFamily: "var(--heading-font)",
              fontWeight: "var(--heading-weight)",
            }}
          >
            {post.title}
          </h1>
          {post.template_data?.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {post.template_data.subtitle}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>By {post.template_data?.authorName || user.name || username}</span>
            <span>•</span>
            <time>
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          style={{
            fontFamily: "var(--body-font)",
            fontWeight: "var(--body-weight)",
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-100/20 mt-12">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-400">
            Powered by{" "}
            <a
              href="https://bloggish.io"
              className="hover:underline"
              style={{ color: "var(--link-color)" }}
            >
              Bloggish
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

