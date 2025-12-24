import { useState, useEffect } from "react";
import { X, Loader2, ClipboardList, Check, Search } from "lucide-react";
import { quizzesApi } from "@/services/quizzes";
import type { Quiz } from "@/types/quiz";

interface PostSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizId: string | null;
    onSave: (quizId: string | null) => void;
}

export function PostSettingsModal({
    isOpen,
    onClose,
    quizId,
    onSave,
}: PostSettingsModalProps) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(quizId);
    const [quizEnabled, setQuizEnabled] = useState(!!quizId);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadQuizzes();
            setSelectedQuizId(quizId);
            setQuizEnabled(!!quizId);
        }
    }, [isOpen, quizId]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await quizzesApi.getAll();
            // Sort by updated_at descending and take first 5
            const sorted = data.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            setAllQuizzes(sorted);
            setQuizzes(sorted.slice(0, 5));
        } catch (err) {
            console.error("Error loading quizzes:", err);
            setError(err instanceof Error ? err.message : "Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    // Filter quizzes based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            // Show 5 most recent when no search
            setQuizzes(allQuizzes.slice(0, 5));
        } else {
            // Filter by search query
            const filtered = allQuizzes.filter((quiz) =>
                quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setQuizzes(filtered);
        }
    }, [searchQuery, allQuizzes]);

    const handleSave = () => {
        onSave(quizEnabled ? selectedQuizId : null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Post Settings</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Quiz Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                    Quiz Funnel
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Add a quiz that will appear at the bottom of your post, after the contact form.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={quizEnabled}
                                    onChange={(e) => {
                                        setQuizEnabled(e.target.checked);
                                        if (!e.target.checked) {
                                            setSelectedQuizId(null);
                                        }
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                            </label>
                        </div>

                        {quizEnabled && (
                            <div className="mt-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 size={24} className="animate-spin text-gray-400" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <p className="text-red-600 mb-4">{error}</p>
                                        <button
                                            onClick={loadQuizzes}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : allQuizzes.length === 0 ? (
                                    <div className="text-center py-8 border border-gray-200 rounded-lg">
                                        <ClipboardList size={32} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-600 text-sm mb-1">No quizzes found</p>
                                        <p className="text-xs text-gray-500">
                                            Create a quiz first to link it to this post
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search Input */}
                                        <div className="mb-4">
                                            <div className="relative">
                                                <Search
                                                    size={18}
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search quizzes..."
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        {/* Quiz List */}
                                        {quizzes.length === 0 ? (
                                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                                                <p className="text-gray-600 text-sm">
                                                    No quizzes found matching "{searchQuery}"
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {quizzes.map((quiz) => (
                                                    <button
                                                        key={quiz.id}
                                                        onClick={() => setSelectedQuizId(quiz.id)}
                                                        className={`w-full text-left p-4 border rounded-lg transition-colors ${selectedQuizId === quiz.id
                                                            ? "border-violet-500 bg-violet-50"
                                                            : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h5 className="font-semibold text-gray-900">
                                                                        {quiz.title}
                                                                    </h5>
                                                                    {selectedQuizId === quiz.id && (
                                                                        <Check size={16} className="text-violet-600" />
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                                    <span>{quiz.questions.length} questions</span>
                                                                    <span>•</span>
                                                                    <span
                                                                        className={`px-2 py-0.5 rounded-full text-xs ${quiz.status === "published"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-yellow-100 text-yellow-800"
                                                                            }`}
                                                                    >
                                                                        {quiz.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <ClipboardList
                                                                size={20}
                                                                className={`ml-4 ${selectedQuizId === quiz.id
                                                                    ? "text-violet-600"
                                                                    : "text-gray-400"
                                                                    }`}
                                                            />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={quizEnabled && !selectedQuizId}
                        className="px-4 py-2 bg-violet-600 text-white hover:bg-violet-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

