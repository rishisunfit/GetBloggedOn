'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Quiz } from '@/types/quiz';
import { quizzesApi } from '@/services/quizzes';
import { QuizBuilder, QuizPlayer } from '@/components/quiz';
import { Loader2 } from 'lucide-react';

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizId = params.id as string;
        const loadedQuiz = await quizzesApi.getById(quizId);
        
        if (!loadedQuiz) {
          setError('Quiz not found');
        } else {
          setQuiz(loadedQuiz);
        }
      } catch (err) {
        setError('Failed to load quiz');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [params.id]);

  const handleSave = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!quiz) return;

    try {
      const updatedQuiz = await quizzesApi.update(quiz.id, quizData);
      if (updatedQuiz) {
        setQuiz(updatedQuiz);
        // Show a brief success message
        alert('Quiz saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert('Failed to save quiz. Please try again.');
    }
  };

  const handlePreview = (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!quiz) return;
    
    setPreviewQuiz({
      ...quizData,
      id: quiz.id,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      userId: quiz.userId,
    });
    setIsPreviewMode(true);
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-600" />
          <p className="text-stone-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            {error || 'Quiz not found'}
          </h1>
          <p className="text-stone-600 mb-6">
            The quiz you're trying to edit doesn't exist.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (isPreviewMode && previewQuiz) {
    return (
      <QuizPlayer
        quiz={previewQuiz}
        onClose={() => setIsPreviewMode(false)}
      />
    );
  }

  return (
    <QuizBuilder
      initialQuiz={quiz}
      onSave={handleSave}
      onPreview={handlePreview}
      onBack={handleBack}
    />
  );
}

