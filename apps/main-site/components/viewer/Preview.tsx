import { ArrowLeft, Calendar } from "lucide-react";
import { ReactionBar } from "./ReactionBar";
import { CTAForm } from "./CTAForm";
import { QuizRenderer } from "./QuizRenderer";
import { PostTemplateData } from "@/services/postTemplate";

interface PreviewProps {
  title: string;
  content: string;
  date?: Date;
  postId?: string;
  quizId?: string | null;
  templateData?: PostTemplateData;
  onBack: () => void;
}

export function Preview({
  title,
  content,
  date = new Date(),
  postId,
  quizId,
  templateData,
  onBack,
}: PreviewProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: templateData?.useGreenTemplate ? "#10B981" : "#FFFFFF" }}
    >
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
        {/* Template Header - Display when using templateData */}
        {templateData && templateData.headerEnabled !== false && (
          <header className={`mb-12 ${templateData.useGreenTemplate ? "text-white" : ""}`}>
            {templateData.seriesName && templateData.volume && (
              <div className="text-center text-xs uppercase tracking-wider mb-4">
                {templateData.seriesName} • {templateData.volume}
              </div>
            )}
            {templateData.title && (
              <h1 className="text-center text-5xl font-bold mb-4">
                {templateData.title}
              </h1>
            )}
            {templateData.subtitle && (
              <p className="text-center text-lg italic mb-6">
                {templateData.subtitle}
              </p>
            )}
            {(templateData.authorName || templateData.date) && (
              <div className="text-center text-xs uppercase tracking-wider border-b pb-4 mb-12">
                {templateData.authorName && `By ${templateData.authorName}`}
                {templateData.authorName && templateData.date && " • "}
                {templateData.date || formatDate(date)}
              </div>
            )}
          </header>
        )}

        {/* Content - Wrapped in white card if green template is active */}
        <div className={templateData?.useGreenTemplate ? "bg-white rounded-lg p-8 shadow-lg" : ""}>
          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            style={{
              color: "rgb(17 24 39)",
              lineHeight: "1.75",
            }}
          >
            {content ? (
              <div
                dangerouslySetInnerHTML={{ __html: content }}
                className="preview-content"
              />
            ) : (
              <p className="text-gray-400 italic">
                No content yet. Start writing in the editor!
              </p>
            )}
          </div>

          {/* Quiz CTA (if enabled) */}
          {quizId && <QuizRenderer quizId={quizId} />}

          {/* Reaction Bar */}
          <ReactionBar postId={postId} />

          {/* CTA Form */}
          <CTAForm postId={postId} quizId={quizId} />
        </div>

        {/* Footer */}
        <footer className={`mt-16 pt-8 border-t ${templateData?.useGreenTemplate ? "border-white/20 text-white" : "border-gray-200"}`}>
          <p className="text-center">
            Built with <span className="text-red-500">♥</span> using Blogish
          </p>
        </footer>
      </article>
    </div>
  );
}
