import { useState } from "react";
import { Plus, FileText, Calendar, Edit, Trash2, ClipboardList, Eye, ExternalLink } from "lucide-react";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "published";
};

type Quiz = {
  id: string;
  title: string;
  questionsCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "published";
};

type ContentTab = "posts" | "quizzes";

interface DashboardProps {
  onCreatePost: () => void;
  onEditPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
  onPreviewQuiz: (quizId: string) => void;
  posts: Post[];
  quizzes: Quiz[];
  isCreating?: boolean;
}

export function Dashboard({
  onCreatePost,
  onEditPost,
  onDeletePost,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onPreviewQuiz,
  posts,
  quizzes,
  isCreating = false,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>("posts");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Blogish</h1>
            <p className="text-gray-600 mt-2">Your stories, beautifully told</p>
          </div>
          <div className="flex gap-3">
            {activeTab === "posts" && (
              <button
                onClick={onCreatePost}
                disabled={isCreating}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                {isCreating ? "Creating..." : "New Post"}
              </button>
            )}
            {activeTab === "quizzes" && (
              <button
                onClick={onCreateQuiz}
                disabled={isCreating}
                className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                New Quiz
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "posts"
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText size={18} />
            Posts
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "posts" ? "bg-white/20" : "bg-gray-200"
            }`}>
              {posts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "quizzes"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ClipboardList size={18} />
            Quizzes
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "quizzes" ? "bg-white/20" : "bg-gray-200"
            }`}>
              {quizzes.length}
            </span>
          </button>
        </div>

        {/* Stats - Posts */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-gray-900">
                {posts.length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Total Posts</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600">
                {posts.filter((p) => p.status === "published").length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Published</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-yellow-600">
                {posts.filter((p) => p.status === "draft").length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Drafts</div>
            </div>
          </div>
        )}

        {/* Stats - Quizzes */}
        {activeTab === "quizzes" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-gray-900">
                {quizzes.length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Total Quizzes</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600">
                {quizzes.filter((q) => q.status === "published").length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Published</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-violet-600">
                {quizzes.reduce((acc, q) => acc + q.questionsCount, 0)}
              </div>
              <div className="text-gray-600 text-sm mt-1">Total Questions</div>
            </div>
          </div>
        )}

        {/* Posts List */}
        {activeTab === "posts" && (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {post.title}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(post.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={16} />
                          {post.content.split(" ").length} words
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-2">
                        {post.content.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onEditPost(post.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-16">
                <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first blog post
                </p>
                <button
                  onClick={onCreatePost}
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                  {isCreating ? "Creating..." : "Create Your First Post"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Quizzes List */}
        {activeTab === "quizzes" && (
          <>
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <ClipboardList size={20} className="text-violet-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {quiz.title}
                          </h2>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>{quiz.questionsCount} questions</span>
                            <span>•</span>
                            <span>{formatDate(quiz.updatedAt)}</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quiz.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {quiz.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onPreviewQuiz(quiz.id)}
                        className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => window.open(`/quiz/${quiz.id}`, '_blank')}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Open Quiz"
                      >
                        <ExternalLink size={20} />
                      </button>
                      <button
                        onClick={() => onEditQuiz(quiz.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => onDeleteQuiz(quiz.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {quizzes.length === 0 && (
              <div className="text-center py-16">
                <ClipboardList size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No quizzes yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create interactive quiz funnels to engage your audience
                </p>
                <button
                  onClick={onCreateQuiz}
                  className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus size={20} />
                  Create Your First Quiz
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
