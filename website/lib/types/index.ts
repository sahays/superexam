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
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  questionCount: number;
  createdAt: number;
  error?: string;
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
