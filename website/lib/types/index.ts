export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-3)
  explanation?: string;
}

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface Document {
  id: string;
  title: string;
  content?: string; // Optional: raw text content (might be large, so maybe don't fetch by default)
  status: DocumentStatus;
  questionCount: number;
  createdAt: number; // Timestamp
  error?: string; // Error message if status is 'failed'
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
