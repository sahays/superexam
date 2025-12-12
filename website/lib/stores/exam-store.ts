import { create } from 'zustand'

interface ExamState {
  currentQuestionIndex: number
  answers: Record<string, number>
  timeRemaining: number | null
  totalQuestions: number

  setCurrentQuestionIndex: (index: number) => void
  setAnswer: (questionId: string, answer: number) => void
  setTimeRemaining: (time: number) => void
  setTotalQuestions: (total: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  resetExam: () => void
}

export const useExamStore = create<ExamState>((set) => ({
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: null,
  totalQuestions: 0,

  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer }
    })),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  setTotalQuestions: (total) => set({ totalQuestions: total }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.totalQuestions - 1,
        state.currentQuestionIndex + 1
      )
    })),

  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
    })),

  resetExam: () =>
    set({
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: null,
      totalQuestions: 0
    }),
}))
