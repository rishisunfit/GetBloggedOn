"use client";

import { useState, useEffect } from "react";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { quizzesApi } from "@/services/quizzes";
import type { Quiz } from "@/types/quiz";
import { Loader2 } from "lucide-react";

interface QuizEmbedProps {
    quizId: string;
    align?: "left" | "center" | "right";
}

export function QuizEmbed({ quizId, align = "center" }: QuizEmbedProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadQuiz = async () => {
            if (!quizId) {
                setError("No quiz ID provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // Try to get by ID first (for user's own quizzes)
                let quizData = await quizzesApi.getById(quizId);
                // If not found, try by slug (for published quizzes)
                if (!quizData) {
                    // Try to get by slug if quizId looks like a slug
                    quizData = await quizzesApi.getBySlug(quizId);
                }
                if (quizData) {
                    setQuiz(quizData);
                } else {
                    setError("Quiz not found");
                }
            } catch (err) {
                console.error("Error loading quiz:", err);
                setError(err instanceof Error ? err.message : "Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };

        loadQuiz();
    }, [quizId]);

    if (loading) {
        return (
            <div
                className="quiz-wrapper my-8"
                data-type="quiz"
                data-quiz-id={quizId}
                data-align={align}
                style={{ textAlign: align }}
            >
                <div className="quiz-inner inline-block max-w-2xl w-full">
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 size={20} className="animate-spin text-gray-400" />
                            <span className="text-gray-600">Loading quiz...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div
                className="quiz-wrapper my-8"
                data-type="quiz"
                data-quiz-id={quizId}
                data-align={align}
                style={{ textAlign: align }}
            >
                <div className="quiz-inner inline-block max-w-2xl w-full">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 text-sm">
                            {error || "Quiz not found"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="quiz-wrapper my-8"
            data-type="quiz"
            data-quiz-id={quizId}
            data-align={align}
            style={{ textAlign: align }}
        >
            <div className="quiz-inner inline-block max-w-2xl w-full">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <QuizPlayer quiz={quiz} />
                </div>
            </div>
        </div>
    );
}

