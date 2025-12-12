"use client"

import { SystemPrompt, CustomPrompt } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { deleteSystemPrompt, deleteCustomPrompt } from "@/app/actions/prompts"
import { toast } from "sonner"
import { useTransition } from "react"

interface PromptCardProps {
  prompt: SystemPrompt | CustomPrompt
  type: "system" | "custom"
}

export function PromptCard({ prompt, type }: PromptCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${prompt.name}"?`)) {
      startTransition(async () => {
        const result = type === "system"
          ? await deleteSystemPrompt(prompt.id)
          : await deleteCustomPrompt(prompt.id)

        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Prompt deleted")
        }
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>
        <CardTitle className="mt-4 line-clamp-1 text-base font-semibold" title={prompt.name}>
          {prompt.name}
        </CardTitle>
        <CardDescription className="text-xs">
          Updated {formatDistanceToNow(prompt.updatedAt)} ago
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {prompt.content}
        </p>
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2">
        <Button variant="outline" size="sm" className="flex-1" disabled>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
