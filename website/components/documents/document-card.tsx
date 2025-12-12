"use client"

import { Document } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Trash2, FileText, Loader2, AlertCircle, Clock, Info } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { deleteDocument, getDocumentStatus } from "@/app/actions/documents"
import { toast } from "sonner"
import { useTransition, useEffect, useState } from "react"
import { ProcessDocumentDialog } from "./process-dialog"

interface DocumentCardProps {
  doc: Document
}

export function DocumentCard({ doc: initialDoc }: DocumentCardProps) {
  const [isPending, startTransition] = useTransition()
  const [doc, setDoc] = useState<Document>(initialDoc)

  // Poll for status updates when processing
  useEffect(() => {
    if (doc.status !== 'processing') {
      return
    }

    let isActive = true

    const pollInterval = setInterval(async () => {
      if (!isActive) return

      try {
        const result = await getDocumentStatus(doc.id)

        if (!isActive) return

        if (result.error) {
          // Document might have been deleted, stop polling
          console.warn("Stopping poll - document not found:", doc.id)
          clearInterval(pollInterval)
          return
        }

        if (result.document) {
          setDoc(result.document)

          // Stop polling if no longer processing
          if (result.document.status !== 'processing') {
            clearInterval(pollInterval)

            // Show notification
            if (result.document.status === 'ready') {
              toast.success(`${result.document.questionCount} questions generated!`)
            } else if (result.document.status === 'failed') {
              toast.error(result.document.error || 'Processing failed')
            }
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
        if (!isActive) return
      }
    }, 2500) // Poll every 2.5 seconds

    return () => {
      isActive = false
      clearInterval(pollInterval)
    }
  }, [doc.id, doc.status])

  // Update local state when prop changes
  useEffect(() => {
    setDoc(initialDoc)
  }, [initialDoc])

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this document?")) {
      startTransition(async () => {
        const result = await deleteDocument(doc.id)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Document deleted")
        }
      })
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'ready': return 'bg-success/10 text-success hover:bg-success/20 border border-success/20'
      case 'processing': return 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
      case 'uploaded': return 'bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20'
      case 'failed': return 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
      default: return 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
    }
  }

  return (
    <Card className="group relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <Badge variant="secondary" className={`capitalize ${getStatusColor(doc.status)}`}>
            {doc.status === 'processing' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {doc.status}
          </Badge>
        </div>
        <CardTitle className="mt-4 line-clamp-1 text-base font-semibold" title={doc.title}>
          {doc.title}
        </CardTitle>
        <CardDescription className="text-xs">
          Uploaded {formatDistanceToNow(doc.createdAt)} ago
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {doc.status === 'ready' ? (
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">{doc.questionCount}</span> questions generated
              </span>
            ) : doc.status === 'failed' ? (
              <span className="flex items-center gap-1 text-destructive" title={doc.error || 'Processing failed'}>
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-2">
                  {doc.error?.includes('PDF file not found')
                    ? 'File not found - please re-upload'
                    : doc.error?.includes('Failed after')
                    ? 'Processing failed after multiple attempts'
                    : doc.error || 'Processing failed'}
                </span>
              </span>
            ) : doc.status === 'processing' ? (
               <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {doc.currentStep || 'Processing document...'}
               </span>
            ) : null}
          </div>

          {doc.status === 'processing' && doc.progress !== undefined && (
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 ease-in-out"
                style={{ width: `${doc.progress}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2">
        <div className="flex w-full gap-2">
          {doc.status === 'uploaded' ? (
              <div className="flex-1">
                <ProcessDocumentDialog docId={doc.id} docTitle={doc.title} />
              </div>
          ) : (
              <Button
              className="flex-1"
              disabled={doc.status !== 'ready'}
              >
              <Play className="mr-2 h-4 w-4" />
              Take Exam
              </Button>
          )}

          {doc.status === 'ready' && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-primary shrink-0"
              asChild
            >
              <Link href={`/documents/${doc.id}`}>
                <Info className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
