export interface QuestionExplanation {
  content: string;
  promptId: string;
  promptName: string;
  promptType: 'system' | 'custom';
  generatedAt: number;
}

export interface QuestionChoice {
  index: string | number;
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  type?: 'single_select' | 'multi_select';
  choices: QuestionChoice[];
  correctAnswers: (string | number)[]; // Array of correct choice indices
  explanation?: QuestionExplanation;
}

export type DocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed';

export interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  questionCount: number;
  createdAt: number;
  filePath?: string;
  progress?: number; // 0-100
  currentStep?: string; // e.g., "Analyzing PDF...", "Generating questions..."
  error?: string;
}

export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomPrompt {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Exam {
  id: string;
  documentId: string;
  title: string;
  questions: Question[];
  score?: number;
  createdAt: number;
  completedAt?: number;
}

export interface ExamSession {
  id: string;
  documentId: string;
  userId?: string;
  questionIds?: string[]; // All question IDs in this exam (in order)
  answers: Record<string, number | number[]>; // questionId -> selected option index (single) or indices (multi-select)
  score: number;
  startedAt: number;
  completedAt: number;
  timerEnabled?: boolean;
  timerMinutes?: number | null;
  timerStartedAt?: number;
  totalQuestions?: number;
  correctCount?: number;
  currentQuestionIndex?: number; // NEW: 0-based index of current question
  lastActivityAt?: number; // NEW: Timestamp of last interaction
}
