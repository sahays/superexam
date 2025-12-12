import { notFound, redirect } from "next/navigation"
import { getDocumentDetails } from "@/app/actions/documents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Play, FileText } from "lucide-react"
import Link from "next/link"
import { ExamConfigForm } from "@/components/exams/exam-config-form"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ExamConfigurePage({ params }: PageProps) {
  const { id } = await params
  const result = await getDocumentDetails(id)

  if (result.error || !result.document) {
    notFound()
  }

  const { document, questions } = result

  if (document.status !== 'ready' || !questions || questions.length === 0) {
    redirect('/exams')
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/exams">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Configure Exam</h1>
          <p className="text-sm text-muted-foreground">{document.title}</p>
        </div>
      </div>

      <Separator />

      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Questions:</span>
            <span className="font-medium">{questions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <ExamConfigForm documentId={id} totalQuestions={questions.length} />
    </div>
  )
}
