"use client"

import { Document } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Trash2, FileText, Loader2, AlertCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { deleteDocument } from "@/app/actions/documents"
import { toast } from "sonner"
import { useTransition } from "react"
import { ProcessDocumentDialog } from "./process-dialog"

interface DocumentCardProps {
  doc: Document
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const [isPending, startTransition] = useTransition()

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
      case 'ready': return 'bg-green-500/15 text-green-600 hover:bg-green-500/25 dark:text-green-400'
      case 'processing': return 'bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 dark:text-blue-400'
      case 'uploaded': return 'bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 dark:text-yellow-400'
      case 'failed': return 'bg-red-500/15 text-red-600 hover:bg-red-500/25 dark:text-red-400'
      default: return 'bg-gray-500/15 text-gray-600 hover:bg-gray-500/25 dark:text-gray-400'
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="p-2 bg-muted rounded-md">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <Badge variant="secondary" className={`capitalize ${getStatusColor(doc.status)} border-0`}>
            {doc.status === 'processing' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {doc.status}
          </Badge>
        </div>
        <CardTitle className="mt-4 line-clamp-1 text-lg" title={doc.title}>
          {doc.title}
        </CardTitle>
        <CardDescription>
          Uploaded {formatDistanceToNow(doc.createdAt)} ago
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="text-sm text-muted-foreground">
          {doc.status === 'ready' ? (
            <span className="flex items-center gap-1">
              <span className="font-medium text-foreground">{doc.questionCount}</span> questions generated
            </span>
          ) : doc.status === 'failed' ? (
            <span className="flex items-center gap-1 text-red-500">
              <AlertCircle className="h-3 w-3" />
              {doc.error || 'Processing failed'}
            </span>
          ) : doc.status === 'uploaded' ? (
             <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Clock className="h-3 w-3" />
                Waiting for processing
             </span>
          ) : (
             <span>Analyzing content...</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t bg-muted/20 gap-2">
        {doc.status === 'uploaded' ? (
            <ProcessDocumentDialog docId={doc.id} docTitle={doc.title} />
        ) : (
            <Button 
            className="w-full" 
            disabled={doc.status !== 'ready'}
            >
            <Play className="mr-2 h-4 w-4" />
            Take Exam
            </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
