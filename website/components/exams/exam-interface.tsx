"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"
import { useExamStore } from "@/lib/stores/exam-store"
import { updateExamAnswer, submitExam } from "@/app/actions/exams"
import { toast } from "sonner"
import Link from "next/link"
import { AIExplanationAccordion } from "./ai-explanation-accordion"
import type { QuestionExplanation } from "@/lib/types"

interface ExamInterfaceProps {
  session: any
  document: any
  questions: any[]
  isCompleted: boolean
}

export function ExamInterface({ session, document, questions, isCompleted }: ExamInterfaceProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    currentQuestionIndex,
    answers,
    timeRemaining,
    setCurrentQuestionIndex,
    setAnswer,
    setTimeRemaining,
    setTotalQuestions,
    nextQuestion,
    previousQuestion,
    resetExam
  } = useExamStore()

  const [showResults, setShowResults] = useState(isCompleted)
  const [localAnswers, setLocalAnswers] = useState<Record<string, number>>(session.answers || {})
  const [questionExplanations, setQuestionExplanations] = useState<Record<string, QuestionExplanation>>({})

  // Initialize total questions
  useEffect(() => {
    setTotalQuestions(questions.length)
  }, [questions.length, setTotalQuestions])

  // Initialize timer
  useEffect(() => {
    if (session.timerEnabled && !isCompleted) {
      const endTime = session.timerStartedAt + (session.timerMinutes * 60 * 1000)
      const remaining = Math.max(0, endTime - Date.now())
      setTimeRemaining(remaining)

      const interval = setInterval(() => {
        const newRemaining = Math.max(0, endTime - Date.now())
        setTimeRemaining(newRemaining)

        if (newRemaining === 0) {
          clearInterval(interval)
          handleSubmit()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [session, isCompleted, setTimeRemaining])

  // Sync local answers with store
  useEffect(() => {
    Object.entries(localAnswers).forEach(([questionId, answer]) => {
      setAnswer(questionId, answer)
    })
  }, [localAnswers, setAnswer])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = async (optionIndex: number) => {
    if (isCompleted) return

    const questionId = currentQuestion.id
    const newAnswers = { ...localAnswers, [questionId]: optionIndex }
    setLocalAnswers(newAnswers)
    setAnswer(questionId, optionIndex)

    // Save to server
    startTransition(async () => {
      const result = await updateExamAnswer(session.id, questionId, optionIndex)
      if (result.error) {
        toast.error("Failed to save answer")
      }
    })
  }

  const handleSubmit = async () => {
    if (confirm("Are you sure you want to submit your exam? This cannot be undone.")) {
      startTransition(async () => {
        const result = await submitExam(session.id)

        if (result.error) {
          toast.error(result.error)
          return
        }

        toast.success("Exam submitted!")
        setShowResults(true)
        router.refresh()
      })
    }
  }

  const answeredCount = Object.keys(localAnswers).length
  const isAnswered = localAnswers[currentQuestion?.id] !== undefined

  // Results view
  if (showResults && session.score !== null) {
    const percentage = session.score
    const correctCount = session.correctCount || 0
    const totalQuestions = session.totalQuestions || questions.length

    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/exams">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Exam Results</h1>
            <p className="text-sm text-muted-foreground">{document.title}</p>
          </div>
        </div>

        <Separator />

        {/* Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Your Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{percentage}%</div>
              <p className="text-muted-foreground">
                {correctCount} out of {totalQuestions} correct
              </p>
            </div>

            <Progress value={percentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Question Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Question Breakdown</h2>

          {questions.map((question, index) => {
            const userAnswer = localAnswers[question.id]
            const isCorrect = question.correctAnswers?.includes(userAnswer)

            return (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">Question {index + 1}</CardTitle>
                    {isCorrect ? (
                      <Badge className="bg-success/10 text-success hover:bg-success/20 border border-success/20">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Incorrect
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-medium">{question.questionText}</p>

                  <div className="space-y-2">
                    {question.choices?.map((choice: import("@/lib/types").QuestionChoice, choiceIndex: number) => {
                      const isCorrectAnswer = question.correctAnswers?.includes(choice.index)
                      const isUserAnswer = userAnswer === choiceIndex

                      return (
                        <div
                          key={choiceIndex}
                          className={`p-3 rounded-md border ${
                            isCorrectAnswer
                              ? 'bg-success/10 border-success/20 text-success'
                              : isUserAnswer
                              ? 'bg-destructive/10 border-destructive/20 text-destructive'
                              : 'bg-muted/50 border-border'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-medium shrink-0">
                              {typeof choice.index === 'string' ? choice.index : String.fromCharCode(65 + choiceIndex)}.
                            </span>
                            <span className="flex-1">{choice.text}</span>
                            {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 shrink-0" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* AI Explanation Section */}
                  <div className="mt-4">
                    <AIExplanationAccordion
                      question={question}
                      documentId={document.id}
                      existingExplanation={questionExplanations[question.id] || question.explanation}
                      onExplanationGenerated={(explanation) => {
                        setQuestionExplanations(prev => ({
                          ...prev,
                          [question.id]: explanation
                        }))
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Active exam view
  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header with progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{document.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {session.timerEnabled && timeRemaining !== null && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                <span className={timeRemaining < 60000 ? 'text-destructive' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isPending}
              variant="outline"
              className="border-success/50 text-success hover:bg-success/10 hover:text-success hover:border-success"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Submit Exam
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress: {answeredCount}/{questions.length} answered</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      <Separator />

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.questionText}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.choices?.map((choice: import("@/lib/types").QuestionChoice, index: number) => {
            const isSelected = localAnswers[currentQuestion.id] === index

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-md border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  }`}>
                    {isSelected ? <CheckCircle2 className="h-4 w-4" /> : (typeof choice.index === 'string' ? choice.index : String.fromCharCode(65 + index))}
                  </div>
                  <span className="flex-1">{choice.text}</span>
                </div>
              </button>
            )
          })}

          {/* AI Explanation Section - Active Exam */}
          <div className="mt-6">
            <AIExplanationAccordion
              question={currentQuestion}
              documentId={document.id}
              existingExplanation={questionExplanations[currentQuestion.id] || currentQuestion.explanation}
              onExplanationGenerated={(explanation) => {
                setQuestionExplanations(prev => ({
                  ...prev,
                  [currentQuestion.id]: explanation
                }))
              }}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={nextQuestion}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-success text-success-foreground hover:bg-success/90 hover:shadow-lg hover:shadow-success/20"
            >
              Submit Exam
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
