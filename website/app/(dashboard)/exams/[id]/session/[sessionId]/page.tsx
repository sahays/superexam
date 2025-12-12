import { notFound } from "next/navigation"
import { getExamSession, getExamQuestions } from "@/app/actions/exams"
import { getDocumentDetails } from "@/app/actions/documents"
import { ExamInterface } from "@/components/exams/exam-interface"

interface PageProps {
  params: Promise<{
    id: string
    sessionId: string
  }>
}

export default async function ExamSessionPage({ params }: PageProps) {
  const { id, sessionId } = await params

  const [sessionResult, docResult] = await Promise.all([
    getExamSession(sessionId),
    getDocumentDetails(id)
  ])

  if (sessionResult.error || !sessionResult.session) {
    notFound()
  }

  if (docResult.error || !docResult.document) {
    notFound()
  }

  const { session } = sessionResult
  const { document } = docResult

  // If exam is already completed, show results
  if (session.completedAt) {
    // Fetch questions for results
    const questionsResult = await getExamQuestions(id, session.questionIds)

    if (questionsResult.error || !questionsResult.questions) {
      notFound()
    }

    return (
      <ExamInterface
        session={session}
        document={document}
        questions={questionsResult.questions}
        isCompleted={true}
      />
    )
  }

  // Fetch questions for active exam
  const questionsResult = await getExamQuestions(id, session.questionIds)

  if (questionsResult.error || !questionsResult.questions) {
    notFound()
  }

  return (
    <ExamInterface
      session={session}
      document={document}
      questions={questionsResult.questions}
      isCompleted={false}
    />
  )
}
