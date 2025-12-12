export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-3)
  explanation?: string;
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
  answers: Record<string, number>; // questionId -> selected option index
  score: number;
  startedAt: number;
  completedAt: number;
}
