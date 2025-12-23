import { create } from 'zustand'

interface ExamState {
  currentQuestionIndex: number
  answers: Record<string, number | number[]>
  timeRemaining: number | null
  totalQuestions: number

  setCurrentQuestionIndex: (index: number) => void
  setAnswer: (questionId: string, answer: number | number[]) => void
  toggleMultiSelectAnswer: (questionId: string, optionIndex: number) => void
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

  toggleMultiSelectAnswer: (questionId, optionIndex) =>
    set((state) => {
      const currentAnswers = state.answers[questionId]
      const answersArray = Array.isArray(currentAnswers) ? currentAnswers : []

      const newAnswers = answersArray.includes(optionIndex)
        ? answersArray.filter(idx => idx !== optionIndex) // Remove if already selected
        : [...answersArray, optionIndex] // Add if not selected

      return {
        answers: { ...state.answers, [questionId]: newAnswers }
      }
    }),

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
