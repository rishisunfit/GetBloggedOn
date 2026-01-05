export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Bloggish Platform</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Welcome to the Bloggish blogs platform.
      </p>
      <p className="text-sm text-gray-500 mt-4">
        Visit a subdomain like <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">username.bloggish.io</code> to see a blog.
      </p>
    </main>
  );
}

