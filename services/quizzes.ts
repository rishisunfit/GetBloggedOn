// Quiz service with Supabase integration

import { supabase } from "@/lib/supabase";
import {
  Quiz,
  QuizSubmission,
  defaultQuizStyles,
  defaultContactSettings,
} from "@/types/quiz";
import type { Tables, TablesInsert, Json } from "@/types/database";

// Transform database row to Quiz type
const transformQuizRow = (row: Tables<"quizzes">): Quiz => {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug || undefined,
    coverPage: row.cover_page as unknown as Quiz["coverPage"],
    questions: row.questions as unknown as Quiz["questions"],
    conclusionPage: row.conclusion_page as unknown as Quiz["conclusionPage"],
    contactSettings: row.contact_settings as unknown as Quiz["contactSettings"],
    styles: row.styles as unknown as Quiz["styles"],
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    userId: row.user_id,
    status: row.status as "draft" | "published",
  };
};

// Transform Quiz type to database row
const transformQuizToRow = (
  quiz: Partial<Quiz>
): Partial<TablesInsert<"quizzes">> => {
  const row: Partial<TablesInsert<"quizzes">> = {};
  if (quiz.title !== undefined) row.title = quiz.title;
  if (quiz.slug !== undefined) row.slug = quiz.slug || null;
  if (quiz.coverPage !== undefined)
    row.cover_page = quiz.coverPage as unknown as Json;
  if (quiz.questions !== undefined)
    row.questions = quiz.questions as unknown as Json;
  if (quiz.conclusionPage !== undefined)
    row.conclusion_page = quiz.conclusionPage as unknown as Json;
  if (quiz.contactSettings !== undefined)
    row.contact_settings = quiz.contactSettings as unknown as Json;
  if (quiz.styles !== undefined) row.styles = quiz.styles as unknown as Json;
  if (quiz.status !== undefined) row.status = quiz.status;
  if (quiz.userId !== undefined) row.user_id = quiz.userId;
  return row;
};

export const quizzesApi = {
  // Authenticated methods removed for viewer-only app

  async getBySlug(slug: string): Promise<Quiz | null> {
    // Public access - no auth required for published quizzes
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return data ? transformQuizRow(data) : null;
  },

  async getPublicById(id: string): Promise<Quiz | null> {
    // Public access - no auth required
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return data ? transformQuizRow(data) : null;
  },

  async submitQuiz(
    submission: Omit<QuizSubmission, "id" | "completedAt">
  ): Promise<QuizSubmission> {
    // Use the quizSubmissionsApi instead
    const { quizSubmissionsApi } = await import("./quizSubmissions");
    const dbSubmission = await quizSubmissionsApi.create({
      quiz_id: submission.quizId,
      answers: submission.answers,
      contact_info: submission.contactInfo,
    });
    // Transform back to QuizSubmission type
    return {
      id: dbSubmission.id,
      quizId: dbSubmission.quiz_id,
      answers: dbSubmission.answers,
      contactInfo: dbSubmission.contact_info,
      completedAt: dbSubmission.completed_at,
    };
  },

  async getSubmissions(quizId: string): Promise<QuizSubmission[]> {
    // Use the quizSubmissionsApi instead
    const { quizSubmissionsApi } = await import("./quizSubmissions");
    const submissions = await quizSubmissionsApi.getByQuizId(quizId);
    return submissions.map((s) => ({
      id: s.id,
      quizId: s.quiz_id,
      answers: s.answers,
      contactInfo: s.contact_info,
      completedAt: s.completed_at,
    })) as QuizSubmission[];
  },
};

// Helper to create a blank quiz template
export const createBlankQuiz = (): Omit<
  Quiz,
  "id" | "createdAt" | "updatedAt" | "userId"
> => ({
  title: "Untitled Quiz",
  coverPage: {
    title: "Welcome to the Quiz",
    subtitle: "Find out more about yourself",
    description: "",
    buttonText: "Get Started",
  },
  questions: [
    {
      id: crypto.randomUUID?.() || "q1",
      type: "single_choice",
      question: "Your first question here...",
      options: [
        { id: "opt1", text: "Option A" },
        { id: "opt2", text: "Option B" },
        { id: "opt3", text: "Option C" },
      ],
      required: true,
    },
  ],
  conclusionPage: {
    title: "Thanks for completing the quiz!",
    subtitle: "Here are your results",
    description: "Add your personalized message here...",
    ctaButtons: [{ id: "cta1", text: "Learn More", style: "primary" }],
  },
  contactSettings: defaultContactSettings,
  styles: defaultQuizStyles,
  status: "draft",
});
