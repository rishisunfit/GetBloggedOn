import { useState, useEffect } from "react";
import { Plus, FileText, Calendar, Edit, Trash2, ClipboardList, Eye, ExternalLink, MessageSquare, Mail, Phone, Reply, Users, ChevronDown, ChevronUp, Search } from "lucide-react";
import { formSubmissionsApi, type FormSubmission } from "@/services/formSubmissions";
import { quizSubmissionsApi, type QuizSubmission } from "@/services/quizSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { ReplyModal } from "./ReplyModal";
import { supabase } from "@/lib/supabase";
import { useDialog } from "@/hooks/useDialog";
import { quizzesApi } from "@/services/quizzes";
import type { Quiz as FullQuiz, QuizQuestion } from "@/types/quiz";

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

type ContentTab = "posts" | "quizzes" | "responses" | "quiz-responses";

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
  const [quizResponses, setQuizResponses] = useState<QuizSubmission[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [loadingQuizResponses, setLoadingQuizResponses] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<FormSubmission | null>(null);
  const [expandedQuizResponses, setExpandedQuizResponses] = useState<Set<string>>(new Set());
  const [quizDataCache, setQuizDataCache] = useState<Map<string, FullQuiz>>(new Map());

  // Search states for each tab
  const [searchPosts, setSearchPosts] = useState("");
  const [searchQuizzes, setSearchQuizzes] = useState("");
  const [searchResponses, setSearchResponses] = useState("");
  const [searchQuizResponses, setSearchQuizResponses] = useState("");

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
      loadQuizResponses();
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

  const loadQuizResponses = async () => {
    if (!user?.id) return;

    setLoadingQuizResponses(true);
    try {
      const data = await quizSubmissionsApi.getByAuthorId(user.id);
      setQuizResponses(data);
    } catch (error) {
      console.error("Error loading quiz responses:", error);
    } finally {
      setLoadingQuizResponses(false);
    }
  };

  // Get post title by ID
  const getPostTitle = (postId: string | null) => {
    if (!postId) return "Unknown Post";
    const post = posts.find((p) => p.id === postId);
    return post?.title || "Unknown Post";
  };

  // Get quiz title by ID
  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz?.title || "Unknown Quiz";
  };

  // Load quiz data for a specific quiz ID
  const loadQuizData = async (quizId: string): Promise<FullQuiz | null> => {
    // Check cache first
    if (quizDataCache.has(quizId)) {
      return quizDataCache.get(quizId) || null;
    }

    try {
      const quiz = await quizzesApi.getById(quizId);
      if (quiz) {
        setQuizDataCache((prev) => new Map(prev).set(quizId, quiz));
        return quiz;
      }
      return null;
    } catch (error) {
      console.error(`Error loading quiz ${quizId}:`, error);
      return null;
    }
  };

  // Get question text by question ID
  const getQuestionText = (quizId: string, questionId: string): string => {
    const quiz = quizDataCache.get(quizId);
    if (!quiz) return `Question ${questionId}`;
    const question = quiz.questions.find((q) => q.id === questionId);
    return question?.question || `Question ${questionId}`;
  };

  // Get formatted answer text
  const getAnswerText = (quizId: string, questionId: string, answerValue: string | string[] | number): string => {
    const quiz = quizDataCache.get(quizId);
    if (!quiz) {
      // Fallback: return raw value
      return Array.isArray(answerValue) ? answerValue.join(", ") : String(answerValue);
    }

    const question = quiz.questions.find((q: QuizQuestion) => q.id === questionId);
    if (!question) {
      return Array.isArray(answerValue) ? answerValue.join(", ") : String(answerValue);
    }

    // Handle different question types
    if (question.type === 'rating') {
      return `${answerValue} out of 5 stars`;
    }

    if (question.type === 'text' || question.type === 'email' || question.type === 'phone') {
      return (answerValue as string) || 'Not provided';
    }

    if (question.type === 'multiple_choice') {
      const selectedIds = answerValue as string[];
      const selectedOptions = question.options?.filter((o: { id: string; text: string }) => selectedIds.includes(o.id)) || [];
      return selectedOptions.map((o: { text: string }) => o.text).join(', ') || 'None selected';
    }

    // Single choice
    const selectedOption = question.options?.find((o: { id: string; text: string }) => o.id === answerValue);
    return selectedOption?.text || String(answerValue);
  };

  // Toggle expanded state for a quiz response
  const toggleQuizResponse = async (responseId: string, quizId: string) => {
    const isExpanded = expandedQuizResponses.has(responseId);
    if (isExpanded) {
      setExpandedQuizResponses((prev) => {
        const next = new Set(prev);
        next.delete(responseId);
        return next;
      });
    } else {
      // Load quiz data if not cached
      if (!quizDataCache.has(quizId)) {
        await loadQuizData(quizId);
      }
      setExpandedQuizResponses((prev) => new Set(prev).add(responseId));
    }
  };

  // Filter functions
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchPosts.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuizzes.toLowerCase())
  );

  const filteredResponses = responses.filter((response) => {
    const query = searchResponses.toLowerCase();
    if (!query) return true;

    const email = response.email?.toLowerCase() || "";
    const phone = response.phone?.toLowerCase() || "";
    const message = response.message?.toLowerCase() || "";
    const postTitle = getPostTitle(response.post_id).toLowerCase();

    return (
      email.includes(query) ||
      phone.includes(query) ||
      message.includes(query) ||
      postTitle.includes(query)
    );
  });

  const filteredQuizResponses = quizResponses.filter((response) => {
    const query = searchQuizResponses.toLowerCase();
    if (!query) return true;

    const name = response.contact_info?.name?.toLowerCase() || "";
    const phone = response.contact_info?.phone?.toLowerCase() || "";
    const email = response.contact_info?.email?.toLowerCase() || "";
    const quizTitle = getQuizTitle(response.quiz_id).toLowerCase();

    // Search in answer content
    const answerText = response.answers
      .map((answer) => {
        try {
          return getAnswerText(response.quiz_id, answer.questionId, answer.value);
        } catch {
          return String(answer.value);
        }
      })
      .join(" ")
      .toLowerCase();

    return (
      name.includes(query) ||
      phone.includes(query) ||
      email.includes(query) ||
      quizTitle.includes(query) ||
      answerText.includes(query)
    );
  });

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
          <button
            onClick={() => setActiveTab("quiz-responses")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === "quiz-responses"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <Users size={18} />
            Quiz Responses
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "quiz-responses" ? "bg-white/20" : "bg-gray-200"
              }`}>
              {quizResponses.length}
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
            {/* Search Bar for Posts */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search posts by title..."
                  value={searchPosts}
                  onChange={(e) => setSearchPosts(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                // Strip HTML tags and get plain text preview
                const plainText = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const wordCount = plainText.split(' ').filter(word => word.length > 0).length;
                const preview = plainText.substring(0, 120);

                return (
                  <div
                    key={post.id}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header: Title and Status */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h2 className="text-xl font-bold text-gray-900 flex-1">
                            {post.title}
                          </h2>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                              }`}
                          >
                            {post.status}
                          </span>
                        </div>

                        {/* Content Preview */}
                        {plainText ? (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {preview}{plainText.length > 120 ? '...' : ''}
                          </p>
                        ) : (
                          <p className="text-gray-400 italic text-sm mb-3">No content yet</p>
                        )}

                        {/* Metadata - Subtle footer */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
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
                );
              })}
            </div>

            {filteredPosts.length === 0 && searchPosts && (
              <div className="text-center py-16">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-600 mb-6">
                  No posts match your search query "{searchPosts}".
                </p>
              </div>
            )}
            {posts.length === 0 && !searchPosts && (
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
            {/* Search Bar for Responses */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or message..."
                  value={searchResponses}
                  onChange={(e) => setSearchResponses(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
            {loadingResponses ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading responses...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResponses.map((response) => (
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

            {!loadingResponses && filteredResponses.length === 0 && searchResponses && (
              <div className="text-center py-16">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No responses found
                </h3>
                <p className="text-gray-600 mb-6">
                  No responses match your search query "{searchResponses}".
                </p>
              </div>
            )}
            {!loadingResponses && responses.length === 0 && !searchResponses && (
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
            {/* Search Bar for Quizzes */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search quizzes by title..."
                  value={searchQuizzes}
                  onChange={(e) => setSearchQuizzes(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-4">
              {filteredQuizzes.map((quiz) => (
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

            {filteredQuizzes.length === 0 && searchQuizzes && (
              <div className="text-center py-16">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No quizzes found
                </h3>
                <p className="text-gray-600 mb-6">
                  No quizzes match your search query "{searchQuizzes}".
                </p>
              </div>
            )}
            {quizzes.length === 0 && !searchQuizzes && (
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

        {/* Quiz Responses List */}
        {activeTab === "quiz-responses" && (
          <>
            {/* Search Bar for Quiz Responses */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or answer content..."
                  value={searchQuizResponses}
                  onChange={(e) => setSearchQuizResponses(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>
            {loadingQuizResponses ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading quiz responses...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuizResponses.length === 0 && searchQuizResponses ? (
                  <div className="text-center py-16">
                    <Search size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No quiz responses found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No quiz responses match your search query "{searchQuizResponses}".
                    </p>
                  </div>
                ) : filteredQuizResponses.length === 0 && !searchQuizResponses ? (
                  <div className="text-center py-16">
                    <Users size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No quiz responses yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Responses from your published quizzes will appear here.
                    </p>
                  </div>
                ) : (
                  filteredQuizResponses.map((response) => {
                    const isExpanded = expandedQuizResponses.has(response.id);
                    return (
                      <div
                        key={response.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                      >
                        {/* Header - Always visible */}
                        <div
                          className="p-6 cursor-pointer"
                          onClick={() => toggleQuizResponse(response.id, response.quiz_id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {getQuizTitle(response.quiz_id)}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  {formatDateTime(response.completed_at)}
                                </span>
                              </div>
                              {response.contact_info && (
                                <div className="mb-2">
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {response.contact_info.name && (
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">Name:</span>
                                        <span>{response.contact_info.name}</span>
                                      </div>
                                    )}
                                    {response.contact_info.email && (
                                      <div className="flex items-center gap-1">
                                        <Mail size={14} />
                                        <span>{response.contact_info.email}</span>
                                      </div>
                                    )}
                                    {response.contact_info.phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone size={14} />
                                        <span>{response.contact_info.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {!response.contact_info && (
                                <p className="text-gray-400 italic text-sm mb-2">No contact information provided</p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{response.answers.length} question{response.answers.length !== 1 ? 's' : ''} answered</span>
                                {isExpanded ? (
                                  <ChevronUp size={16} className="text-gray-400" />
                                ) : (
                                  <ChevronDown size={16} className="text-gray-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                              {(response.contact_info?.email || response.contact_info?.phone) && (
                                <button
                                  onClick={() => {
                                    setSelectedResponse({
                                      id: response.id,
                                      email: response.contact_info?.email || null,
                                      phone: response.contact_info?.phone || null,
                                      subject: "Quiz Response",
                                      message: `Quiz: ${getQuizTitle(response.quiz_id)}`,
                                      post_id: null,
                                      post_author_id: null,
                                      session_id: null,
                                      created_at: response.completed_at,
                                    } as FormSubmission);
                                    setReplyModalOpen(true);
                                  }}
                                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Reply"
                                >
                                  <Reply size={20} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                            <p className="text-sm text-gray-600 font-medium mb-3">Answers:</p>
                            <div className="space-y-4">
                              {response.answers.map((answer, idx) => {
                                const questionText = getQuestionText(response.quiz_id, answer.questionId);
                                const answerText = getAnswerText(response.quiz_id, answer.questionId, answer.value);
                                return (
                                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                                        {idx + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                          {questionText}
                                        </p>
                                        <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded border border-gray-200">
                                          {answerText}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
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
