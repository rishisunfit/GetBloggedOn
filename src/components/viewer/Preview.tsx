import { ArrowLeft, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReactionBar } from './ReactionBar';
import { CTAForm } from './CTAForm';

interface PreviewProps {
  title: string;
  content: string;
  date?: Date;
  postId?: string;
  onBack: () => void;
}

export function Preview({ title, content, date = new Date(), postId, onBack }: PreviewProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Editor
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
            <Calendar size={16} />
            {formatDate(date)}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{title || 'Untitled Post'}</h1>
        </header>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none"
          style={{
            color: 'rgb(17 24 39)',
            lineHeight: '1.75',
          }}
        >
          {content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: content }}
              className="preview-content"
            />
          ) : (
            <p className="text-gray-400 italic">No content yet. Start writing in the editor!</p>
          )}
        </div>

        {/* Reaction Bar */}
        <ReactionBar />

        {/* CTA Form */}
        <CTAForm postId={postId} />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-center">
            Built with <span className="text-red-500">♥</span> using Blogish
          </p>
        </footer>
      </article>
    </div>
  );
}

