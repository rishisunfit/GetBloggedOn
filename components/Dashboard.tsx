import { useState, useEffect } from "react";
import { Plus, FileText, Calendar, Edit, Trash2, ClipboardList, Eye, ExternalLink, MessageSquare, Mail, Phone, Reply } from "lucide-react";
import { formSubmissionsApi, type FormSubmission } from "@/services/formSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { ReplyModal } from "./ReplyModal";
import { supabase } from "@/lib/supabase";
import { useDialog } from "@/hooks/useDialog";

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

type ContentTab = "posts" | "quizzes" | "responses";

interface DashboardProps {
  onCreatePost: () => void;
  onEditPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onPreviewPost?: (postId: string) => void;
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
  onPreviewPost,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onPreviewQuiz,
  posts,
  quizzes,
  isCreating = false,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>("posts");
  const [responses, setResponses] = useState<FormSubmission[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<FormSubmission | null>(null);
  const { user } = useAuth();
  const { showDialog } = useDialog();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load responses when user is available (load on mount to get accurate count)
  useEffect(() => {
    if (user?.id) {
      loadResponses();
    }
  }, [user?.id]);

  const loadResponses = async () => {
    if (!user?.id) return;

    setLoadingResponses(true);
    try {
      const data = await formSubmissionsApi.getByAuthorId(user.id);
      setResponses(data);
    } catch (error) {
      console.error("Error loading responses:", error);
    } finally {
      setLoadingResponses(false);
    }
  };

  // Get post title by ID
  const getPostTitle = (postId: string | null) => {
    if (!postId) return "Unknown Post";
    const post = posts.find((p) => p.id === postId);
    return post?.title || "Unknown Post";
  };

  const handleOpenReply = (response: FormSubmission) => {
    if (!response.email && !response.phone) {
      showDialog({
        type: "alert",
        title: "No Contact Information",
        message: "This submission doesn't have email or phone number to reply to.",
      });
      return;
    }
    setSelectedResponse(response);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (message: string) => {
    if (!selectedResponse || !user) {
      throw new Error("Missing response or user information");
    }

    // Get the session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("Please log in to send a reply");
    }

    const response = await fetch("/api/send-reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        submission_id: selectedResponse.id,
        email: selectedResponse.email,
        phone: selectedResponse.phone,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || "Failed to send reply");
    }

    // Show success message (non-blocking)
    const contactMethod = selectedResponse.email ? "Email" : "SMS";
    showDialog({
      type: "alert",
      title: "Reply Sent",
      message: `Your reply has been sent successfully via ${contactMethod}.`,
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === "posts"
              ? "bg-black text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <FileText size={18} />
            Posts
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "posts" ? "bg-white/20" : "bg-gray-200"
              }`}>
              {posts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === "quizzes"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <ClipboardList size={18} />
            Quizzes
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "quizzes" ? "bg-white/20" : "bg-gray-200"
              }`}>
              {quizzes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === "responses"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <MessageSquare size={18} />
            Responses
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "responses" ? "bg-white/20" : "bg-gray-200"
              }`}>
              {responses.length}
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

        {/* Stats - Responses */}
        {activeTab === "responses" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-gray-900">
                {responses.length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Total Responses</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-blue-600">
                {responses.filter((r) => r.email).length}
              </div>
              <div className="text-gray-600 text-sm mt-1">With Email</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600">
                {responses.filter((r) => r.phone).length}
              </div>
              <div className="text-gray-600 text-sm mt-1">With Phone</div>
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
                          className={`px-3 py-1 rounded-full text-xs font-medium ${post.status === "published"
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
                      {onPreviewPost && (
                        <button
                          onClick={() => onPreviewPost(post.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye size={20} />
                        </button>
                      )}
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

        {/* Responses List */}
        {activeTab === "responses" && (
          <>
            {loadingResponses ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading responses...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getPostTitle(response.post_id)}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(response.created_at)}
                          </span>
                        </div>
                        <div className="mb-3">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {response.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {response.email && (
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              <span>{response.email}</span>
                            </div>
                          )}
                          {response.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{response.phone}</span>
                            </div>
                          )}
                          {!response.email && !response.phone && (
                            <span className="text-gray-400 italic">No contact information</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {(response.email || response.phone) && (
                          <button
                            onClick={() => handleOpenReply(response)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Reply"
                          >
                            <Reply size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingResponses && responses.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No responses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Responses from your published posts will appear here
                </p>
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
                          className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.status === "published"
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

        {/* Reply Modal */}
        <ReplyModal
          isOpen={replyModalOpen}
          onClose={() => {
            setReplyModalOpen(false);
            setSelectedResponse(null);
          }}
          email={selectedResponse?.email || null}
          phone={selectedResponse?.phone || null}
          onSubmit={handleSendReply}
        />
      </div>
    </div>
  );
}
