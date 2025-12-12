import { notFound } from "next/navigation"
import { getDocumentDetails } from "@/app/actions/documents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DocumentDetailsPage({ params }: PageProps) {
  const { id } = await params
  const result = await getDocumentDetails(id)

  if (result.error || !result.document) {
    notFound()
  }

  const { document, systemPrompt, customPrompt, questions } = result

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-success/10 text-success hover:bg-success/20 border border-success/20'
      case 'processing': return 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
      case 'uploaded': return 'bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20'
      case 'failed': return 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
      default: return 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/documents">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{document.title}</h1>
          <p className="text-sm text-muted-foreground">
            Uploaded {formatDistanceToNow(document.createdAt)} ago
          </p>
        </div>
        <Badge variant="secondary" className={`capitalize ${getStatusColor(document.status)}`}>
          {document.status}
        </Badge>
      </div>

      <Separator />

      {/* Document Info */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">{document.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Questions:</span>
              <span className="font-medium">{document.questionCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {document.status === 'ready' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Processing Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This document has been successfully processed and is ready for use in exams.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Prompts Used */}
      {(systemPrompt || customPrompt) && (
        <>
          <div className="mt-2">
            <h2 className="text-xl font-semibold mb-4">Processing Configuration</h2>
            <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
              {systemPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">System Prompt</CardTitle>
                    <CardDescription>{systemPrompt.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md bg-muted p-4 text-sm font-mono whitespace-pre-wrap break-words">
                      {systemPrompt.content}
                    </div>
                  </CardContent>
                </Card>
              )}

              {customPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Custom Prompt</CardTitle>
                    <CardDescription>{customPrompt.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md bg-muted p-4 text-sm font-mono whitespace-pre-wrap break-words">
                      {customPrompt.content}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {document.schema && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Schema</CardTitle>
                  <CardDescription>Custom JSON schema used for processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-muted p-4 text-sm font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                    {document.schema}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Generated Questions */}
      {questions && questions.length > 0 && (
        <div className="mt-2">
          <h2 className="text-xl font-semibold mb-4">Generated Questions ({questions.length})</h2>
          <div className="space-y-4">
            {questions.map((question: any, index: number) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-base">Question {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-medium">{question.text}</p>

                  <div className="space-y-2">
                    {question.options?.map((option: string, optionIndex: number) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-md border ${
                          optionIndex === question.correctAnswer
                            ? 'bg-success/10 border-success/20 text-success'
                            : 'bg-muted/50 border-border'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-medium shrink-0">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className="flex-1">{option}</span>
                          {optionIndex === question.correctAnswer && (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="rounded-md bg-muted/50 p-3 border border-border">
                      <p className="text-sm font-medium mb-1">Explanation:</p>
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {questions && questions.length === 0 && document.status === 'ready' && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No questions generated yet.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
