import { getDocuments } from "@/lib/db/documents"
import { getExamSessions } from "@/app/actions/exams"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Play, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function ExamsPage() {
  const documents = await getDocuments()
  const readyDocuments = documents.filter(doc => doc.status === 'ready' && doc.questionCount > 0)

  const sessionsResult = await getExamSessions()
  const allSessions = sessionsResult.sessions || []
  const completedSessions = allSessions.filter(s => s.completedAt !== null)
  const incompleteSessions = allSessions.filter(s => s.completedAt === null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="text-muted-foreground">
          Select a document to start practicing with exam questions
        </p>
      </div>

      <Separator />

      {/* Incomplete Exams Section */}
      {incompleteSessions.length > 0 && (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              In Progress
            </h2>
            <p className="text-sm text-muted-foreground">
              Resume your incomplete exams
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {incompleteSessions.map((session: any) => (
              <Card key={session.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-warning/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-warning border-warning/20">
                      In Progress
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 line-clamp-2 text-base font-semibold" title={session.documentTitle}>
                    {session.documentTitle}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Started {formatDistanceToNow(session.startedAt)} ago
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-semibold">{session.totalQuestions}</span>
                  </div>

                  <Separator />

                  <Button className="w-full" asChild>
                    <Link href={`/exams/${session.documentId}/session/${session.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Resume Exam
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />
        </>
      )}

      {/* Completed Exams Section */}
      {completedSessions.length > 0 && (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Completed Exams
            </h2>
            <p className="text-sm text-muted-foreground">
              Review your past exam results
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completedSessions.map((session: any) => (
              <Card key={session.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg shrink-0 ${
                      session.score >= 70
                        ? 'bg-success/10 text-success'
                        : session.score >= 50
                        ? 'bg-warning/10 text-warning'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span className="text-lg font-bold">{session.score}%</span>
                    </div>
                    <Badge className={
                      session.score >= 70
                        ? 'bg-success/10 text-success hover:bg-success/20 border border-success/20'
                        : session.score >= 50
                        ? 'bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20'
                        : 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
                    }>
                      {session.score >= 70 ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 line-clamp-2 text-base font-semibold" title={session.documentTitle}>
                    {session.documentTitle}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Completed {formatDistanceToNow(session.completedAt)} ago
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-semibold">{session.correctCount}/{session.totalQuestions}</span>
                  </div>

                  <Separator />

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/exams/${session.documentId}/session/${session.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Results
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />
        </>
      )}

      {/* Start New Exam Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Start New Exam</h2>
        <p className="text-sm text-muted-foreground">
          Choose a document to begin a new exam
        </p>
      </div>

      {readyDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-[10px] bg-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No documents ready for exams</h3>
          <p className="mb-6 text-sm text-muted-foreground max-w-sm">
            Process some documents first to generate exam questions.
          </p>
          <Button asChild>
            <Link href="/documents">
              <FileText className="mr-2 h-4 w-4" />
              Go to Documents
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {readyDocuments.map((doc) => (
            <Card key={doc.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <CardTitle className="mt-4 line-clamp-2 text-base font-semibold" title={doc.title}>
                  {doc.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Uploaded {formatDistanceToNow(doc.createdAt)} ago
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Questions available:</span>
                  <span className="font-semibold text-primary">{doc.questionCount}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href={`/exams/${doc.id}/configure`}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Exam
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/documents/${doc.id}`}>
                      View Questions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
