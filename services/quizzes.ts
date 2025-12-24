// Quiz service with mock data
// Your team can replace this with Supabase integration

import { 
  Quiz, 
  QuizSubmission, 
  defaultQuizStyles, 
  defaultContactSettings 
} from '@/types/quiz';

const STORAGE_KEY = 'blogish_quizzes';
const SUBMISSIONS_KEY = 'blogish_quiz_submissions';

// Knee Self-Assessment Quiz
const sampleQuiz: Quiz = {
  id: 'sample-quiz-1',
  title: 'Knee Self-Assessment',
  slug: 'knee-assessment',
  coverPage: {
    title: 'Knee Self-Assessment',
    subtitle: '10 questions to understand your knee health',
    description: 'This quick assessment helps identify patterns in your knee discomfort. Your answers will reveal whether you\'re dealing with a load management issue, mobility limitation, or something that needs professional attention.',
    buttonText: 'Start Assessment',
  },
  questions: [
    {
      id: 'q1',
      type: 'single_choice',
      question: 'Where exactly do you feel pain or discomfort?',
      description: 'Location often tells you what structure is overloaded, not just "the knee."',
      options: [
        { id: 'q1-a', text: 'Front of the knee or below the kneecap', value: 'anterior' },
        { id: 'q1-b', text: 'Inside of the knee (medial)', value: 'medial' },
        { id: 'q1-c', text: 'Outside of the knee (lateral)', value: 'lateral' },
        { id: 'q1-d', text: 'Behind the knee', value: 'posterior' },
        { id: 'q1-e', text: 'General or diffuse — hard to pinpoint', value: 'diffuse' },
      ],
      required: true,
    },
    {
      id: 'q2',
      type: 'single_choice',
      question: 'When does it hurt the most?',
      description: 'Timing matters more than intensity.',
      options: [
        { id: 'q2-a', text: 'Deep squats or lunges', value: 'deep-flexion' },
        { id: 'q2-b', text: 'Going up or down stairs', value: 'stairs' },
        { id: 'q2-c', text: 'Running or jumping', value: 'impact' },
        { id: 'q2-d', text: 'Sitting for long periods', value: 'prolonged-sitting' },
        { id: 'q2-e', text: 'After activity, not during', value: 'post-activity' },
      ],
      required: true,
    },
    {
      id: 'q3',
      type: 'single_choice',
      question: 'Does it hurt during movement, after movement, or the next day?',
      description: 'This pattern helps distinguish between load intolerance, recovery issues, and tissue capacity problems.',
      options: [
        { id: 'q3-a', text: 'Pain during movement (load intolerance)', value: 'during' },
        { id: 'q3-b', text: 'Pain after movement (recovery issue)', value: 'after' },
        { id: 'q3-c', text: 'Pain the next day (tissue capacity problem)', value: 'delayed' },
        { id: 'q3-d', text: 'Variable — depends on the day', value: 'variable' },
      ],
      required: true,
    },
    {
      id: 'q4',
      type: 'single_choice',
      question: 'Does one knee feel different from the other?',
      description: 'Asymmetry is one of the biggest predictors of chronic issues.',
      options: [
        { id: 'q4-a', text: 'Yes, one feels weaker', value: 'weaker' },
        { id: 'q4-b', text: 'Yes, one feels stiffer', value: 'stiffer' },
        { id: 'q4-c', text: 'Yes, one feels less stable or confident', value: 'unstable' },
        { id: 'q4-d', text: 'They feel about the same', value: 'symmetrical' },
      ],
      required: true,
    },
    {
      id: 'q5',
      type: 'single_choice',
      question: 'Do your knees cave in, drift out, or shift forward when you squat or step down?',
      description: 'The knee usually reflects what the hips and ankles can\'t control.',
      options: [
        { id: 'q5-a', text: 'Knees cave inward', value: 'valgus' },
        { id: 'q5-b', text: 'Knees drift outward', value: 'varus' },
        { id: 'q5-c', text: 'Knees shift forward excessively', value: 'forward-shift' },
        { id: 'q5-d', text: 'Movement looks and feels controlled', value: 'controlled' },
        { id: 'q5-e', text: 'I\'m not sure — I haven\'t checked', value: 'unknown' },
      ],
      required: true,
    },
    {
      id: 'q6',
      type: 'single_choice',
      question: 'How deep can you bend your knee comfortably?',
      description: 'Limited knee flexion often isn\'t a knee problem — it\'s a quad, ankle, or hip issue.',
      options: [
        { id: 'q6-a', text: 'Full bend (heel to glute)', value: 'full' },
        { id: 'q6-b', text: 'Partial bend (about 90 degrees)', value: 'partial' },
        { id: 'q6-c', text: 'Shallow bend only', value: 'shallow' },
        { id: 'q6-d', text: 'Bending causes pain before I hit a limit', value: 'pain-limited' },
      ],
      required: true,
    },
    {
      id: 'q7',
      type: 'single_choice',
      question: 'Do you feel stiffness when you wake up or after sitting?',
      description: 'Morning stiffness vs movement-based stiffness tell different stories. Stiffness doesn\'t equal damage, but it signals tissue adaptability.',
      options: [
        { id: 'q7-a', text: 'Stiff in the morning, loosens up quickly', value: 'morning-brief' },
        { id: 'q7-b', text: 'Stiff in the morning, takes a while to loosen', value: 'morning-prolonged' },
        { id: 'q7-c', text: 'Stiff after sitting, but fine in the morning', value: 'sitting-only' },
        { id: 'q7-d', text: 'No notable stiffness', value: 'none' },
      ],
      required: true,
    },
    {
      id: 'q8',
      type: 'single_choice',
      question: 'How does your knee respond to load over time?',
      description: 'Improving with movement is usually a capacity issue, not injury.',
      options: [
        { id: 'q8-a', text: 'Warms up and feels better as I move', value: 'improves' },
        { id: 'q8-b', text: 'Feels worse the more I use it', value: 'worsens' },
        { id: 'q8-c', text: 'Stays about the same regardless of activity', value: 'stable' },
        { id: 'q8-d', text: 'Unpredictable — varies day to day', value: 'unpredictable' },
      ],
      required: true,
    },
    {
      id: 'q9',
      type: 'single_choice',
      question: 'Can you control slow movements on one leg?',
      description: 'Poor control under slow load is often more important than max strength. Think step-downs, lunges, or single-leg stairs.',
      options: [
        { id: 'q9-a', text: 'Yes, feels stable and confident', value: 'confident' },
        { id: 'q9-b', text: 'Somewhat — a little shaky but manageable', value: 'moderate' },
        { id: 'q9-c', text: 'No — feels unstable or I avoid it', value: 'poor' },
        { id: 'q9-d', text: 'I haven\'t tested this recently', value: 'untested' },
      ],
      required: true,
    },
    {
      id: 'q10',
      type: 'multiple_choice',
      question: 'Have you changed anything recently?',
      description: 'Knees hate sudden change, not movement itself. Select all that apply.',
      options: [
        { id: 'q10-a', text: 'Training volume or intensity', value: 'training' },
        { id: 'q10-b', text: 'Shoes or footwear', value: 'shoes' },
        { id: 'q10-c', text: 'Walking or running surfaces', value: 'surfaces' },
        { id: 'q10-d', text: 'Body weight', value: 'weight' },
        { id: 'q10-e', text: 'Sleep or stress levels', value: 'lifestyle' },
        { id: 'q10-f', text: 'Daily routine or activity patterns', value: 'routine' },
        { id: 'q10-g', text: 'Nothing significant has changed', value: 'none' },
      ],
      required: true,
    },
  ],
  conclusionPage: {
    title: 'Assessment Complete',
    subtitle: 'Here\'s what your answers suggest',
    description: 'Based on your responses, we can identify patterns that point toward specific mobility or strength limitations. Remember: knee pain is rarely isolated. The knee is a force transfer joint — most issues are load-management problems, not structural damage.',
    showScore: false,
    ctaButtons: [
      { id: 'cta1', text: 'Get Your Personalized Plan', style: 'primary' },
      { id: 'cta2', text: 'Book a Consultation', url: '#', style: 'secondary' },
    ],
  },
  contactSettings: {
    ...defaultContactSettings,
    title: 'Get your personalized results',
    description: 'We\'ll send a breakdown of your assessment with recommended next steps.',
  },
  styles: {
    ...defaultQuizStyles,
    primaryColor: '#18181b',
    secondaryColor: '#3b82f6',
    accentColor: '#2563eb',
    backgroundColor: '#f8fafc',
    cardBackgroundColor: '#ffffff',
    textColor: '#0f172a',
    borderRadius: 'medium',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'local-user',
  status: 'published',
};

// Helper to generate UUID
const generateId = (): string => {
  return crypto.randomUUID?.() || 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

// Get quizzes from localStorage
const getStoredQuizzes = (): Quiz[] => {
  if (typeof window === 'undefined') return [sampleQuiz];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with sample quiz
      localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleQuiz]));
      return [sampleQuiz];
    }
    return JSON.parse(stored);
  } catch {
    return [sampleQuiz];
  }
};

