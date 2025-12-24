'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz } from '@/types/quiz';
import { quizzesApi, createBlankQuiz } from '@/services/quizzes';
import { QuizBuilder, QuizPlayer } from '@/components/quiz';

export default function NewQuizPage() {
  const router = useRouter();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'userId'> | null>(null);

  const handleSave = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const newQuiz = await quizzesApi.create(quizData);
      router.push(`/quiz/${newQuiz.id}/edit`);
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert('Failed to save quiz. Please try again.');
    }
  };

  const handlePreview = (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    setPreviewQuiz(quizData);
    setIsPreviewMode(true);
  };

  const handleBack = () => {
    router.push('/');
  };

  if (isPreviewMode && previewQuiz) {
    return (
      <QuizPlayer
        quiz={{
          ...previewQuiz,
          id: 'preview',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'preview-user',
        }}
        onClose={() => setIsPreviewMode(false)}
      />
    );
  }

  return (
    <QuizBuilder
      initialQuiz={createBlankQuiz()}
      onSave={handleSave}
      onPreview={handlePreview}
      onBack={handleBack}
    />
  );
}

