import { supabase, type Post, type User } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPageProps {
  params: Promise<{
    username: string;
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

async function getPublishedPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "published")
    .eq("is_draft", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return (data || []) as Post[];
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { username } = await params;

  // Try to find the user by subdomain
  const user = await getUser(username);

  if (!user) {
    // User not found, show a friendly message
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog not found
          </h1>
          <p className="text-gray-600 mb-8">
            The blog <strong>{username}</strong> doesn't exist yet.
          </p>
          <a
            href="https://bloggish.io"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Create your own blog
          </a>
        </div>
      </main>
    );
  }

  // Get published posts for this user
  const posts = await getPublishedPosts(user.id);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.name || username}'s Blog
          </h1>
          <p className="text-gray-500 mt-2">
            {posts.length} {posts.length === 1 ? "post" : "posts"} published
          </p>
        </div>
      </header>

      {/* Posts List */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No posts published yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/${post.post_slug || post.id}`}>
                  <div className="space-y-3">
                    <time className="text-sm text-gray-400">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                      {post.title}
                    </h2>
                    {post.template_data?.subtitle && (
                      <p className="text-gray-600">
                        {post.template_data.subtitle}
                      </p>
                    )}
                    <span className="inline-flex items-center text-sm text-violet-600 font-medium group-hover:underline">
                      Read more →
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-400">
            Powered by{" "}
            <a
              href="https://bloggish.io"
              className="text-violet-600 hover:underline"
            >
              Bloggish
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