// Save quizzes to localStorage
const saveQuizzes = (quizzes: Quiz[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
};

// Get submissions from localStorage
const getStoredSubmissions = (): QuizSubmission[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SUBMISSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save submissions to localStorage
const saveSubmissions = (submissions: QuizSubmission[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
};

export const quizzesApi = {
  async getAll(): Promise<Quiz[]> {
    return getStoredQuizzes();
  },

  async getById(id: string): Promise<Quiz | null> {
    const quizzes = getStoredQuizzes();
    return quizzes.find(q => q.id === id) || null;
  },

  async getBySlug(slug: string): Promise<Quiz | null> {
    const quizzes = getStoredQuizzes();
    return quizzes.find(q => q.slug === slug) || null;
  },

  async create(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Quiz> {
    const quizzes = getStoredQuizzes();
    const now = new Date().toISOString();
    
    const newQuiz: Quiz = {
      ...quiz,
      id: generateId(),
      userId: 'local-user',
      createdAt: now,
      updatedAt: now,
    };
    
    quizzes.unshift(newQuiz);
    saveQuizzes(quizzes);
    
    return newQuiz;
  },

  async update(id: string, updates: Partial<Quiz>): Promise<Quiz | null> {
    const quizzes = getStoredQuizzes();
    const index = quizzes.findIndex(q => q.id === id);
    
    if (index === -1) return null;
    
    const updatedQuiz: Quiz = {
      ...quizzes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    quizzes[index] = updatedQuiz;
    saveQuizzes(quizzes);
    
    return updatedQuiz;
  },

  async delete(id: string): Promise<boolean> {
    const quizzes = getStoredQuizzes();
    const filtered = quizzes.filter(q => q.id !== id);
    
    if (filtered.length === quizzes.length) return false;
    
    saveQuizzes(filtered);
    return true;
  },

  async submitQuiz(submission: Omit<QuizSubmission, 'id' | 'completedAt'>): Promise<QuizSubmission> {
    const submissions = getStoredSubmissions();
    
    const newSubmission: QuizSubmission = {
      ...submission,
      id: generateId(),
      completedAt: new Date().toISOString(),
    };
    
    submissions.unshift(newSubmission);
    saveSubmissions(submissions);
    
    return newSubmission;
  },

  async getSubmissions(quizId: string): Promise<QuizSubmission[]> {
    const submissions = getStoredSubmissions();
    return submissions.filter(s => s.quizId === quizId);
  },
};

// Helper to create a blank quiz template
export const createBlankQuiz = (): Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'userId'> => ({
  title: 'Untitled Quiz',
  coverPage: {
    title: 'Welcome to the Quiz',
    subtitle: 'Find out more about yourself',
    description: '',
    buttonText: 'Get Started',
  },
  questions: [
    {
      id: generateId(),
      type: 'single_choice',
      question: 'Your first question here...',
      options: [
        { id: generateId(), text: 'Option A' },
        { id: generateId(), text: 'Option B' },
        { id: generateId(), text: 'Option C' },
      ],
      required: true,
    },
  ],
  conclusionPage: {
    title: 'Thanks for completing the quiz!',
    subtitle: 'Here are your results',
    description: 'Add your personalized message here...',
    ctaButtons: [
      { id: generateId(), text: 'Learn More', style: 'primary' },
    ],
  },
  contactSettings: defaultContactSettings,
  styles: defaultQuizStyles,
  status: 'draft',
});
