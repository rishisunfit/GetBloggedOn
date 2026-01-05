interface BlogPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { username } = await params;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-6">
          Blog tenant: <span className="text-blue-600">{username}</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          This is the blog for <strong>{username}</strong> on Bloggish.
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🎉 Subdomain routing is working! The middleware rewrote this request
            from <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{username}.bloggish.io</code> to{" "}
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/blog/{username}</code>
          </p>
        </div>
      </div>
    </main>
  );
}

